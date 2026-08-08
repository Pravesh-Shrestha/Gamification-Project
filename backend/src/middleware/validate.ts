// ============================================================
// academia.io - Zod Validation Middleware
// ============================================================
// Validates request body against a Zod schema before
// passing control to the route handler.
// Returns 400 with detailed error messages on failure.
// ============================================================

import { Response, NextFunction, Request } from "express";
import { ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );
      res.status(400).json({ success: false, error: "Validation failed", details: errors });
      return;
    }
    req.body = result.data; // Use the parsed (and possibly transformed) data
    next();
  };
}
