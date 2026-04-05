import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { uploadImage } from "../middleware/upload.middleware.js";
import { z } from "zod";
import * as escrowService from "../services/escrow.service.js";
import * as adminService from "../services/admin.service.js";
import { getParam, getQueryInt, getQuery } from "../lib/request-helpers.js";

const router = Router();

/**
 * POST /api/escrow — Create new escrow
 */
const createEscrowSchema = z.object({
  itemName: z.string().min(1).max(255),
  category: z.string().min(1).max(100),
  description: z.string().optional(),
  counterpartyUsername: z.string().min(1),
  role: z.enum(["buyer", "seller"]),
  amount: z.number().positive().min(10000, "Minimum transaction: Rp 10.000"),
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
 * GET /api/escrow — List user's escrow transactions
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const params = {
      page: getQueryInt(req, "page", 1),
      pageSize: getQueryInt(req, "pageSize", 10),
      status: getQuery(req, "status"),
      sort: getQuery(req, "sort") as any,
    };
    const result = await escrowService.listEscrows(req.user!.id, params);
    res.json({
      success: true,
      data: result.transactions,
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
 * GET /api/escrow/:id — Get escrow detail
 */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const escrow = await escrowService.getEscrowDetail(getParam(req, "id"), req.user!.id);
    if (!escrow) {
      res.status(404).json({ success: false, error: "Escrow not found" });
      return;
    }
    res.json({ success: true, data: escrow });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/escrow/:id/pay — Buyer pays
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
 * POST /api/escrow/:id/ship — Seller ships
 */
router.post("/:id/ship", requireAuth, uploadImage.single("shippingProof"), async (req, res, next) => {
  try {
    const { trackingNumber } = req.body;
    if (!trackingNumber) {
      res.status(400).json({ success: false, error: "Tracking number is required" });
      return;
    }

    const shippingProofUrl = req.file ? `/uploads/shipping/${req.file.filename}` : undefined;

    const result = await escrowService.shipEscrow(
      getParam(req, "id"),
      req.user!.id,
      trackingNumber,
      shippingProofUrl
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/escrow/:id/confirm — Buyer confirms receipt
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
 * POST /api/escrow/:id/cancel — Cancel escrow
 */
router.post("/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    const result = await escrowService.cancelEscrow(getParam(req, "id"), req.user!.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/escrow/:id/dispute — Open dispute
 */
const disputeSchema = z.object({
  reason: z.string().min(10, "Please provide a detailed reason"),
  evidenceUrls: z.array(z.string().url()).optional(),
});

router.post("/:id/dispute", requireAuth, validate(disputeSchema), async (req, res, next) => {
  try {
    const dispute = await adminService.openDispute(
      getParam(req, "id"),
      req.user!.id,
      req.body.reason,
      req.body.evidenceUrls
    );
    res.status(201).json({ success: true, data: dispute });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/escrow/:id/history — Status change history
 */
router.get("/:id/history", requireAuth, async (req, res, next) => {
  try {
    const history = await escrowService.getEscrowHistory(getParam(req, "id"));
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/escrow/:id/join — Join transaction
 */
router.post("/:id/join", requireAuth, async (req, res, next) => {
  try {
    const result = await escrowService.joinTransaction(getParam(req, "id"), req.user!.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/escrow/:id/proof — Upload transaction proof
 */
router.post("/:id/proof", requireAuth, uploadImage.single("proof"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: "Proof image is required" });
      return;
    }
    const proofUrl = `/uploads/${req.file.filename}`;
    const result = await escrowService.uploadEscrowProof(getParam(req, "id"), req.user!.id, proofUrl);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/escrow/:id/approve-payment — Admin approves payment
 */
router.post("/:id/approve-payment", requireAuth, async (req, res, next) => {
  try {
    const result = await escrowService.adminApprovePayment(getParam(req, "id"), req.user!.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/escrow/:id/reject-payment — Admin rejects payment
 */
const rejectPaymentSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
});

router.post("/:id/reject-payment", requireAuth, validate(rejectPaymentSchema), async (req, res, next) => {
  try {
    const result = await escrowService.adminRejectPayment(getParam(req, "id"), req.user!.id, req.body.reason);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/escrow/:id/admin-join — Admin joins the transaction chat
 */
router.post("/:id/admin-join", requireAuth, async (req, res, next) => {
  try {
    const result = await escrowService.adminJoinChat(getParam(req, "id"), req.user!.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/escrow/:id/chat-start — Start transaction chat
 */
router.post("/:id/chat-start", requireAuth, async (req, res, next) => {
  try {
    const result = await escrowService.startTransactionChat(getParam(req, "id"), req.user!.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/escrow/:id/chat-complete — Complete transaction chat
 */
router.post("/:id/chat-complete", requireAuth, async (req, res, next) => {
  try {
    const result = await escrowService.completeTransactionChat(getParam(req, "id"), req.user!.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
