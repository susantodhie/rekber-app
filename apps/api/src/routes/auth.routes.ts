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
 * REGISTER (CUSTOM)
 */
const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/register", async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors.map(e => e.message).join(", "),
      });
    }

    const { name, email, password } = parsed.data;

    // cek user existing
    const existing = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const userId = uuidv4();
    const now = new Date();
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert ke better-auth user table
    await db.insert(user).values({
      id: userId,
      name,
      email,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    });

    // insert ke custom users table
    const { users } = await import("../db/schema/users.js");
    await db.insert(users).values({
      id: userId,
      email,
      password: hashedPassword,
      transactionPin: "000000",
      role: "user",
      kycStatus: "pending",
      createdAt: now,
    });

    // insert account (better-auth)
    await db.insert(account).values({
      id: uuidv4(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    return res.status(200).json({
      success: true,
      message: "User created",
      data: {
        id: userId,
        name,
        email,
      },
    });

  } catch (error: any) {
    console.error("Register Error:", error);

    if (error?.code === "ECONNREFUSED") {
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
      });
    }

    return res.status(500).json({
      success: false,
      message: error?.message || "Internal server error",
    });
  }
});

/**
 * BETTER AUTH HANDLER (FIXED)
 * ❗ PENTING: JANGAN pakai /api/auth lagi di sini
 */
router.use("/", toNodeHandler(auth));

export default router;