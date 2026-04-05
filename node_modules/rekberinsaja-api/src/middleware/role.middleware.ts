import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { userProfiles } from "../db/schema/users.js";
import { eq } from "drizzle-orm";

/**
 * Role-based access control middleware
 * Must be used AFTER requireAuth middleware
 */
export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    try {
      const [profile] = await db
        .select({ role: userProfiles.role })
        .from(userProfiles)
        .where(eq(userProfiles.userId, req.user.id))
        .limit(1);

      if (!profile || !roles.includes(profile.role)) {
        res.status(403).json({
          success: false,
          error: "Forbidden — insufficient permissions",
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to check permissions",
      });
    }
  };
}
