import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";
import { eq } from "drizzle-orm";

/**
 * Role-based access control middleware
 * Must be used AFTER requireAuth middleware
 */
export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    try {
      const [user] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: "Forbidden — insufficient permissions",
        });
      }

      next();
    } catch (error) {
      console.error("Role check error:", error);

      return res.status(500).json({
        success: false,
        error: "Failed to check permissions",
      });
    }
  };
}