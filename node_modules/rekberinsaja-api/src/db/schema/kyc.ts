import {
  pgTable,
  text,
  varchar,
  date,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";

// ============================================================
// KYC Submissions
// ============================================================

export const kycSubmissionStatusEnum = pgEnum("kyc_submission_status", [
  "pending",
  "approved",
  "rejected",
]);

export const kycSubmissions = pgTable("kyc_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  nik: varchar("nik", { length: 16 }).notNull(),
  birthDate: date("birth_date").notNull(),
  ktpFileUrl: text("ktp_file_url").notNull(),
  selfieFileUrl: text("selfie_file_url").notNull(),
  status: kycSubmissionStatusEnum("status").notNull().default("pending"),
  reviewedBy: text("reviewed_by").references(() => user.id),
  rejectionReason: text("rejection_reason"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});
