import {
  pgTable,
  text,
  decimal,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";
import { escrowTransactions } from "./escrow.js";

// ============================================================
// Wallets — one per user
// ============================================================

export const wallets = pgTable("wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  balance: decimal("balance", { precision: 15, scale: 2 })
    .notNull()
    .default("0"),
  lockedBalance: decimal("locked_balance", { precision: 15, scale: 2 })
    .notNull()
    .default("0"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================
// Wallet Transactions — ledger entries
// ============================================================

export const walletTransactionTypeEnum = pgEnum("wallet_transaction_type", [
  "deposit",
  "withdrawal",
  "escrow_lock",
  "escrow_release",
  "escrow_refund",
  "escrow_payment",
  "fee",
]);

export const walletTransactionStatusEnum = pgEnum("wallet_transaction_status", [
  "pending",
  "completed",
  "failed",
]);

export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  walletId: uuid("wallet_id")
    .notNull()
    .references(() => wallets.id, { onDelete: "cascade" }),
  escrowId: uuid("escrow_id").references(() => escrowTransactions.id),
  type: walletTransactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  referenceId: text("reference_id"),
  status: walletTransactionStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
