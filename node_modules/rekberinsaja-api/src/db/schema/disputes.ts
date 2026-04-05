import {
  pgTable,
  text,
  varchar,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";
import { escrowTransactions } from "./escrow.js";

// ============================================================
// Disputes / Sengketa
// ============================================================

export const disputeStatusEnum = pgEnum("dispute_status", [
  "open",
  "under_review",
  "resolved_buyer",
  "resolved_seller",
  "escalated",
]);

export const disputes = pgTable("disputes", {
  id: uuid("id").defaultRandom().primaryKey(),
  escrowId: uuid("escrow_id")
    .notNull()
    .unique()
    .references(() => escrowTransactions.id),
  filedBy: text("filed_by")
    .notNull()
    .references(() => user.id),
  reason: text("reason").notNull(),
  evidenceUrls: text("evidence_urls").array(),
  status: disputeStatusEnum("status").notNull().default("open"),
  assignedAdmin: text("assigned_admin").references(() => user.id),
  resolutionNote: text("resolution_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});
