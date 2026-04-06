import { db } from "../db/index.js";
import { escrowTransactions, escrowStatusHistory } from "../db/schema/escrow.js";
import { wallets, walletTransactions } from "../db/schema/wallet.js";
import { conversations, conversationParticipants, messages } from "../db/schema/messages.js";
import { users } from "../db/schema/users.js";
import { eq, or, desc, and, count } from "drizzle-orm";
import { generateTxCode } from "../lib/id-generator.js";
import { calculateFees } from "../lib/fee-calculator.js";
import type { CreateEscrowInput } from "../types/index.js";

/**
 * CREATE ESCROW (pakai email)
 */
export async function createEscrow(userId: string, input: any) {
  // cari lawan transaksi pakai email
  const [counterparty] = await db
    .select({ userId: users.id })
    .from(users)
    .where(eq(users.email, input.counterpartyEmail))
    .limit(1);

  if (!counterparty) throw new Error("User tidak ditemukan");

  if (counterparty.userId === userId) {
    throw new Error("Tidak bisa transaksi dengan diri sendiri");
  }

  const buyerId = input.role === "buyer" ? userId : counterparty.userId;
  const sellerId = input.role === "seller" ? userId : counterparty.userId;

  const fees = calculateFees(input.amount);
  const txCode = generateTxCode(input.category);

  // CREATE ESCROW
  const [escrow] = await db
    .insert(escrowTransactions)
    .values({
      txCode,
      buyerId,
      sellerId,
      createdBy: userId,
      itemName: input.itemName,
      category: input.category,
      description: input.description,
      amount: String(fees.amount),
      totalAmount: String(fees.totalAmount),
      status: "pending_payment",
      paymentMethod: input.paymentMethod || "wallet",
    })
    .returning();

  // CREATE CHAT
  const [conversation] = await db
    .insert(conversations)
    .values({ escrowId: escrow.id })
    .returning();

  await db.insert(conversationParticipants).values([
    { conversationId: conversation.id, userId: buyerId },
    { conversationId: conversation.id, userId: sellerId },
  ]);

  return escrow;
}

/**
 * PAY ESCROW (wallet)
 */
export async function payEscrow(escrowId: string, userId: string) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, escrowId))
    .limit(1);

  if (!escrow) throw new Error("Escrow tidak ditemukan");

  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet) throw new Error("Wallet tidak ditemukan");

  const balance = parseFloat(wallet.balance);
  const amount = parseFloat(escrow.totalAmount);

  if (balance < amount) throw new Error("Saldo tidak cukup");

  // POTONG + LOCK
  await db
    .update(wallets)
    .set({
      balance: String(balance - amount),
      lockedBalance: String(parseFloat(wallet.lockedBalance) + amount),
    })
    .where(eq(wallets.userId, userId));

  // UPDATE STATUS
  await db
    .update(escrowTransactions)
    .set({
      status: "processing",
      paidAt: new Date(),
    })
    .where(eq(escrowTransactions.id, escrowId));

  return { success: true };
}

/**
 * CONFIRM (release ke seller)
 */
export async function confirmEscrow(escrowId: string, userId: string) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, escrowId))
    .limit(1);

  if (!escrow) throw new Error("Escrow tidak ditemukan");

  const amount = parseFloat(escrow.amount);

  // KURANGIN LOCKED BUYER
  const [buyerWallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, escrow.buyerId))
    .limit(1);

  if (buyerWallet) {
    await db.update(wallets)
      .set({
        lockedBalance: String(parseFloat(buyerWallet.lockedBalance) - parseFloat(escrow.totalAmount)),
      })
      .where(eq(wallets.userId, escrow.buyerId));
  }

  // TAMBAH KE SELLER
  const [sellerWallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, escrow.sellerId))
    .limit(1);

  if (sellerWallet) {
    await db.update(wallets)
      .set({
        balance: String(parseFloat(sellerWallet.balance) + amount),
      })
      .where(eq(wallets.userId, escrow.sellerId));
  }

  await db
    .update(escrowTransactions)
    .set({
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(escrowTransactions.id, escrowId));

  return { success: true };
}

/**
 * LIST ESCROW
 */
export async function listEscrows(userId: string) {
  return db
    .select()
    .from(escrowTransactions)
    .where(
      or(
        eq(escrowTransactions.buyerId, userId),
        eq(escrowTransactions.sellerId, userId)
      )
    )
    .orderBy(desc(escrowTransactions.createdAt));
}