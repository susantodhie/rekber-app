import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  uuid,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";
import { escrowTransactions } from "./escrow.js";

// ============================================================
// Conversations
// ============================================================

export const conversationTypeEnum = pgEnum("conversation_type", [
  "escrow",
  "direct",
  "system",
]);

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  escrowId: uuid("escrow_id").references(() => escrowTransactions.id),
  type: conversationTypeEnum("type").notNull().default("escrow"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================
// Conversation Participants
// ============================================================

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at"),
  },
  (table) => [
    unique("conv_participant_unique").on(table.conversationId, table.userId),
  ]
);

// ============================================================
// Messages
// ============================================================

export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "image",
  "file",
  "system",
]);

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: text("sender_id").references(() => user.id),
  content: text("content").notNull(),
  type: messageTypeEnum("type").notNull().default("text"),
  fileUrl: text("file_url"),
  fileName: varchar("file_name", { length: 255 }),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
