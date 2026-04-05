import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { uploadImage } from "../middleware/upload.middleware.js";
import { z } from "zod";
import * as kycService from "../services/kyc.service.js";
import { getParam, getQueryInt } from "../lib/request-helpers.js";

const router = Router();

/**
 * GET /api/kyc/status
 */
router.get("/status", requireAuth, async (req, res, next) => {
  try {
    const status = await kycService.getKycStatus(req.user!.id);
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/kyc/submit
 */
router.post(
  "/submit",
  requireAuth,
  uploadImage.fields([
    { name: "ktpFile", maxCount: 1 },
    { name: "selfieFile", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files?.ktpFile?.[0] || !files?.selfieFile?.[0]) {
        res.status(400).json({ success: false, error: "Both KTP photo and selfie are required" });
        return;
      }

      const { fullName, nik, birthDate } = req.body;

      if (!fullName || !nik || !birthDate) {
        res.status(400).json({ success: false, error: "fullName, nik, and birthDate are required" });
        return;
      }

      if (nik.length !== 16 || !/^\d{16}$/.test(nik)) {
        res.status(400).json({ success: false, error: "NIK must be exactly 16 digits" });
        return;
      }

      const ktpFileUrl = `/uploads/kyc/${files.ktpFile[0].filename}`;
      const selfieFileUrl = `/uploads/kyc/${files.selfieFile[0].filename}`;

      const submission = await kycService.submitKyc(
        req.user!.id,
        { fullName, nik, birthDate },
        ktpFileUrl,
        selfieFileUrl
      );

      res.status(201).json({ success: true, data: submission });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/kyc/submissions — [Admin]
 */
router.get("/submissions", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const page = getQueryInt(req, "page", 1);
    const pageSize = getQueryInt(req, "pageSize", 10);
    const submissions = await kycService.listPendingKycSubmissions(page, pageSize);
    res.json({ success: true, data: submissions });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/kyc/:id/approve — [Admin]
 */
router.post("/:id/approve", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const submission = await kycService.approveKyc(getParam(req, "id"), req.user!.id);
    res.json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/kyc/:id/reject — [Admin]
 */
const rejectSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
});

router.post("/:id/reject", requireAuth, requireRole("admin"), validate(rejectSchema), async (req, res, next) => {
  try {
    const submission = await kycService.rejectKyc(getParam(req, "id"), req.user!.id, req.body.reason);
    res.json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
});

export default router;
