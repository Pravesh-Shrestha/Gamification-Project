import { Router } from 'express';
import { StudentController } from '../controllers/StudentController';

const router = Router();

router.get('/', StudentController.getAllStudents);
router.post('/', StudentController.createStudent);
router.get('/:id', StudentController.getStudentById);
router.put('/:id', StudentController.updateStudent);
router.delete('/:id', StudentController.deleteStudent);

export default router;