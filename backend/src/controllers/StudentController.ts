import { Request, Response, NextFunction } from 'express';
import { StudentRepository } from '../repositories/StudentRepository';

const studentRepository = new StudentRepository();

export class StudentController {
  static async getAllStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const students = await studentRepository.findAll();
      res.status(200).json({ success: true, data: students });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentById(req: Request, res: Response, next: NextFunction) {
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

  static async createStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentRepository.create(req.body);
      res.status(201).json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  static async updateStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentRepository.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  static async deleteStudent(req: Request, res: Response, next: NextFunction) {
    try {
      await studentRepository.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}