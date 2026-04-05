import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { z } from "zod";
import * as userService from "../services/user.service.js";
import { getParam, getQuery } from "../lib/request-helpers.js";

const router = Router();

/**
 * GET /api/users/me
 */
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const profile = await userService.getUserProfile(req.user!.id);
    if (!profile) {
      res.status(404).json({ success: false, error: "Profile not found" });
      return;
    }
    res.json({ success: true, data: { ...profile, email: req.user!.email } });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/me
 */
const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  phone: z.string().max(20).optional(),
  avatarUrl: z.string().url().optional(),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/).optional(),
});

router.put(
  "/me",
  requireAuth,
  validate(updateProfileSchema),
  async (req, res, next) => {
    try {
      const updated = await userService.updateUserProfile(req.user!.id, req.body);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/users/me/stats
 */
router.get("/me/stats", requireAuth, async (req, res, next) => {
  try {
    const stats = await userService.getUserStats(req.user!.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/search?q=
 */
router.get("/search", requireAuth, async (req, res, next) => {
  try {
    const query = getQuery(req, "q") || "";
    if (query.length < 2) {
      res.json({ success: true, data: [] });
      return;
    }
    const results = await userService.searchUsers(query, req.user!.id);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:username
 */
router.get("/:username", requireAuth, async (req, res, next) => {
  try {
    const profile = await userService.getUserByUsername(getParam(req, "username"));
    if (!profile) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

export default router;
