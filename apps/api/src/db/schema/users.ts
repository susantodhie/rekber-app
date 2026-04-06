import {
  pgTable,
  text,
  uuid,
  timestamp
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: text("email").notNull().unique(),

  password: text("password").notNull(),

  role: text("role").default("user").notNull(),

  kycStatus: text("kyc_status").default("pending").notNull(),

  createdAt: timestamp("created_at").defaultNow(),

  transactionPin: text("transaction_pin").notNull(),
});