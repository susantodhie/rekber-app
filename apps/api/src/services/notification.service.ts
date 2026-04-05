import { db } from "../db/index.js";
import { notifications } from "../db/schema/notifications.js";
import { eq, desc, and, count } from "drizzle-orm";

/**
 * Create a notification
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId,
      type,
      title,
      body,
      data: data || null,
    })
    .returning();

  return notification;
}

/**
 * List user's notifications (paginated)
 */
export async function listNotifications(userId: string, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;

  const notifs = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [totalResult] = await db
    .select({ count: count() })
    .from(notifications)
    .where(eq(notifications.userId, userId));

  return {
    notifications: notifs,
    total: totalResult?.count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((totalResult?.count || 0) / pageSize),
  };
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(notificationId: string, userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.id, notificationId), eq(notifications.userId, userId))
    );
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      )
    );

  return result?.count || 0;
}
