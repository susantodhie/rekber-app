import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";
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
  // cek user login
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  try {
    // ambil kycStatus dari tabel users
    const [user] = await db
      .select({ kycStatus: users.kycStatus })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    // cek status KYC
    if (!user || user.kycStatus !== "verified") {
      return res.status(403).json({
        success: false,
        message: "Akun belum terverifikasi. Selesaikan KYC terlebih dahulu.",
      });
    }

    // lanjut ke next middleware
    next();
  } catch (error) {
    console.error("KYC check error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to check KYC status",
    });
  }
}