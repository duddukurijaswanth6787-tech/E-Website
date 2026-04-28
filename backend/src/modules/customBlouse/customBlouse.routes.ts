import { Router } from 'express';
import { customBlouseController } from './customBlouse.controller';
import { authenticateUser, authenticateAdmin, requirePermission } from '../../common/middlewares';
import { uploadMultipleImages } from '../../common/middlewares/upload.middleware';
import { PERMISSIONS } from '../../common/constants';

const router = Router();

// 1️⃣ Create request (customer) – multipart for reference images
router.post(
  '/',
  authenticateUser,
  (req, res, next) => uploadMultipleImages('custom-blouse', 'referenceImages', 10)(req, res, next),
  customBlouseController.create
);

// 2️⃣ Get customer's own requests
router.get('/user', authenticateUser, customBlouseController.getUserRequests);

// 3️⃣ Admin list (paginated) – must appear before /:id
router.get('/admin', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CUSTOM_BLOUSE), customBlouseController.getAllAdmin);

// 4️⃣ Get single request – accessible to owner or admin (controller will enforce)
router.get('/:id', authenticateUser, customBlouseController.getRequestById);

// 5️⃣ Admin updates – status, price, notes
router.patch('/:id/status', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CUSTOM_BLOUSE), customBlouseController.updateStatus);
router.patch('/:id/price', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CUSTOM_BLOUSE), customBlouseController.updatePrice);
router.patch('/:id/notes', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CUSTOM_BLOUSE), customBlouseController.updateNotes);

// 6️⃣ Upload additional reference images for an existing request
router.post(
  '/:id/uploads',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_CUSTOM_BLOUSE),
  (req, res, next) => uploadMultipleImages('custom-blouse', 'referenceImages', 10)(req, res, next),
  customBlouseController.uploadReferenceImages
);

export default router;
