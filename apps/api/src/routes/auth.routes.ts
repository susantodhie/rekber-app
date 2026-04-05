import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../auth/index.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { z } from "zod";
import * as userService from "../services/user.service.js";
import { db } from "../db/index.js";
import { user, account } from "../db/schema/auth.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// ============================================================
// Custom register endpoint (BEFORE Better Auth catch-all)
// POST /api/auth/register
// ============================================================

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

router.post("/api/auth/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      });
      return;
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      res.status(409).json({
        success: false,
        error: "Email sudah terdaftar",
      });
      return;
    }

    // Create user
    const userId = uuidv4();
    const now = new Date();
    const hashedPassword = await bcrypt.hash(password, 12);

    await db.insert(user).values({
      id: userId,
      name,
      email,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    });

    // Create account (credential type for email/password)
    const accountId = uuidv4();
    await db.insert(account).values({
      id: accountId,
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    // Create profile + wallet
    try {
      await userService.createUserProfile(userId, name, email);
    } catch (profileErr) {
      console.warn("Profile creation deferred:", profileErr);
    }

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil! Silakan login.",
      data: { userId, email, name },
    });
  } catch (error: any) {
    console.error("[REGISTER ERROR]", error);

    // Handle database connection errors
    if (error?.cause?.code === "ECONNREFUSED") {
      res.status(503).json({
        success: false,
        error: "Database tidak tersedia. Silakan coba lagi nanti.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Terjadi kesalahan server. Silakan coba lagi.",
    });
  }
});

// ============================================================
// Better Auth catch-all handler
// All /api/auth/* requests are handled by Better Auth
// ============================================================
router.all("/api/auth/*splat", toNodeHandler(auth));

// ============================================================
// Custom auth extensions
// ============================================================

/**
 * POST /api/auth/hooks/after-signup
 * Called after Better Auth signup to create profile + wallet
 * (In practice, this is triggered via Better Auth hooks, but
 *  we also expose it as a manual endpoint for flexibility)
 */
router.post(
  "/api/auth/setup-profile",
  requireAuth,
  async (req, res, next) => {
    try {
      const user = req.user!;

      // Check if profile already exists
      const existing = await userService.getUserProfile(user.id);
      if (existing) {
        res.json({ success: true, data: existing });
        return;
      }

      const profile = await userService.createUserProfile(
        user.id,
        user.name,
        user.email
      );

      res.status(201).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/set-pin
 * Set or update 6-digit transaction PIN
 */
const setPinSchema = z.object({
  pin: z.string().length(6).regex(/^\d{6}$/, "PIN must be 6 digits"),
});

router.post(
  "/api/auth/set-pin",
  requireAuth,
  validate(setPinSchema),
  async (req, res, next) => {
    try {
      await userService.setTransactionPin(req.user!.id, req.body.pin);
      res.json({ success: true, message: "Transaction PIN updated" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/verify-pin
 * Verify transaction PIN
 */
const verifyPinSchema = z.object({
  pin: z.string().length(6),
});

router.post(
  "/api/auth/verify-pin",
  requireAuth,
  validate(verifyPinSchema),
  async (req, res, next) => {
    try {
      const valid = await userService.verifyTransactionPin(
        req.user!.id,
        req.body.pin
      );
      res.json({ success: true, data: { valid } });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
