import { Router, Request, Response, NextFunction } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createReview, getTopPublicReviews, getUserReviews, getAllReviews } from "../services/review.service.js";

const router = Router();

// ============================================================
// Public Routes
// ============================================================
router.get("/public/top", async (req, res, next) => {
  try {
    const reviews = await getTopPublicReviews(10);
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// Protected Routes
// ============================================================
router.use(requireAuth);

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) throw new Error("Unauthorized");

    const { escrowId, rating, comment } = req.body;

    const review = await createReview({
      escrowId,
      reviewerId: user.id,
      rating,
      comment,
    });

    res.json({ success: true, data: review, message: "Ulasan berhasil dikirim" });
  } catch (error) {
    next(error);
  }
});

router.get("/my-reviews", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) throw new Error("Unauthorized");

    const reviews = await getUserReviews(user.id);
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
});

// For Admin to see all reviews
router.get("/all", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await getAllReviews();
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
});

export default router;
