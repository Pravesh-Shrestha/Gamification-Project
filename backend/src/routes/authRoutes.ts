import type { Router as RouterType } from 'express';
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router: RouterType = Router();

router.post('/login', AuthController.login);

export default router;
