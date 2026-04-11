import { db } from "../db/index.js";
import { wallets, walletTransactions } from "../db/schema/wallet.js";
import { withdrawals } from "../db/schema/withdrawals.js";
import { bankAccounts } from "../db/schema/bank-accounts.js";
import { users } from "../db/schema/users.js";
import { eq, desc, count, sql } from "drizzle-orm";
import type { CreateWithdrawalInput } from "../types/index.js";

/**
 * Get wallet
 */
export async function getWallet(userId: string) {
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  return wallet || null;
}

/**
 * Top up
 */
export async function topUpWallet(userId: string, amount: number, method?: string) {
  return await db.transaction(async (tx) => {
    let [wallet] = await tx.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);

    if (!wallet) {
      const [newWallet] = await tx.insert(wallets).values({
        userId, balance: 0, lockedBalance: 0
      }).returning();
      wallet = newWallet;
    }

    const [updatedWallet] = await tx.update(wallets)
      .set({ balance: sql`${wallets.balance} + ${amount}` })
      .where(eq(wallets.userId, userId))
      .returning();

    await tx.insert(walletTransactions).values({
      userId,
      amount,
      type: "deposit",
    });

    return { success: true, balance: updatedWallet.balance };
  });
}

/**
 * Withdraw
 */
export async function requestWithdrawal(userId: string, input: CreateWithdrawalInput) {
  return await db.transaction(async (tx) => {
    const [wallet] = await tx.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
    
    if (!wallet) throw new Error("Wallet tidak ditemukan");
    if (wallet.balance < input.amount) throw new Error("Saldo tidak cukup");

    const [updatedWallet] = await tx.update(wallets)
      .set({ balance: sql`${wallets.balance} - ${input.amount}` })
      .where(sql`${wallets.userId} = ${userId} AND ${wallets.balance} >= ${input.amount}`)
      .returning();

    if (!updatedWallet) throw new Error("Gagal memproses penarikan atau saldo tidak cukup");

    await tx.insert(walletTransactions).values({
      userId,
      amount: Number(input.amount),
      type: "withdrawal",
    });

    const [withdrawal] = await tx.insert(withdrawals).values({
      userId,
      bankAccountId: input.bankAccountId,
      amount: Number(input.amount),
    }).returning();

    return withdrawal;
  });
}

/**
 * ESCROW: lock saldo
 */
export async function deductBalance(userId: string, amount: number) {
  return await db.transaction(async (tx) => {
    const [wallet] = await tx.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);

    if (!wallet) throw new Error("Wallet tidak ditemukan");
    if (wallet.balance < amount) throw new Error("Saldo tidak cukup");

    const [updated] = await tx.update(wallets)
      .set({
        balance: sql`${wallets.balance} - ${amount}`,
        lockedBalance: sql`${wallets.lockedBalance} + ${amount}`,
      })
      .where(sql`${wallets.userId} = ${userId} AND ${wallets.balance} >= ${amount}`)
      .returning();

    if (!updated) throw new Error("Gagal mengunci saldo");
  });
}

/**
 * ESCROW: release ke seller
 */
export async function releaseBalance(userId: string, amount: number) {
  return await db.transaction(async (tx) => {
    const [updated] = await tx.update(wallets)
      .set({
        balance: sql`${wallets.balance} + ${amount}`,
      })
      .where(eq(wallets.userId, userId))
      .returning();

    if (!updated) throw new Error("Wallet tidak ditemukan untuk direlease");
  });
}

/**
 * ESCROW: refund
 */
export async function refundBalance(userId: string, amount: number) {
  return await db.transaction(async (tx) => {
    const [wallet] = await tx.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);

    if (!wallet) throw new Error("Wallet tidak ditemukan");
    if (wallet.lockedBalance < amount) throw new Error("Locked saldo tidak cukup");

    const [updated] = await tx.update(wallets)
      .set({
        balance: sql`${wallets.balance} + ${amount}`,
        lockedBalance: sql`${wallets.lockedBalance} - ${amount}`,
      })
      .where(sql`${wallets.userId} = ${userId} AND ${wallets.lockedBalance} >= ${amount}`)
      .returning();
      
    if (!updated) throw new Error("Gagal melakukan refund");
  });
}

/**
 * Get wallet transactions (paginated)
 */
export async function getWalletTransactions(
  userId: string,
  params: { page: number; pageSize: number; type?: string }
) {
  const { page, pageSize, type } = params;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(walletTransactions.userId, userId)];
  if (type) {
    conditions.push(eq(walletTransactions.type, type));
  }

  const whereClause =
    conditions.length === 1 ? conditions[0] : undefined;

  // Count total
  const [totalResult] = await db
    .select({ count: count() })
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId));

  const total = totalResult?.count || 0;

  const transactions = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    transactions,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get user's withdrawals
 */
export async function getWithdrawals(userId: string) {
  return db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.userId, userId))
    .orderBy(desc(withdrawals.createdAt));
}

/**
 * Admin: list all withdrawals
 */
export async function adminListWithdrawals() {
  return db
    .select()
    .from(withdrawals)
    .orderBy(desc(withdrawals.createdAt));
}

/**
 * Admin: approve withdrawal
 */
export async function adminApproveWithdrawal(withdrawalId: string, adminUserId: string) {
  const [withdrawal] = await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.id, withdrawalId))
    .limit(1);

  if (!withdrawal) throw new Error("Withdrawal not found");

  await db.update(withdrawals).set({
    status: "completed",
    processedAt: new Date(),
  }).where(eq(withdrawals.id, withdrawalId));

  return { success: true };
}

/**
 * Admin: reject withdrawal (refund balance)
 */
export async function adminRejectWithdrawal(withdrawalId: string, adminUserId: string) {
  return await db.transaction(async (tx) => {
    const [withdrawal] = await tx.select().from(withdrawals).where(eq(withdrawals.id, withdrawalId)).limit(1);

    if (!withdrawal) throw new Error("Withdrawal not found");
    if (withdrawal.status !== "pending") throw new Error("Withdrawal is not pending");

    // Refund using atomic update
    await tx.update(wallets)
      .set({
        balance: sql`${wallets.balance} + ${withdrawal.amount}`,
      })
      .where(eq(wallets.userId, withdrawal.userId));

    await tx.update(withdrawals)
      .set({
        status: "rejected",
        processedAt: new Date(),
      })
      .where(eq(withdrawals.id, withdrawalId));

    return { success: true };
  });
}