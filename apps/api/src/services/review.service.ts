import { db } from "../db/index.js";
import { reviews } from "../db/schema/reviews.js";
import { escrowTransactions } from "../db/schema/escrow.js";
import { users } from "../db/schema/users.js";
import { eq, desc, and } from "drizzle-orm";

export async function createReview(data: {
  escrowId: string;
  reviewerId: string;
  rating: number;
  comment: string;
}) {
  if (data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  if (data.comment.length < 10) {
    throw new Error("Comment must be at least 10 characters");
  }

  // 1. Fetch Escrow
  const [escrow] = await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.id, data.escrowId))
    .limit(1);

  if (!escrow) throw new Error("Escrow not found");

  // Allow reviewing only if completed
  if (escrow.status !== "completed" && escrow.status !== "refunded") {
    throw new Error("You can only review completed or refunded transactions");
  }

  // 2. Determine Roles and Targets
  let role = "";
  let targetUserId = "";

  if (escrow.buyerId === data.reviewerId) {
    role = "buyer";
    targetUserId = escrow.sellerId;
  } else if (escrow.sellerId === data.reviewerId) {
    role = "seller";
    targetUserId = escrow.buyerId;
  } else {
    throw new Error("You are not part of this transaction");
  }

  // 3. Ensure no duplicate review
  const existingReview = await db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.escrowId, data.escrowId),
        eq(reviews.reviewerId, data.reviewerId)
      )
    )
    .limit(1);

  if (existingReview.length > 0) {
    throw new Error("You can only review a transaction once");
  }

  // 4. Create Review
  const [newReview] = await db
    .insert(reviews)
    .values({
      escrowId: data.escrowId,
      reviewerId: data.reviewerId,
      targetUserId,
      role,
      rating: data.rating,
      comment: data.comment,
    })
    .returning();

  return newReview;
}

export async function getTopPublicReviews(limit = 10) {
  // Join with users to get reviewer details
  const results = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      role: reviews.role,
      createdAt: reviews.createdAt,
      reviewerEmail: users.email,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.reviewerId, users.id))
    .where(eq(reviews.rating, 5))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);

  return results.map((r) => ({
    ...r,
    reviewerName: r.reviewerEmail.split("@")[0], // Mock name from email
  }));
}

export async function getUserReviews(userId: string) {
  // Reviews given TO this user
  const results = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      role: reviews.role,
      createdAt: reviews.createdAt,
      reviewerEmail: users.email,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.reviewerId, users.id))
    .where(eq(reviews.targetUserId, userId))
    .orderBy(desc(reviews.createdAt));

  return results.map((r) => ({
    ...r,
    reviewerName: r.reviewerEmail.split("@")[0],
  }));
}

export async function getAllReviews() {
  const results = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      role: reviews.role,
      createdAt: reviews.createdAt,
      reviewerEmail: users.email,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.reviewerId, users.id))
    .orderBy(desc(reviews.createdAt));

  return results.map((r) => ({
    ...r,
    reviewerName: r.reviewerEmail.split("@")[0],
  }));
}
