import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../auth/index.js";
import { z } from "zod";
import { db } from "../db/index.js";
import { user, account } from "../db/schema/auth.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const router = Router();

/**
 * REGISTER
 */
const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/api/auth/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.errors.map(e => e.message).join(", "),
      });
    }

    const { name, email, password } = parsed.data;

    // check existing
    const existing = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Email sudah terdaftar",
      });
    }

    const userId = uuidv4();
    const now = new Date();
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user
    await db.insert(user).values({
      id: userId,
      name,
      email,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    });

    // insert account
    await db.insert(account).values({
      id: uuidv4(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: { userId, email },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

/**
 * BETTER AUTH HANDLER
 */
router.all("/api/auth/*splat", toNodeHandler(auth));

export default router;