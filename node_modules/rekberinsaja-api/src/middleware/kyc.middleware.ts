import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { userProfiles } from "../db/schema/users.js";
import { eq } from "drizzle-orm";

/**
 * KYC verification middleware
 * Must be used AFTER requireAuth middleware
 */
export async function requireKyc(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
    return;
  }

  try {
    const [profile] = await db
      .select({ kycStatus: userProfiles.kycStatus })
      .from(userProfiles)
      .where(eq(userProfiles.userId, req.user.id))
      .limit(1);

    if (!profile || profile.kycStatus !== "verified") {
      res.status(403).json({
        success: false,
        message: "Akun belum terverifikasi. Selesaikan KYC terlebih dahulu.",
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to check KYC status",
    });
  }
}
