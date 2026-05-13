import { Request, Response, NextFunction } from 'express';
import { StudentRepository } from '../repositories/StudentRepository';
import { ProgressRepository } from '../repositories/ProgressRepository';
import { AuthRequest } from '../middleware/auth';
import { studentDashboardService } from '../services/StudentDashboardService';

const studentRepository = new StudentRepository();
const progressRepository = new ProgressRepository();

export class StudentController {
  static async getAllStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const students = await studentRepository.findAll();
      res.status(200).json({ success: true, data: students });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const student = await studentRepository.findById(req.params.id);

      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      res.status(200).json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentStudent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const student = await studentRepository.findById(req.user.sub);

      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      res.status(200).json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const progress = await progressRepository.findByStudentId(req.user.sub);
      const stats = studentDashboardService.getProgressStats(progress);

      res.status(200).json({
        success: true,
        data: {
          progress,
          stats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const dashboard = await studentDashboardService.getDashboard(req.user.sub);

      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentRepository.create(req.body);
      res.status(201).json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  static async updateStudent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const student = await studentRepository.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  static async deleteStudent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await studentRepository.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}