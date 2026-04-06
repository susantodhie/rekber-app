import { db } from "../db/index.js";
import {
  conversations,
  conversationParticipants,
  messages,
} from "../db/schema/messages.js";
import { users } from "../db/schema/users.js";
import { eq, desc, and, inArray, count, sql } from "drizzle-orm";
import type { SendMessageInput } from "../types/index.js";

/**
 * Check if user is admin (sementara disable)
 */
async function isUserAdmin(userId: string): Promise<boolean> {
  return false; // karena belum ada field role
}

/**
 * List user's conversations
 */
export async function listConversations(userId: string) {
  const isAdmin = await isUserAdmin(userId);

  let convos;

  if (isAdmin) {
    convos = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.updatedAt));
  } else {
    const participations = await db
      .select({ conversationId: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, userId));

    const conversationIds = participations.map((p) => p.conversationId);

    if (conversationIds.length === 0) return [];

    convos = await db
      .select()
      .from(conversations)
      .where(inArray(conversations.id, conversationIds))
      .orderBy(desc(conversations.updatedAt));
  }

  const result = await Promise.all(
    convos.map(async (conv) => {
      const [lastMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      const participants = await db
        .select({
          userId: conversationParticipants.userId,
          username: users.email, // ganti dari username
          avatarUrl: sql`null`, // sementara null
          lastReadAt: conversationParticipants.lastReadAt,
        })
        .from(conversationParticipants)
        .leftJoin(users, eq(conversationParticipants.userId, users.id)) // FIX
        .where(eq(conversationParticipants.conversationId, conv.id));

      const currentParticipant = participants.find((p) => p.userId === userId);
      let unreadCount = 0;

      if (currentParticipant?.lastReadAt) {
        const [unread] = await db
          .select({ count: count() })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conv.id),
              sql`${messages.createdAt} > ${currentParticipant.lastReadAt}`
            )
          );
        unreadCount = unread?.count || 0;
      } else {
        const [unread] = await db
          .select({ count: count() })
          .from(messages)
          .where(eq(messages.conversationId, conv.id));
        unreadCount = unread?.count || 0;
      }

      return {
        ...conv,
        lastMessage: lastMessage || null,
        participants: participants.filter((p) => p.userId !== userId),
        unreadCount,
      };
    })
  );

  return result;
}

/**
 * Get messages
 */
export async function getConversationMessages(
  conversationId: string,
  userId: string,
  page = 1,
  pageSize = 50
) {
  const offset = (page - 1) * pageSize;

  const msgs = await db
    .select({
      id: messages.id,
      conversationId: messages.conversationId,
      senderId: messages.senderId,
      content: messages.content,
      type: messages.type,
      fileUrl: messages.fileUrl,
      fileName: messages.fileName,
      isSystem: messages.isSystem,
      createdAt: messages.createdAt,
      senderUsername: users.email, // FIX
      senderRole: sql`'user'`, // sementara default
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id)) // FIX
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [totalResult] = await db
    .select({ count: count() })
    .from(messages)
    .where(eq(messages.conversationId, conversationId));

  return {
    messages: msgs.reverse(),
    total: totalResult?.count || 0,
    page,
    pageSize,
  };
}

/**
 * Send message
 */
export async function sendMessage(
  conversationId: string,
  userId: string,
  input: SendMessageInput,
  fileUrl?: string,
  fileName?: string
) {
  const [message] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId: userId,
      content: input.content,
      type: input.type || "text",
      fileUrl: fileUrl || null,
      fileName: fileName || null,
    })
    .returning();

  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  await db
    .update(conversationParticipants)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId)
      )
    );

  return message;
}

/**
 * Mark read
 */
export async function markConversationRead(conversationId: string, userId: string) {
  await db
    .update(conversationParticipants)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId)
      )
    );
}

/**
 * Unread count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const convos = await listConversations(userId);
  return convos.reduce((sum, c) => sum + c.unreadCount, 0);
}