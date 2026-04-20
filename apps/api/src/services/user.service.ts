import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";
import { wallets } from "../db/schema/wallet.js";
import { eq, like, or } from "drizzle-orm";

/**
 * Create user + wallet
 */
export async function createUser(email: string) {
  const [user] = await db
    .insert(users)
    .values({
      email: email,
      password: "temporary",
      transactionPin: "123456"
    })
    .returning();

  await db.insert(wallets).values({
    userId: user.id,
    balance: 0,
    lockedBalance: 0,
  });

  return user;
}
/**
 * Get user by ID
 */
export async function getUser(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user || null;
}

/**
 * Get user by Email
 */
export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user || null;
}

/**
 * Update user
 */
export async function updateUser(userId: string, data: { email?: string }) {
  const [updated] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning();

  return updated;
}

/**
 * Dashboard stats
 */
export async function getUserStats(userId: string) {
  const { escrowTransactions } = await import("../db/schema/escrow.js");
  const { count } = await import("drizzle-orm");

  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  const activeResult = await db
    .select({ count: count() })
    .from(escrowTransactions)
    .where(
      or(
        eq(escrowTransactions.buyerId, userId),
        eq(escrowTransactions.sellerId, userId)
      )
    );

  return {
    totalBalance: wallet?.balance || "0",
    lockedBalance: wallet?.lockedBalance || "0",
    activeTransactions: activeResult[0]?.count || 0,
  };
}

/**
 * Search users (pakai email)
 */
export async function searchUsers(query: string, excludeUserId?: string) {
  const results = await db
    .select({
      userId: users.id,
      email: users.email,
    })
    .from(users)
    .where(like(users.email, `%${query}%`))
    .limit(10);

  return excludeUserId
    ? results.filter((u) => u.userId !== excludeUserId)
    : results;
}

/**
 * Verify transaction PIN (sementara bypass)
 */
export async function verifyTransactionPin(
  userId: string,
  pin: string
): Promise<boolean> {
  return true; // bypass dulu biar aman
}