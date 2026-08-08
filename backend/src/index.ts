// ============================================================
// academia.io - Server Entry Point
// ============================================================
// Express server with security middleware, route mounting,
// and error handling. Runs on port 3001 by default.
// ============================================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { ENV } from "./config/env.js";

// ── Import Routes ─────────────────────────────────────────
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import engineRoutes from "./routes/engine.routes.js";
import curriculumRoutes from "./routes/curriculum.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import contentRoutes from "./routes/content.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import projectRoutes from "./routes/project.routes.js";

const app = express();

// ── Security Middleware ───────────────────────────────────
app.use(helmet()); // Sets security headers (CSP, XSS, etc.)
app.use(cors({
  origin: ENV.CORS_ORIGIN,
  credentials: true,
}));

// ── Rate Limiting (prevents abuse) ────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  message: { success: false, error: "Too many requests, please try again later." },
});
app.use(limiter);

// ── Body Parsing ──────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));

// ── Request Logger Middleware ──────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ── Health Check ──────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

// ── Mount Routes ──────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/engine", engineRoutes);
app.use("/api/curriculum", curriculumRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/project", projectRoutes);

// ── 404 Handler ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ── Global Error Handler ──────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[SERVER ERROR]", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// ── Start Server ──────────────────────────────────────────
app.listen(ENV.PORT, () => {
  console.log(`🚀 academia.io server running on http://localhost:${ENV.PORT}`);
  console.log(`📚 API docs: http://localhost:${ENV.PORT}/api/health`);
});

// Trigger reload to apply new env and focus logic update.
