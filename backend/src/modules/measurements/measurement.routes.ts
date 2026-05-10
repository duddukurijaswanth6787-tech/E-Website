import { Router } from 'express';
import { measurementController } from './measurement.controller';
import { protect } from '../../common/middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/profiles', measurementController.getMyProfiles);
router.post('/profiles', measurementController.createProfile);
router.patch('/profiles/:id', measurementController.updateProfile);
router.delete('/profiles/:id', measurementController.deleteProfile);
router.post('/profiles/:id/default', measurementController.setDefault);
router.post('/profiles/:id/duplicate', measurementController.duplicateProfile);

export default router;
