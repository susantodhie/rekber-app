import {
  pgTable,
  text,
  varchar,
  decimal,
  timestamp,
  uuid,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";

// ============================================================
// Escrow Transactions
// ============================================================

export const escrowStatusEnum = pgEnum("escrow_status", [
  "pending_payment",
  "paid",
  "waiting_seller_action",
  "waiting_both_parties",
  "chat_active",
  "transaction_started",
  "waiting_verification",
  "payment_rejected",
  "processing",
  "shipped",
  "delivered",
  "verified",
  "confirmed",
  "success",
  "completed",
  "disputed",
  "cancelled",
  "refunded",
]);

export const chatStatusEnum = pgEnum("chat_status", [
  "pending",
  "in_progress",
  "completed",
]);

export const escrowTransactions = pgTable("escrow_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  txCode: varchar("tx_code", { length: 20 }).notNull().unique(),
  buyerId: text("buyer_id")
    .notNull()
    .references(() => user.id),
  sellerId: text("seller_id")
    .notNull()
    .references(() => user.id),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  itemImageUrl: text("item_image_url"),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  adminFee: decimal("admin_fee", { precision: 15, scale: 2 })
    .notNull()
    .default("0"),
  insuranceFee: decimal("insurance_fee", { precision: 15, scale: 2 })
    .notNull()
    .default("0"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  status: escrowStatusEnum("status").notNull().default("pending_payment"),
  chatStatus: chatStatusEnum("chat_status").notNull().default("pending"),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  shippingProof: text("shipping_proof"),
  paymentProof: text("payment_proof"),
  isBuyerJoined: boolean("is_buyer_joined").notNull().default(false),
  isSellerJoined: boolean("is_seller_joined").notNull().default(false),
  rejectionReason: text("rejection_reason"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  paidAt: timestamp("paid_at"),
  shippedAt: timestamp("shipped_at"),
  confirmedAt: timestamp("confirmed_at"),
  completedAt: timestamp("completed_at"),
});

// ============================================================
// Escrow Status History — audit trail
// ============================================================

export const escrowStatusHistory = pgTable("escrow_status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  escrowId: uuid("escrow_id")
    .notNull()
    .references(() => escrowTransactions.id, { onDelete: "cascade" }),
  fromStatus: varchar("from_status", { length: 50 }),
  toStatus: varchar("to_status", { length: 50 }).notNull(),
  changedBy: text("changed_by")
    .notNull()
    .references(() => user.id),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
