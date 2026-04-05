import {
  pgTable,
  text,
  varchar,
  decimal,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";
import { bankAccounts } from "./bank-accounts.js";

// ============================================================
// Withdrawals
// ============================================================

export const withdrawalStatusEnum = pgEnum("withdrawal_status", [
  "pending",
  "processing",
  "completed",
  "rejected",
]);

export const withdrawals = pgTable("withdrawals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  bankAccountId: uuid("bank_account_id")
    .notNull()
    .references(() => bankAccounts.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  status: withdrawalStatusEnum("status").notNull().default("pending"),
  processedBy: text("processed_by").references(() => user.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
