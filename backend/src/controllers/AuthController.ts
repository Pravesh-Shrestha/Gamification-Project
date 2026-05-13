import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';
import { StudentRepository } from '../repositories/StudentRepository';
// use require to avoid missing type declarations at runtime in dev
const jwt: any = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
const DEV_DEMO_EMAIL = process.env.DEV_DEMO_EMAIL || 'demo@academia.io';
const DEV_DEMO_PASSWORD = process.env.DEV_DEMO_PASSWORD || 'demo';
const DEMO_STUDENT_EMAIL = process.env.DEV_DEMO_STUDENT_EMAIL || 'seed@example.com';
const DEMO_STUDENT_PASSWORD = process.env.DEV_DEMO_STUDENT_PASSWORD || 'seedpassword';

const studentRepository = new StudentRepository();

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, externalId } = req.body;

      // Development demo login shortcut (no DB required)
      if (process.env.NODE_ENV !== 'production' && email && password) {
        if (email === DEV_DEMO_EMAIL && password === DEV_DEMO_PASSWORD) {
          let demoStudent = await studentRepository.findByEmail(DEMO_STUDENT_EMAIL);

          if (!demoStudent) {
            demoStudent = await studentRepository.create({
              name: 'Seed User',
              email: DEMO_STUDENT_EMAIL,
              password: DEMO_STUDENT_PASSWORD,
              school: 'Demo School',
              grade: '5',
              totalPoints: 0,
              currentStreak: 0,
              longestStreak: 0,
              level: 1,
            });
          }

          const token = jwt.sign(
            { sub: demoStudent._id, role: 'student', name: demoStudent.name, schoolId: demoStudent.school },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          return res.status(200).json({
            success: true,
            data: {
              token,
              user: { id: demoStudent._id, name: demoStudent.name, role: 'student' },
            },
          });
        }
      }

      if (externalId) {
        const result = await authService.loginWithExternalId(externalId);
        return res.status(200).json({ success: true, data: result });
      }

      if (!email || !password) return res.status(400).json({ success: false, message: 'email and password required' });

      const result = await authService.loginWithEmail(email, password);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
