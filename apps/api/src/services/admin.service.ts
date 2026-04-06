import { db } from "../db/index.js";
import { disputes } from "../db/schema/disputes.js";
import { escrowTransactions, escrowStatusHistory } from "../db/schema/escrow.js";
import { wallets } from "../db/schema/wallet.js";
import { withdrawals } from "../db/schema/withdrawals.js";
import { activityLogs } from "../db/schema/activity-log.js";
import { kycSubmissions } from "../db/schema/kyc.js";
import { eq, desc, count } from "drizzle-orm";

/**
 * OPEN DISPUTE
 */
export async function openDispute(
  escrowId: string,
  userId: string,
  reason: string,
  evidenceUrls?: string[]
) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, escrowId))
    .limit(1);

  if (!escrow) throw new Error("Escrow not found");

  const [dispute] = await db.insert(disputes).values({
    escrowId,
    filedBy: userId,
    reason,
    evidenceUrls: evidenceUrls || null,
  }).returning();

  await db.update(escrowTransactions)
    .set({ status: "disputed", updatedAt: new Date() })
    .where(eq(escrowTransactions.id, escrowId));

  await db.insert(escrowStatusHistory).values({
    escrowId,
    fromStatus: escrow.status,
    toStatus: "disputed",
    changedBy: userId,
    note: reason,
  });

  return dispute;
}

/**
 * RESOLVE DISPUTE
 */
export async function resolveDispute(
  disputeId: string,
  adminUserId: string,
  input: any
) {
  const [dispute] = await db
    .select()
    .from(disputes)
    .where(eq(disputes.id, disputeId))
    .limit(1);

  if (!dispute) throw new Error("Dispute not found");

  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, dispute.escrowId))
    .limit(1);

  if (!escrow) throw new Error("Escrow not found");

  await db.update(disputes).set({
    status: input.resolution,
    assignedAdmin: adminUserId,
    resolvedAt: new Date(),
  }).where(eq(disputes.id, disputeId));

  const totalAmount = parseFloat(escrow.totalAmount);
  const amount = parseFloat(escrow.amount);

  if (input.resolution === "resolved_buyer") {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, escrow.buyerId))
      .limit(1);

    if (wallet) {
      await db.update(wallets).set({
        balance: String(parseFloat(wallet.balance) + totalAmount),
        lockedBalance: String(parseFloat(wallet.lockedBalance) - totalAmount),
      }).where(eq(wallets.userId, escrow.buyerId));
    }

    await db.update(escrowTransactions)
      .set({ status: "refunded" })
      .where(eq(escrowTransactions.id, escrow.id));
  } else {
    const [sellerWallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, escrow.sellerId))
      .limit(1);

    if (sellerWallet) {
      await db.update(wallets).set({
        balance: String(parseFloat(sellerWallet.balance) + amount),
      }).where(eq(wallets.userId, escrow.sellerId));
    }

    await db.update(escrowTransactions)
      .set({ status: "completed" })
      .where(eq(escrowTransactions.id, escrow.id));
  }

  return { success: true };
}

/**
 * ADMIN STATS
 */
export async function getAdminStats() {
  const [pendingKyc] = await db
    .select({ count: count() })
    .from(kycSubmissions)
    .where(eq(kycSubmissions.status, "pending"));

  const [openDisputes] = await db
    .select({ count: count() })
    .from(disputes);

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
 * PROCESS WITHDRAWAL
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
    await db.update(withdrawals).set({
      status: "completed",
      processedBy: adminUserId,
      processedAt: new Date(),
    }).where(eq(withdrawals.id, withdrawalId));
  } else {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, withdrawal.userId))
      .limit(1);

    if (wallet) {
      await db.update(wallets).set({
        balance: String(parseFloat(wallet.balance) + parseFloat(withdrawal.amount)),
      }).where(eq(wallets.userId, withdrawal.userId));
    }

    await db.update(withdrawals).set({
      status: "rejected",
      processedBy: adminUserId,
      processedAt: new Date(),
    }).where(eq(withdrawals.id, withdrawalId));
  }

  return { success: true };
}

/**
 * ACTIVITY LOG (🔥 FIX UTAMA)
 */
export async function getActivityLog(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;

  return await db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(pageSize)
    .offset(offset);
}

/**
 * GET PENDING KYC
 */
export async function getPendingKyc() {
  return db
    .select()
    .from(kycSubmissions)
    .where(eq(kycSubmissions.status, "pending"))
    .orderBy(desc(kycSubmissions.submittedAt));
}