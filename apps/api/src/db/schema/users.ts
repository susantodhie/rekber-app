import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";

// ============================================================
// User Profiles — extends Better Auth's user table
// ============================================================

export const kycStatusEnum = pgEnum("kyc_status", [
  "unverified",
  "pending",
  "verified",
  "rejected",
]);

export const userRoleEnum = pgEnum("user_role", [
  "buyer",
  "seller",
  "admin",
  "user",
]);

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 50 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  avatarUrl: text("avatar_url"),
  userCode: varchar("user_code", { length: 20 }).unique(),
  role: userRoleEnum("role").notNull().default("user"),
  kycStatus: kycStatusEnum("kyc_status").notNull().default("unverified"),
  kycTier: integer("kyc_tier").notNull().default(0),
  transactionPin: varchar("transaction_pin", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
