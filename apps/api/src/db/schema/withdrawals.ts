import { pgTable, uuid, integer, timestamp, text } from "drizzle-orm/pg-core";

export const withdrawals = pgTable("withdrawals", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id").notNull(), // ✅ WAJIB ADA
  bankAccountId: uuid("bank_account_id").notNull(),

  amount: integer("amount").notNull(), // ✅ HARUS integer

  status: text("status").default("pending"),

  createdAt: timestamp("created_at").defaultNow(),
});