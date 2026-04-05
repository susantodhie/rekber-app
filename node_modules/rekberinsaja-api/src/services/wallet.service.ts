import { db } from "../db/index.js";
import { wallets, walletTransactions } from "../db/schema/wallet.js";
import { withdrawals } from "../db/schema/withdrawals.js";
import { bankAccounts } from "../db/schema/bank-accounts.js";
import { userProfiles } from "../db/schema/users.js";
import { eq, desc, count } from "drizzle-orm";
import type { CreateWithdrawalInput, WalletFilterParams } from "../types/index.js";
import { verifyTransactionPin } from "./user.service.js";

/**
 * Get user's wallet
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
 * Get wallet transaction history
 */
export async function getWalletTransactions(userId: string, params: WalletFilterParams) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet) return { transactions: [], total: 0, page, pageSize, totalPages: 0 };

  const txs = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.walletId, wallet.id))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [totalResult] = await db
    .select({ count: count() })
    .from(walletTransactions)
    .where(eq(walletTransactions.walletId, wallet.id));

  return {
    transactions: txs,
    total: totalResult?.count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((totalResult?.count || 0) / pageSize),
  };
}

/**
 * Top up wallet balance
 */
export async function topUpWallet(userId: string, amount: number, method: string) {
  if (amount <= 0) throw new Error("Amount must be positive");

  let [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet) {
    const [newWallet] = await db
      .insert(wallets)
      .values({ userId, balance: "0", lockedBalance: "0" })
      .returning();
    wallet = newWallet;
  }

  const currentBalance = parseFloat(wallet.balance);
  const newBalance = currentBalance + amount;

  await db
    .update(wallets)
    .set({ balance: String(newBalance), updatedAt: new Date() })
    .where(eq(wallets.id, wallet.id));

  const [tx] = await db
    .insert(walletTransactions)
    .values({
      walletId: wallet.id,
      type: "deposit",
      amount: String(amount),
      balanceAfter: String(newBalance),
      description: `Top Up via ${method}`,
      status: "completed",
    })
    .returning();

  return { success: true, transaction: tx, newBalance };
}

/**
 * Request a withdrawal
 */
export async function requestWithdrawal(userId: string, input: CreateWithdrawalInput) {
  const pinValid = await verifyTransactionPin(userId, input.pin);
  if (!pinValid) throw new Error("Invalid transaction PIN");

  const [bankAccount] = await db
    .select()
    .from(bankAccounts)
    .where(eq(bankAccounts.id, input.bankAccountId))
    .limit(1);

  if (!bankAccount || bankAccount.userId !== userId) {
    throw new Error("Bank account not found");
  }

  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet) throw new Error("Wallet not found");

  const balance = parseFloat(wallet.balance);
  if (balance < input.amount) {
    throw new Error("Insufficient balance");
  }

  const newBalance = balance - input.amount;
  await db
    .update(wallets)
    .set({ balance: String(newBalance), updatedAt: new Date() })
    .where(eq(wallets.userId, userId));

  await db.insert(walletTransactions).values({
    walletId: wallet.id,
    type: "withdrawal",
    amount: String(input.amount),
    balanceAfter: String(newBalance),
    description: `Penarikan dana ke ${bankAccount.bankName} - ${bankAccount.accountNumber}`,
    status: "pending",
  });

  const [withdrawal] = await db
    .insert(withdrawals)
    .values({
      userId,
      bankAccountId: input.bankAccountId,
      amount: String(input.amount),
    })
    .returning();

  return withdrawal;
}

/**
 * Get user's withdrawal history
 */
export async function getWithdrawals(userId: string) {
  return db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.userId, userId))
    .orderBy(desc(withdrawals.createdAt));
}

/**
 * Admin: List ALL withdrawals with user info
 */
export async function adminListWithdrawals() {
  const rows = await db
    .select({
      id: withdrawals.id,
      userId: withdrawals.userId,
      bankAccountId: withdrawals.bankAccountId,
      amount: withdrawals.amount,
      status: withdrawals.status,
      processedBy: withdrawals.processedBy,
      processedAt: withdrawals.processedAt,
      createdAt: withdrawals.createdAt,
      username: userProfiles.username,
      fullName: userProfiles.fullName,
      bankName: bankAccounts.bankName,
      accountNumber: bankAccounts.accountNumber,
      accountHolder: bankAccounts.accountHolder,
    })
    .from(withdrawals)
    .leftJoin(userProfiles, eq(withdrawals.userId, userProfiles.userId))
    .leftJoin(bankAccounts, eq(withdrawals.bankAccountId, bankAccounts.id))
    .orderBy(desc(withdrawals.createdAt));

  return rows;
}

/**
 * Admin: Approve a withdrawal
 */
export async function adminApproveWithdrawal(withdrawalId: string, adminId: string) {
  const [wd] = await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.id, withdrawalId))
    .limit(1);

  if (!wd) throw new Error("Withdrawal not found");
  if (wd.status !== "pending") throw new Error("Withdrawal is not pending");

  await db
    .update(withdrawals)
    .set({
      status: "completed",
      processedBy: adminId,
      processedAt: new Date(),
    })
    .where(eq(withdrawals.id, withdrawalId));

  return { success: true };
}

/**
 * Admin: Reject a withdrawal (refund balance)
 */
export async function adminRejectWithdrawal(withdrawalId: string, adminId: string) {
  const [wd] = await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.id, withdrawalId))
    .limit(1);

  if (!wd) throw new Error("Withdrawal not found");
  if (wd.status !== "pending") throw new Error("Withdrawal is not pending");

  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, wd.userId))
    .limit(1);

  if (wallet) {
    const refundedBalance = parseFloat(wallet.balance) + parseFloat(wd.amount);
    await db
      .update(wallets)
      .set({ balance: String(refundedBalance), updatedAt: new Date() })
      .where(eq(wallets.id, wallet.id));

    await db.insert(walletTransactions).values({
      walletId: wallet.id,
      type: "escrow_refund",
      amount: wd.amount,
      balanceAfter: String(refundedBalance),
      description: `Pengembalian dana penarikan yang ditolak`,
      status: "completed",
    });
  }

  await db
    .update(withdrawals)
    .set({
      status: "rejected",
      processedBy: adminId,
      processedAt: new Date(),
    })
    .where(eq(withdrawals.id, withdrawalId));

  return { success: true };
}
