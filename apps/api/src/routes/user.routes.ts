import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { z } from "zod";
import * as userService from "../services/user.service.js";
import { getQuery } from "../lib/request-helpers.js";

const router = Router();

/**
 * GET /api/users/me
 */
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await userService.getUser(req.user!.id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/me
 */
const updateSchema = z.object({
  email: z.string().email().optional(),
});

router.put(
  "/me",
  requireAuth,
  validate(updateSchema),
  async (req, res, next) => {
    try {
      const updated = await userService.updateUser(req.user!.id, req.body);

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
      return res.json({ success: true, data: [] });
    }

    const results = await userService.searchUsers(query, req.user!.id);

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

export default router;