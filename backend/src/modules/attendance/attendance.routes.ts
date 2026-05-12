import { Router } from 'express';
import * as attendanceController from './attendance.controller';
import { authenticateUser } from '../../common/middlewares/auth.middleware';
import { validateZod } from '../../common/middlewares/zodValidate.middleware';
import { attendanceSchema } from '../../common/validation/enterprise.schemas';

const router = Router();

// Employees can check in/out
router.post('/check-in', authenticateUser, validateZod(attendanceSchema), attendanceController.checkIn);
router.post('/check-out', authenticateUser, validateZod(attendanceSchema), attendanceController.checkOut);
router.get('/history', authenticateUser, attendanceController.getAttendanceHistory);

export default router;
