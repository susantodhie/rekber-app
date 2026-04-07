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

// Custom registration removed in favor of Better Auth's /api/auth/sign-up/email

/**
 * BETTER AUTH HANDLER
 */
router.all("/api/auth/*splat", toNodeHandler(auth));

export default router;