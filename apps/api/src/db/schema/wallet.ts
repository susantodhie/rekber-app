import { pgTable, uuid, integer, text, timestamp } from "drizzle-orm/pg-core";

export const wallets = pgTable("wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  balance: integer("balance").default(0).notNull(),
  lockedBalance: integer("locked_balance").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(),
  escrowId: uuid("escrow_id"),
  createdAt: timestamp("created_at").defaultNow(),
});