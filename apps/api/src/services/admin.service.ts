import { db } from "../db/index.js";
import { disputes } from "../db/schema/disputes.js";
import { escrowTransactions, escrowStatusHistory } from "../db/schema/escrow.js";
import { wallets, walletTransactions } from "../db/schema/wallet.js";
import { withdrawals } from "../db/schema/withdrawals.js";
import { activityLogs } from "../db/schema/activity-log.js";
import { kycSubmissions } from "../db/schema/kyc.js";
import { eq, desc, count, or } from "drizzle-orm";
import type { ResolveDisputeInput } from "../types/index.js";

/**
 * Open a dispute on an escrow
 */
export async function openDispute(
  escrowId: string,
  userId: string,
  reason: string,
  evidenceUrls?: string[]
) {
  // Verify escrow exists and user is a party
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, escrowId))
    .limit(1);

  if (!escrow) throw new Error("Escrow not found");
  if (escrow.buyerId !== userId && escrow.sellerId !== userId) {
    throw new Error("Access denied");
  }

  // Only processing or shipped escrows can be disputed
  if (!["processing", "shipped"].includes(escrow.status)) {
    throw new Error("Escrow cannot be disputed in current state");
  }

  // Create dispute
  const [dispute] = await db
    .insert(disputes)
    .values({
      escrowId,
      filedBy: userId,
      reason,
      evidenceUrls: evidenceUrls || null,
    })
    .returning();

  // Update escrow status
  await db
    .update(escrowTransactions)
    .set({ status: "disputed", updatedAt: new Date() })
    .where(eq(escrowTransactions.id, escrowId));

  // Log status change
  await db.insert(escrowStatusHistory).values({
    escrowId,
    fromStatus: escrow.status,
    toStatus: "disputed",
    changedBy: userId,
    note: `Dispute opened: ${reason}`,
  });

  return dispute;
}

/**
 * [Admin] List all disputes
 */
export async function listDisputes(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  const items = await db
    .select()
    .from(disputes)
    .orderBy(desc(disputes.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [totalResult] = await db.select({ count: count() }).from(disputes);

  return {
    disputes: items,
    total: totalResult?.count || 0,
    page,
    pageSize,
  };
}

/**
 * [Admin] Resolve a dispute
 */
export async function resolveDispute(
  disputeId: string,
  adminUserId: string,
  input: ResolveDisputeInput
) {
  const [dispute] = await db
    .select()
    .from(disputes)
    .where(eq(disputes.id, disputeId))
    .limit(1);

  if (!dispute) throw new Error("Dispute not found");

  // Get escrow
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, dispute.escrowId))
    .limit(1);

  if (!escrow) throw new Error("Escrow not found");

  // Update dispute
  await db
    .update(disputes)
    .set({
      status: input.resolution,
      assignedAdmin: adminUserId,
      resolutionNote: input.note,
      resolvedAt: new Date(),
    })
    .where(eq(disputes.id, disputeId));

  const totalAmount = parseFloat(escrow.totalAmount);
  const amount = parseFloat(escrow.amount);

  if (input.resolution === "resolved_buyer") {
    // Refund buyer: unlock funds back to balance
    const [buyerWallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, escrow.buyerId))
      .limit(1);

    if (buyerWallet) {
      const newBalance = parseFloat(buyerWallet.balance) + totalAmount;
      const newLocked = parseFloat(buyerWallet.lockedBalance) - totalAmount;

      await db
        .update(wallets)
        .set({
          balance: String(newBalance),
          lockedBalance: String(Math.max(0, newLocked)),
          updatedAt: new Date(),
        })
        .where(eq(wallets.userId, escrow.buyerId));

      await db.insert(walletTransactions).values({
        walletId: buyerWallet.id,
        escrowId: escrow.id,
        type: "escrow_refund",
        amount: String(totalAmount),
        balanceAfter: String(newBalance),
        description: `Refund from dispute resolution — ${escrow.txCode}`,
        status: "completed",
      });
    }

    await db
      .update(escrowTransactions)
      .set({ status: "refunded", updatedAt: new Date() })
      .where(eq(escrowTransactions.id, escrow.id));

    await db.insert(escrowStatusHistory).values({
      escrowId: escrow.id,
      fromStatus: "disputed",
      toStatus: "refunded",
      changedBy: adminUserId,
      note: `Dispute resolved in favor of buyer: ${input.note}`,
    });
  } else {
    // Release to seller
    const [buyerWallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, escrow.buyerId))
      .limit(1);

    if (buyerWallet) {
      await db
        .update(wallets)
        .set({
          lockedBalance: String(
            Math.max(0, parseFloat(buyerWallet.lockedBalance) - totalAmount)
          ),
          updatedAt: new Date(),
        })
        .where(eq(wallets.userId, escrow.buyerId));
    }

    const [sellerWallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, escrow.sellerId))
      .limit(1);

    if (sellerWallet) {
      const newBalance = parseFloat(sellerWallet.balance) + amount;
      await db
        .update(wallets)
        .set({ balance: String(newBalance), updatedAt: new Date() })
        .where(eq(wallets.userId, escrow.sellerId));

      await db.insert(walletTransactions).values({
        walletId: sellerWallet.id,
        escrowId: escrow.id,
        type: "escrow_release",
        amount: String(amount),
        balanceAfter: String(newBalance),
        description: `Dispute resolved in seller's favor — ${escrow.txCode}`,
        status: "completed",
      });
    }

    await db
      .update(escrowTransactions)
      .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
      .where(eq(escrowTransactions.id, escrow.id));

    await db.insert(escrowStatusHistory).values({
      escrowId: escrow.id,
      fromStatus: "disputed",
      toStatus: "completed",
      changedBy: adminUserId,
      note: `Dispute resolved in favor of seller: ${input.note}`,
    });
  }

  return { success: true };
}

/**
 * [Admin] Dashboard stats
 */
export async function getAdminStats() {
  const [pendingKyc] = await db
    .select({ count: count() })
    .from(kycSubmissions)
    .where(eq(kycSubmissions.status, "pending"));

  const [openDisputes] = await db
    .select({ count: count() })
    .from(disputes)
    .where(or(eq(disputes.status, "open"), eq(disputes.status, "under_review")));

  const [pendingWithdrawals] = await db
    .select({ count: count() })
    .from(withdrawals)
    .where(eq(withdrawals.status, "pending"));

  const [totalEscrows] = await db
    .select({ count: count() })
    .from(escrowTransactions);

  return {
    pendingKycCount: pendingKyc?.count || 0,
    openDisputeCount: openDisputes?.count || 0,
    pendingWithdrawalCount: pendingWithdrawals?.count || 0,
    totalEscrowCount: totalEscrows?.count || 0,
  };
}

/**
 * [Admin] Process withdrawal
 */
export async function processWithdrawal(
  withdrawalId: string,
  adminUserId: string,
  approve: boolean
) {
  const [withdrawal] = await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.id, withdrawalId))
    .limit(1);

  if (!withdrawal) throw new Error("Withdrawal not found");

  if (approve) {
    await db
      .update(withdrawals)
      .set({
        status: "completed",
        processedBy: adminUserId,
        processedAt: new Date(),
      })
      .where(eq(withdrawals.id, withdrawalId));
  } else {
    // Rejected — refund to wallet
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, withdrawal.userId))
      .limit(1);

    if (wallet) {
      const newBalance = parseFloat(wallet.balance) + parseFloat(withdrawal.amount);
      await db
        .update(wallets)
        .set({ balance: String(newBalance), updatedAt: new Date() })
        .where(eq(wallets.userId, withdrawal.userId));
    }

    await db
      .update(withdrawals)
      .set({
        status: "rejected",
        processedBy: adminUserId,
        processedAt: new Date(),
      })
      .where(eq(withdrawals.id, withdrawalId));
  }

  return { success: true };
}

/**
 * Get global activity log
 */
export async function getActivityLog(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;

  return db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(pageSize)
    .offset(offset);
}

/**
 * Log an activity
 */
export async function logActivity(
  userId: string | null,
  action: string,
  description: string,
  metadata?: Record<string, unknown>
) {
  await db.insert(activityLogs).values({
    userId,
    action,
    description,
    metadata: metadata || null,
  });
}

/**
 * [Admin] Get all pending KYC submissions
 */
export async function getPendingKyc() {
  const { userProfiles } = await import("../db/schema/users.js");
  
  return db
    .select({
      id: kycSubmissions.id,
      userId: kycSubmissions.userId,
      username: userProfiles.username,
      fullName: kycSubmissions.fullName,
      nik: kycSubmissions.nik,
      birthDate: kycSubmissions.birthDate,
      ktpFileUrl: kycSubmissions.ktpFileUrl,
      selfieFileUrl: kycSubmissions.selfieFileUrl,
      status: kycSubmissions.status,
      submittedAt: kycSubmissions.submittedAt,
    })
    .from(kycSubmissions)
    .innerJoin(userProfiles, eq(userProfiles.userId, kycSubmissions.userId))
    .where(eq(kycSubmissions.status, "pending"))
    .orderBy(desc(kycSubmissions.submittedAt));
}

/**
 * [Admin] Process KYC (Approve / Reject)
 */
export async function processKyc(
  targetUserId: string,
  adminId: string,
  isApproved: boolean
) {
  const { and } = await import("drizzle-orm");
  const { userProfiles } = await import("../db/schema/users.js");

  // Find pending submission for this user
  const [submission] = await db
    .select()
    .from(kycSubmissions)
    .where(
      and(
        eq(kycSubmissions.userId, targetUserId),
        eq(kycSubmissions.status, "pending")
      )
    )
    .orderBy(desc(kycSubmissions.submittedAt))
    .limit(1);

  if (!submission) {
    throw new Error("No pending KYC submission found for this user");
  }

  if (isApproved) {
    await db
      .update(kycSubmissions)
      .set({
        status: "approved",
        reviewedBy: adminId,
        reviewedAt: new Date(),
      })
      .where(eq(kycSubmissions.id, submission.id));

    await db
      .update(userProfiles)
      .set({ kycStatus: "verified", updatedAt: new Date() })
      .where(eq(userProfiles.userId, targetUserId));
  } else {
    await db
      .update(kycSubmissions)
      .set({
        status: "rejected",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: "Rejected by admin",
      })
      .where(eq(kycSubmissions.id, submission.id));

    await db
      .update(userProfiles)
      .set({ kycStatus: "rejected", updatedAt: new Date() })
      .where(eq(userProfiles.userId, targetUserId));
  }

  await logActivity(
    adminId,
    `kyc_${isApproved ? "approve" : "reject"}`,
    `Admin ${isApproved ? "approved" : "rejected"} KYC for user ${targetUserId}`
  );

  return { success: true };
}

/**
 * [Admin] Promote a user to admin role
 */
export async function promoteToAdmin(targetUserId: string, adminId: string) {
  const { userProfiles } = await import("../db/schema/users.js");
  
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, targetUserId))
    .limit(1);

  if (!profile) {
    throw new Error("User profile not found");
  }

  if (profile.role === "admin") {
    throw new Error("User is already an admin");
  }

  // Update role
  await db
    .update(userProfiles)
    .set({ role: "admin", updatedAt: new Date() })
    .where(eq(userProfiles.userId, targetUserId));

  // Log activity
  await logActivity(
    adminId,
    "promote_to_admin",
    `Admin ${adminId} promoted user ${targetUserId} (${profile.username}) to admin role`
  );

  return { success: true };
}
