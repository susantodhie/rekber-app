import { db } from "../db/index.js";
import { escrowTransactions, escrowStatusHistory } from "../db/schema/escrow.js";
import { conversations, conversationParticipants, messages } from "../db/schema/messages.js";
import { users } from "../db/schema/users.js";
import { eq, or, desc, and, count } from "drizzle-orm";
import { generateTxCode } from "../lib/id-generator.js";
import { calculateFees, validateAmount } from "../lib/fee-calculator.js";
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

  const numericAmount = Number(input.amount);
  
  // Validasi max limit 3 juta
  validateAmount(numericAmount);

  const fees = calculateFees(numericAmount, input.paymentMethod);
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
      paymentMethod: input.paymentMethod || "qris",
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
 * PAY ESCROW (direct payment — dana ditahan sistem)
 */
export async function payEscrow(escrowId: string, userId: string) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, escrowId))
    .limit(1);

  if (!escrow) throw new Error("Escrow tidak ditemukan");

  // UPDATE STATUS — pembayaran sudah dikonfirmasi
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
 * CONFIRM (selesaikan transaksi)
 */
export async function confirmEscrow(escrowId: string, userId: string) {
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, escrowId))
    .limit(1);

  if (!escrow) throw new Error("Escrow tidak ditemukan");

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