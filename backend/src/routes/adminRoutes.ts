import { Router } from 'express';
import AdminController from '../controllers/AdminController';
import { authMiddleware } from '../middleware/auth';
import { rbacMiddleware, UserRole } from '../middleware/rbac';

const router: ReturnType<typeof Router> = Router();

// All admin routes require authentication
router.use(authMiddleware);

// List users - admins and masters (admins scoped to their school)
router.get('/users', rbacMiddleware([UserRole.ADMIN, UserRole.MASTER]), AdminController.listUsers);

// Create user - admins can create students and lower roles; masters can create admins
router.post('/users', rbacMiddleware([UserRole.ADMIN, UserRole.MASTER]), AdminController.createUser);

// Update user - admins can update students; masters can update admins
router.put('/users/:id', rbacMiddleware([UserRole.ADMIN, UserRole.MASTER]), AdminController.updateUser);

// Delete user - only master can delete admin users; admins can delete students
router.delete('/users/:id', rbacMiddleware([UserRole.ADMIN, UserRole.MASTER]), AdminController.deleteUser);

export default router;
