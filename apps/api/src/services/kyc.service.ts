import { db } from "../db/index.js";
import { kycSubmissions } from "../db/schema/kyc.js";
import { userProfiles } from "../db/schema/users.js";
import { eq, desc } from "drizzle-orm";
import type { CreateKycInput } from "../types/index.js";

/**
 * Submit KYC verification data
 */
export async function submitKyc(
  userId: string,
  data: CreateKycInput,
  ktpFileUrl: string,
  selfieFileUrl: string
) {
  const [submission] = await db
    .insert(kycSubmissions)
    .values({
      userId,
      fullName: data.fullName,
      nik: data.nik,
      birthDate: data.birthDate,
      ktpFileUrl,
      selfieFileUrl,
    })
    .returning();

  // Update user profile KYC status to pending
  await db
    .update(userProfiles)
    .set({ kycStatus: "pending", updatedAt: new Date() })
    .where(eq(userProfiles.userId, userId));

  return submission;
}

/**
 * Get user's KYC status and latest submission
 */
export async function getKycStatus(userId: string) {
  const [profile] = await db
    .select({
      kycStatus: userProfiles.kycStatus,
      kycTier: userProfiles.kycTier,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  const [latestSubmission] = await db
    .select()
    .from(kycSubmissions)
    .where(eq(kycSubmissions.userId, userId))
    .orderBy(desc(kycSubmissions.submittedAt))
    .limit(1);

  return {
    status: profile?.kycStatus || "unverified",
    tier: profile?.kycTier || 0,
    latestSubmission: latestSubmission || null,
  };
}

/**
 * [Admin] List pending KYC submissions
 */
export async function listPendingKycSubmissions(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  const submissions = await db
    .select()
    .from(kycSubmissions)
    .where(eq(kycSubmissions.status, "pending"))
    .orderBy(desc(kycSubmissions.submittedAt))
    .limit(pageSize)
    .offset(offset);

  return submissions;
}

/**
 * [Admin] Approve KYC submission
 */
export async function approveKyc(submissionId: string, adminUserId: string) {
  const [submission] = await db
    .update(kycSubmissions)
    .set({
      status: "approved",
      reviewedBy: adminUserId,
      reviewedAt: new Date(),
    })
    .where(eq(kycSubmissions.id, submissionId))
    .returning();

  if (submission) {
    await db
      .update(userProfiles)
      .set({
        kycStatus: "verified",
        kycTier: 1,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, submission.userId));
  }

  return submission;
}

/**
 * [Admin] Reject KYC submission
 */
export async function rejectKyc(
  submissionId: string,
  adminUserId: string,
  reason: string
) {
  const [submission] = await db
    .update(kycSubmissions)
    .set({
      status: "rejected",
      reviewedBy: adminUserId,
      reviewedAt: new Date(),
      rejectionReason: reason,
    })
    .where(eq(kycSubmissions.id, submissionId))
    .returning();

  if (submission) {
    await db
      .update(userProfiles)
      .set({
        kycStatus: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, submission.userId));
  }

  return submission;
}
