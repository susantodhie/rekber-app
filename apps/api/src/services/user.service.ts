import { db } from "../db/index.js";
import { userProfiles } from "../db/schema/users.js";
import { wallets } from "../db/schema/wallet.js";
import { eq, like, or } from "drizzle-orm";
import { generateUserCode } from "../lib/id-generator.js";
import bcrypt from "bcryptjs";

/**
 * Create a user profile + wallet after Better Auth signup
 */
export async function createUserProfile(userId: string, name: string, email: string) {
  // Generate unique username from email
  const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
  let username = baseUsername;
  let attempt = 0;

  // Ensure unique username
  while (true) {
    const existing = await db
      .select({ id: userProfiles.id })
      .from(userProfiles)
      .where(eq(userProfiles.username, username))
      .limit(1);

    if (existing.length === 0) break;
    attempt++;
    username = `${baseUsername}${attempt}`;
  }

  const userCode = generateUserCode();

  // Create profile
  const [profile] = await db
    .insert(userProfiles)
    .values({
      userId,
      username,
      fullName: name,
      userCode,
    })
    .returning();

  // Create wallet
  await db.insert(wallets).values({
    userId,
  });

  return profile;
}

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  return profile || null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: {
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
    username?: string;
  }
) {
  const [updated] = await db
    .update(userProfiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.userId, userId))
    .returning();

  return updated;
}

/**
 * Get dashboard stats for a user
 */
export async function getUserStats(userId: string) {
  const { escrowTransactions } = await import("../db/schema/escrow.js");
  const { count } = await import("drizzle-orm");

  const activeStatuses = ["pending_payment", "paid", "processing", "shipped", "delivered", "confirmed"];

  // Get wallet balance
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  // Count active transactions
  const activeResult = await db
    .select({ count: count() })
    .from(escrowTransactions)
    .where(
      or(
        eq(escrowTransactions.buyerId, userId),
        eq(escrowTransactions.sellerId, userId)
      )
    );

  // Count completed transactions
  const completedResult = await db
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
    completedTransactions: completedResult[0]?.count || 0,
  };
}

/**
 * Search users by username (for counterparty lookup)
 */
export async function searchUsers(query: string, excludeUserId?: string) {
  const results = await db
    .select({
      userId: userProfiles.userId,
      username: userProfiles.username,
      fullName: userProfiles.fullName,
      avatarUrl: userProfiles.avatarUrl,
      kycStatus: userProfiles.kycStatus,
    })
    .from(userProfiles)
    .where(like(userProfiles.username, `%${query}%`))
    .limit(10);

  // Filter out current user
  return excludeUserId
    ? results.filter((u) => u.userId !== excludeUserId)
    : results;
}

/**
 * Get public user profile by username
 */
export async function getUserByUsername(username: string) {
  const [profile] = await db
    .select({
      username: userProfiles.username,
      fullName: userProfiles.fullName,
      avatarUrl: userProfiles.avatarUrl,
      kycStatus: userProfiles.kycStatus,
      userCode: userProfiles.userCode,
      createdAt: userProfiles.createdAt,
    })
    .from(userProfiles)
    .where(eq(userProfiles.username, username))
    .limit(1);

  return profile || null;
}

/**
 * Set or update transaction PIN
 */
export async function setTransactionPin(userId: string, pin: string) {
  const hashed = await bcrypt.hash(pin, 12);
  await db
    .update(userProfiles)
    .set({ transactionPin: hashed, updatedAt: new Date() })
    .where(eq(userProfiles.userId, userId));
}

/**
 * Verify transaction PIN
 */
export async function verifyTransactionPin(userId: string, pin: string): Promise<boolean> {
  const [profile] = await db
    .select({ transactionPin: userProfiles.transactionPin })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (!profile?.transactionPin) return false;
  return bcrypt.compare(pin, profile.transactionPin);
}
