import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { StudentController } from '../controllers/StudentController';
import { authMiddleware } from '../middleware/auth';
import { rbacMiddleware, UserRole } from '../middleware/rbac';

const router: RouterType = Router();

// Public routes
router.get('/', StudentController.getAllStudents);
router.post('/', StudentController.createStudent);

// Student-focused dashboard routes
router.get('/me/dashboard', authMiddleware, rbacMiddleware(UserRole.STUDENT), StudentController.getStudentDashboard);
router.get('/me/profile', authMiddleware, rbacMiddleware(UserRole.STUDENT), StudentController.getCurrentStudent);
router.get(
  '/me/progress',
  authMiddleware,
  rbacMiddleware([UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN]),
  StudentController.getStudentProgress
);

// Protected routes (require authentication)
router.get('/:id', authMiddleware, StudentController.getStudentById);
router.put('/:id', authMiddleware, StudentController.updateStudent);
router.delete('/:id', authMiddleware, rbacMiddleware(UserRole.ADMIN), StudentController.deleteStudent);

export default router;