import { Router } from "express";

const router = Router();

/**
 * GET /api/payment/config
 * Returns static payment configuration (DANA and QRIS)
 */
router.get("/config", (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        dana_number: "089664097386",
        qris_image_url: "/uploads/qris/qris.png"
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
