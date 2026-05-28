import { Response } from "express";
import { AuthRequest } from "../types/index.js";
import {
  createUser, updateUser, deleteUser, listUsers, resetPassword,
  createSchool, updateSchool, deleteSchool,
  createClass, updateClass, deleteClass, listClasses,
  getCreationRules,
} from "../services/admin.service.js";

export function getRules(req: AuthRequest, res: Response): void {
  res.json({ success: true, data: getCreationRules(req.user!.role) });
}

export async function getUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const users = await listUsers(req.user!.role, req.user!.schoolId, {
      role: req.query.role as string,
      schoolId: req.query.schoolId as string,
    });
    res.json({ success: true, data: users });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function addUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const r = await createUser(req.user!.role, req.user!.schoolId, req.body);
    res.status(201).json({ success: true, data: r });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function editUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const r = await updateUser(req.params.id, req.user!.role, req.user!.schoolId ?? null, req.body);
    res.json({ success: true, data: r });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function removeUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    await deleteUser(req.params.id, req.user!.role, req.user!.schoolId ?? null);
    res.json({ success: true, data: { deleted: true } });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function addSchool(req: AuthRequest, res: Response): Promise<void> {
  try {
    const r = await createSchool(req.user!.role, req.body);
    res.status(201).json({ success: true, data: r });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function editSchool(req: AuthRequest, res: Response): Promise<void> {
  try {
    const r = await updateSchool(req.params.id, req.body);
    res.json({ success: true, data: r });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function removeSchool(req: AuthRequest, res: Response): Promise<void> {
  try {
    await deleteSchool(req.params.id);
    res.json({ success: true, data: { deleted: true } });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function getClasses(req: AuthRequest, res: Response): Promise<void> {
  try {
    const schoolId = req.query.schoolId as string || req.user!.schoolId || undefined;
    const classes = await listClasses(schoolId);
    res.json({ success: true, data: classes });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function addClass(req: AuthRequest, res: Response): Promise<void> {
  try {
    const r = await createClass(req.body);
    res.status(201).json({ success: true, data: r });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function editClass(req: AuthRequest, res: Response): Promise<void> {
  try {
    const r = await updateClass(req.params.id, req.body);
    res.json({ success: true, data: r });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function removeClass(req: AuthRequest, res: Response): Promise<void> {
  try {
    await deleteClass(req.params.id);
    res.json({ success: true, data: { deleted: true } });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}

export async function resetUserPassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await resetPassword(req.params.id, req.user!.role, req.user!.schoolId ?? null);
    res.json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, error: e.message }); }
}
