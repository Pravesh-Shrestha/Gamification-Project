import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { StudentRepository } from '../repositories/StudentRepository';
import { IUser } from '../types';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../middleware/rbac';

const userRepo = new UserRepository();
const studentRepo = new StudentRepository();

export class AdminController {
  // List users (admins and students) - scoped to school if provided
  static async listUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.query;
      let users: IUser[];

      if (schoolId && String(schoolId).trim() !== '') {
        users = await userRepo.findAllBySchool(String(schoolId));
        return res.status(200).json({ success: true, data: users });
      }

      // If master, return all users
      if (req.user?.role === UserRole.MASTER) {
        users = await userRepo.findAll();
        return res.status(200).json({ success: true, data: users });
      }

      // otherwise scope to the requester's school if available
      if (req.user?.schoolId) {
        users = await userRepo.findAllBySchool(String(req.user.schoolId));
      } else {
        users = [];
      }

      return res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  // Create a user: admin/staff or student
  static async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { role, email, name, password, school, grade } = req.body;

      if (!role || !email || !name) {
        return res.status(400).json({ success: false, message: 'role, email and name are required' });
      }

      if (role === 'student') {
        if (!school || !grade || !password) {
          return res.status(400).json({ success: false, message: 'school, grade and password required for students' });
        }
        const student = await studentRepo.create({ name, email, password, school, grade, totalPoints: 0, currentStreak: 0, longestStreak: 0, level: 1 });
        return res.status(201).json({ success: true, data: student });
      }

      // role can be 'admin' or 'teacher' -> map to DB role union type
      const dbRole: 'school_admin' | 'staff' = role === 'admin' ? 'school_admin' : 'staff';

      const user = await userRepo.create({ email, name, role: dbRole, schoolId: req.user?.schoolId });
      return res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // Update any user (students or admins) - admins can update students; master can update anyone
  static async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payload = req.body;

      // Decide whether target is student or user
      const targetUser = await userRepo.findById(id);
      if (targetUser) {
        // If target is an admin user, only master can update
        const isAdminUser = ['superadmin', 'school_admin'].includes((targetUser as any).role);
        if (isAdminUser && req.user?.role !== UserRole.MASTER) {
          return res.status(403).json({ success: false, message: 'Forbidden: only master can modify admin users' });
        }

        const updated = await userRepo.update(id, payload);
        return res.status(200).json({ success: true, data: updated });
      }

      // Try student
      const updatedStudent = await studentRepo.update(id, payload);
      return res.status(200).json({ success: true, data: updatedStudent });
    } catch (error) {
      next(error);
    }
  }

  // Delete a user - admins may delete students/staff; master may delete any user
  static async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // check if user exists in user collection
      const targetUser = await userRepo.findById(id);
      if (targetUser) {
        // If target is admin-level, only master can delete
        const isAdminUser = ['superadmin', 'school_admin'].includes((targetUser as any).role);
        if (isAdminUser && req.user?.role !== UserRole.MASTER) {
          return res.status(403).json({ success: false, message: 'Forbidden: only master can delete admin users' });
        }

        await userRepo.delete(id);
        return res.status(204).send();
      }

      // else try student
      await studentRepo.delete(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default AdminController;
