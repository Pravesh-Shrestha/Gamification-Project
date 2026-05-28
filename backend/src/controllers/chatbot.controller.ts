import { Response } from "express";
import { AuthRequest } from "../types/index.js";
import { processMessage, getChatHistory } from "../services/chatbot.service.js";

export async function sendMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await processMessage(req.user!.userId, req.body.message);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function chatHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const history = await getChatHistory(req.user!.userId, limit);
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
}
