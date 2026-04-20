import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  unique
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { escrowTransactions } from "./escrow.js";

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  escrowId: uuid("escrow_id").notNull().references(() => escrowTransactions.id, { onDelete: 'cascade' }),
  reviewerId: uuid("reviewer_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetUserId: uuid("target_user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  role: text("role").notNull(), // 'buyer' or 'seller' (the role of the reviewer in this transaction)
  
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  // Ensure a user can only review a specific escrow transaction exactly once
  unqReview: unique().on(t.escrowId, t.reviewerId)
}));
