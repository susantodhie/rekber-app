import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as notificationService from "../services/notification.service.js";
import { getParam, getQueryInt } from "../lib/request-helpers.js";

const router = Router();

/**
 * GET /api/notifications
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const page = getQueryInt(req, "page", 1);
    const pageSize = getQueryInt(req, "pageSize", 20);

    const result = await notificationService.listNotifications(req.user!.id, page, pageSize);

    res.json({
      success: true,
      data: result.notifications,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/notifications/unread-count
 */
router.get("/unread-count", requireAuth, async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadNotificationCount(req.user!.id);
    res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/notifications/:id/read
 */
router.post("/:id/read", requireAuth, async (req, res, next) => {
  try {
    await notificationService.markNotificationRead(getParam(req, "id"), req.user!.id);
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/notifications/read-all
 */
router.post("/read-all", requireAuth, async (req, res, next) => {
  try {
    await notificationService.markAllNotificationsRead(req.user!.id);
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
});

export default router;
