import { Request, Response } from "express";
import { registerUser, loginUser, getCurrentUser } from "../services/auth.service.js";
import { getAllSchools } from "../services/school.service.js";
import { AuthRequest } from "../types/index.js";

export async function getSchools(req: Request, res: Response): Promise<void> {
  try {
    const schools = await getAllSchools();
    res.json({ success: true, data: schools });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    await registerUser(req.body);
    const loginResult = await loginUser(req.body.email, req.body.password);
    res.status(201).json({ success: true, data: loginResult });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = await loginUser(req.body.email, req.body.password);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await getCurrentUser(req.user!.userId);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
}
