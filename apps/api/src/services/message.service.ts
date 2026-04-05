import { db } from "../db/index.js";
import {
  conversations,
  conversationParticipants,
  messages,
} from "../db/schema/messages.js";
import { userProfiles } from "../db/schema/users.js";
import { eq, desc, and, inArray, count, sql, lt } from "drizzle-orm";
import type { SendMessageInput } from "../types/index.js";

/**
 * Check if user is admin
 */
async function isUserAdmin(userId: string): Promise<boolean> {
  const [profile] = await db
    .select({ role: userProfiles.role })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  return profile?.role === "admin";
}

/**
 * List user's conversations with last message preview
 * Admin sees ALL escrow conversations
 */
export async function listConversations(userId: string) {
  const isAdmin = await isUserAdmin(userId);

  let convos;

  if (isAdmin) {
    // Admin sees all conversations
    convos = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.updatedAt));
  } else {
    // Regular users only see conversations they participate in
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

  // For each conversation, get the last message and other participant info
  const result = await Promise.all(
    convos.map(async (conv) => {
      // Last message
      const [lastMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      // Other participant(s)
      const participants = await db
        .select({
          userId: conversationParticipants.userId,
          username: userProfiles.username,
          avatarUrl: userProfiles.avatarUrl,
          lastReadAt: conversationParticipants.lastReadAt,
        })
        .from(conversationParticipants)
        .leftJoin(
          userProfiles,
          eq(conversationParticipants.userId, userProfiles.userId)
        )
        .where(eq(conversationParticipants.conversationId, conv.id));

      // Count unread messages for current user
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
        // If never read, count all messages
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
 * Get messages for a conversation (paginated)
 * Includes senderRole and senderUsername for each message
 * Admin bypasses participant check
 */
export async function getConversationMessages(
  conversationId: string,
  userId: string,
  page = 1,
  pageSize = 50
) {
  const isAdmin = await isUserAdmin(userId);

  if (!isAdmin) {
    // Verify user is a participant
    const [participant] = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      )
      .limit(1);

    if (!participant) throw new Error("Access denied");
  }

  const offset = (page - 1) * pageSize;

  // Fetch messages with sender profile info
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
      senderUsername: userProfiles.username,
      senderRole: userProfiles.role,
    })
    .from(messages)
    .leftJoin(userProfiles, eq(messages.senderId, userProfiles.userId))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [totalResult] = await db
    .select({ count: count() })
    .from(messages)
    .where(eq(messages.conversationId, conversationId));

  return {
    messages: msgs.reverse(), // Return in chronological order
    total: totalResult?.count || 0,
    page,
    pageSize,
  };
}

/**
 * Send a message in a conversation
 * Admin bypasses participant check
 */
export async function sendMessage(
  conversationId: string,
  userId: string,
  input: SendMessageInput,
  fileUrl?: string,
  fileName?: string
) {
  const isAdmin = await isUserAdmin(userId);

  if (!isAdmin) {
    // Verify user is a participant
    const [participant] = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      )
      .limit(1);

    if (!participant) throw new Error("Access denied");
  }

  // Create message
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

  // Update conversation timestamp
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  // Update sender's lastReadAt
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
 * Mark a conversation as read
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
 * Get total unread message count across all conversations
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const convos = await listConversations(userId);
  return convos.reduce((sum, c) => sum + c.unreadCount, 0);
}
