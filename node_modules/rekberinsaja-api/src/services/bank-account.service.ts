import { db } from "../db/index.js";
import { bankAccounts } from "../db/schema/bank-accounts.js";
import { eq, and } from "drizzle-orm";
import type { CreateBankAccountInput } from "../types/index.js";

/**
 * List user's bank accounts
 */
export async function listBankAccounts(userId: string) {
  return db
    .select()
    .from(bankAccounts)
    .where(eq(bankAccounts.userId, userId));
}

/**
 * Add a new bank account
 */
export async function addBankAccount(userId: string, input: CreateBankAccountInput) {
  // If this is set as primary, unset all others first
  if (input.isPrimary) {
    await db
      .update(bankAccounts)
      .set({ isPrimary: false })
      .where(eq(bankAccounts.userId, userId));
  }

  const [account] = await db
    .insert(bankAccounts)
    .values({
      userId,
      bankName: input.bankName,
      bankCode: input.bankCode,
      accountNumber: input.accountNumber,
      accountHolder: input.accountHolder,
      isPrimary: input.isPrimary || false,
    })
    .returning();

  return account;
}

/**
 * Update a bank account
 */
export async function updateBankAccount(
  accountId: string,
  userId: string,
  data: Partial<CreateBankAccountInput>
) {
  const [account] = await db
    .update(bankAccounts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(bankAccounts.id, accountId), eq(bankAccounts.userId, userId)))
    .returning();

  return account || null;
}

/**
 * Delete a bank account
 */
export async function deleteBankAccount(accountId: string, userId: string) {
  const result = await db
    .delete(bankAccounts)
    .where(and(eq(bankAccounts.id, accountId), eq(bankAccounts.userId, userId)))
    .returning();

  return result.length > 0;
}

/**
 * Set a bank account as primary
 */
export async function setPrimaryBankAccount(accountId: string, userId: string) {
  // Unset all existing primary
  await db
    .update(bankAccounts)
    .set({ isPrimary: false })
    .where(eq(bankAccounts.userId, userId));

  // Set new primary
  const [account] = await db
    .update(bankAccounts)
    .set({ isPrimary: true, updatedAt: new Date() })
    .where(and(eq(bankAccounts.id, accountId), eq(bankAccounts.userId, userId)))
    .returning();

  return account || null;
}
