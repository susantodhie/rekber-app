import {
  pgTable,
  text,
  varchar,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";

// ============================================================
// Activity Logs — dashboard feed & audit trail
// ============================================================

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id),
  action: varchar("action", { length: 100 }).notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
