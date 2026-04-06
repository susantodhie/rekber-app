import { db } from "../db/index.js";
import { wallets, walletTransactions } from "../db/schema/wallet.js";
import { withdrawals } from "../db/schema/withdrawals.js";
import { bankAccounts } from "../db/schema/bank-accounts.js";
import { users } from "../db/schema/users.js";
import { eq, desc } from "drizzle-orm";
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
export async function topUpWallet(userId: string, amount: number) {
  let [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet) {
    const [newWallet] = await db
      .insert(wallets)
      .values({
        userId,
        balance: 0,
        lockedBalance: 0,
      })
      .returning();

    wallet = newWallet;
  }

  const newBalance = wallet.balance + amount;

  await db
    .update(wallets)
    .set({ balance: newBalance })
    .where(eq(wallets.userId, userId));

  await db.insert(walletTransactions).values({
    userId,
    amount,
    type: "deposit",
  });

  return { success: true, balance: newBalance };
}

/**
 * Withdraw
 */
export async function requestWithdrawal(userId: string, input: CreateWithdrawalInput) {
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet) throw new Error("Wallet tidak ditemukan");

  if (wallet.balance < input.amount) {
    throw new Error("Saldo tidak cukup");
  }

  const newBalance = wallet.balance - input.amount;

  await db
    .update(wallets)
    .set({ balance: newBalance })
    .where(eq(wallets.userId, userId));

  await db.insert(walletTransactions).values({
    userId,
    amount: Number(input.amount),
    type: "withdrawal",
  });

  const [withdrawal] = await db
    .insert(withdrawals)
    .values({
      userId,
      bankAccountId: input.bankAccountId,
      amount: Number(input.amount),
    })
    .returning();

  return withdrawal;
}

/**
 * ESCROW: lock saldo
 */
export async function deductBalance(userId: string, amount: number) {
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet) throw new Error("Wallet tidak ditemukan");

  if (wallet.balance < amount) {
    throw new Error("Saldo tidak cukup");
  }

  await db
    .update(wallets)
    .set({
      balance: wallet.balance - amount,
      lockedBalance: wallet.lockedBalance + amount,
    })
    .where(eq(wallets.userId, userId));
}

/**
 * ESCROW: release ke seller
 */
export async function releaseBalance(userId: string, amount: number) {
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet) throw new Error("Wallet tidak ditemukan");

  await db
    .update(wallets)
    .set({
      balance: wallet.balance + amount,
    })
    .where(eq(wallets.userId, userId));
}

/**
 * ESCROW: refund
 */
export async function refundBalance(userId: string, amount: number) {
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet) throw new Error("Wallet tidak ditemukan");

  if (wallet.lockedBalance < amount) {
    throw new Error("Locked tidak cukup");
  }

  await db
    .update(wallets)
    .set({
      balance: wallet.balance + amount,
      lockedBalance: wallet.lockedBalance - amount,
    })
    .where(eq(wallets.userId, userId));
}