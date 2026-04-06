import { db } from "../db/index.js";
import { kycSubmissions } from "../db/schema/kyc.js";
import { eq, desc } from "drizzle-orm";
import type { CreateKycInput } from "../types/index.js";

/**
 * Submit KYC
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
      status: "pending",
    })
    .returning();

  return submission;
}

/**
 * Get KYC status
 */
export async function getKycStatus(userId: string) {
  const [latestSubmission] = await db
    .select()
    .from(kycSubmissions)
    .where(eq(kycSubmissions.userId, userId))
    .orderBy(desc(kycSubmissions.submittedAt))
    .limit(1);

  return {
    status: latestSubmission?.status || "unverified",
    tier: latestSubmission?.status === "approved" ? 1 : 0,
    latestSubmission: latestSubmission || null,
  };
}

/**
 * Admin list pending
 */
export async function listPendingKycSubmissions(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  return await db
    .select()
    .from(kycSubmissions)
    .where(eq(kycSubmissions.status, "pending"))
    .orderBy(desc(kycSubmissions.submittedAt))
    .limit(pageSize)
    .offset(offset);
}

/**
 * Approve
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

  return submission;
}

/**
 * Reject
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

  return submission;
}