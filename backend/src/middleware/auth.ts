// ============================================================
// academia.io - Auth Middleware
// ============================================================
// Verifies JWT from Authorization header.
// Attaches user payload to request for downstream handlers.
// Supports role-based access control via requireRole().
// ============================================================

import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { AuthRequest, JwtPayload } from "../types/index.js";

/**
 * Extracts and verifies JWT from the Authorization header.
 * If valid, attaches the decoded payload to req.user.
 * If missing/invalid, returns 401.
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Missing or invalid authorization header" });
    return;
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}

/**
 * Middleware factory: restricts access to specific roles.
 * Must be used AFTER `authenticate`.
 *
 * Usage:
 *   router.get("/admin", authenticate, requireRole("admin", "super_admin"), handler)
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Authentication required" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: "Insufficient permissions" });
      return;
    }
    next();
  };
}
