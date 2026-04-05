import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { uploadFile } from "../middleware/upload.middleware.js";
import * as messageService from "../services/message.service.js";
import { getParam, getQueryInt } from "../lib/request-helpers.js";

const router = Router();

/**
 * GET /api/conversations
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const conversations = await messageService.listConversations(req.user!.id);
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/conversations/unread-count
 */
router.get("/unread-count", requireAuth, async (req, res, next) => {
  try {
    const count = await messageService.getUnreadCount(req.user!.id);
    res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/conversations/:id
 */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const page = getQueryInt(req, "page", 1);
    const pageSize = getQueryInt(req, "pageSize", 50);

    const result = await messageService.getConversationMessages(
      getParam(req, "id"),
      req.user!.id,
      page,
      pageSize
    );
    res.json({ success: true, data: result.messages, pagination: { page, pageSize, total: result.total } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/conversations/:id/messages
 */
router.post("/:id/messages", requireAuth, uploadFile.single("file"), async (req, res, next) => {
  try {
    const { content, type } = req.body;

    if (!content && !req.file) {
      res.status(400).json({ success: false, error: "Message content or file is required" });
      return;
    }

    const fileUrl = req.file ? `/uploads/chat/${req.file.filename}` : undefined;
    const fileName = req.file?.originalname;

    const message = await messageService.sendMessage(
      getParam(req, "id"),
      req.user!.id,
      { content: content || fileName || "File attachment", type: type || (req.file ? "file" : "text") },
      fileUrl,
      fileName
    );

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/conversations/:id/read
 */
router.post("/:id/read", requireAuth, async (req, res, next) => {
  try {
    await messageService.markConversationRead(getParam(req, "id"), req.user!.id);
    res.json({ success: true, message: "Conversation marked as read" });
  } catch (error) {
    next(error);
  }
});

export default router;
