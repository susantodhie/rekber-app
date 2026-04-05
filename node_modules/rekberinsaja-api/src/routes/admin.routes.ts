import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { z } from "zod";
import * as adminService from "../services/admin.service.js";
import { getParam, getQueryInt } from "../lib/request-helpers.js";

const router = Router();

// All admin routes require admin role
router.use(requireAuth, requireRole("admin"));

/**
 * GET /api/admin/dashboard
 */
router.get("/dashboard", async (_req, res, next) => {
  try {
    const stats = await adminService.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/disputes
 */
router.get("/disputes", async (req, res, next) => {
  try {
    const page = getQueryInt(req, "page", 1);
    const pageSize = getQueryInt(req, "pageSize", 10);
    const result = await adminService.listDisputes(page, pageSize);
    res.json({ success: true, data: result.disputes, pagination: { page, pageSize, total: result.total } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/disputes/:id/resolve
 */
const resolveSchema = z.object({
  resolution: z.enum(["resolved_buyer", "resolved_seller"]),
  note: z.string().min(1, "Resolution note is required"),
});

router.post("/disputes/:id/resolve", validate(resolveSchema), async (req, res, next) => {
  try {
    const result = await adminService.resolveDispute(getParam(req, "id"), req.user!.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/withdrawals
 */
router.get("/withdrawals", async (_req, res, next) => {
  try {
    const { withdrawals } = await import("../db/schema/withdrawals.js");
    const { eq, desc } = await import("drizzle-orm");
    const { db } = await import("../db/index.js");

    const pending = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.status, "pending"))
      .orderBy(desc(withdrawals.createdAt));

    res.json({ success: true, data: pending });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/withdrawals/:id/process
 */
const processWithdrawalSchema = z.object({
  approve: z.boolean(),
});

router.post("/withdrawals/:id/process", validate(processWithdrawalSchema), async (req, res, next) => {
  try {
    const result = await adminService.processWithdrawal(getParam(req, "id"), req.user!.id, req.body.approve);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/activity-log
 */
router.get("/activity-log", async (req, res, next) => {
  try {
    const page = getQueryInt(req, "page", 1);
    const pageSize = getQueryInt(req, "pageSize", 20);
    const log = await adminService.getActivityLog(page, pageSize);
    res.json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/kyc/pending
 */
router.get("/kyc/pending", async (_req, res, next) => {
  try {
    const pendingKyc = await adminService.getPendingKyc();
    res.json({ success: true, data: pendingKyc });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/kyc/approve/:userId
 */
router.post("/kyc/approve/:userId", async (req, res, next) => {
  try {
    const targetUserId = getParam(req, "userId");
    const result = await adminService.processKyc(targetUserId, req.user!.id, true);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/kyc/reject/:userId
 */
router.post("/kyc/reject/:userId", async (req, res, next) => {
  try {
    const targetUserId = getParam(req, "userId");
    const result = await adminService.processKyc(targetUserId, req.user!.id, false);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/users/:userId/promote
 */
router.post("/users/:userId/promote", async (req, res, next) => {
  try {
    const targetUserId = getParam(req, "userId");
    const result = await adminService.promoteToAdmin(targetUserId, req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
