import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { z } from "zod";
import * as escrowService from "../services/escrow.service.js";
import * as adminService from "../services/admin.service.js";
import { getParam } from "../lib/request-helpers.js";

const router = Router();

/**
 * CREATE ESCROW
 */
const createEscrowSchema = z.object({
  itemName: z.string(),
  category: z.string(),
  description: z.string().optional(),
  counterpartyEmail: z.string().email(),
  role: z.enum(["buyer", "seller"]),
  amount: z.number().positive(),
  paymentMethod: z.enum(["wallet", "qris", "dana"]).optional(),
});

router.post("/", requireAuth, validate(createEscrowSchema), async (req, res, next) => {
  try {
    const escrow = await escrowService.createEscrow(req.user!.id, req.body);
    res.status(201).json({ success: true, data: escrow });
  } catch (error) {
    next(error);
  }
});

/**
 * LIST ESCROW
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const data = await escrowService.listEscrows(req.user!.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

/**
 * PAY ESCROW
 */
router.post("/:id/pay", requireAuth, async (req, res, next) => {
  try {
    const result = await escrowService.payEscrow(getParam(req, "id"), req.user!.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * CONFIRM ESCROW
 */
router.post("/:id/confirm", requireAuth, async (req, res, next) => {
  try {
    const result = await escrowService.confirmEscrow(getParam(req, "id"), req.user!.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * OPEN DISPUTE
 */
const disputeSchema = z.object({
  reason: z.string().min(5),
});

router.post("/:id/dispute", requireAuth, validate(disputeSchema), async (req, res, next) => {
  try {
    const dispute = await adminService.openDispute(
      getParam(req, "id"),
      req.user!.id,
      req.body.reason
    );
    res.json({ success: true, data: dispute });
  } catch (error) {
    next(error);
  }
});

export default router;