import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { MasterController } from '../controllers/MasterController';

const router: RouterType = Router();

router.post('/schools', MasterController.createSchool);
router.post('/schools/:id/license', MasterController.createLicense);
router.post('/schools/:id/admins', MasterController.createAdmin);

export default router;
