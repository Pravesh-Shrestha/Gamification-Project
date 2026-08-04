// ============================================================
// academia.io - Chatbot Routes
// ============================================================

import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { sendMessage, chatHistory } from "../controllers/chatbot.controller.js";

const router = Router();

// ── Send Message ──────────────────────────────────────────
const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(500, "Message too long"),
});

router.post("/message", authenticate, validate(messageSchema), sendMessage as any);

// ── Get Chat History ──────────────────────────────────────
router.get("/history", authenticate, chatHistory as any);

export default router;
