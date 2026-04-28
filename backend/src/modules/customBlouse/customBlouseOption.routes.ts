import { Router, Request, Response, NextFunction } from 'express';
import { customBlouseOptionService } from './customBlouseOption.service';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { sendSuccess, sendCreated } from '../../common/responses';
import { PERMISSIONS } from '../../common/constants';

const router = Router();

/**
 * @swagger
 * /api/v1/custom-blouse-options:
 *   get:
 *     summary: Get all active custom blouse options
 *     tags: [CustomBlouseOptions]
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await customBlouseOptionService.getActiveOptions();
    sendSuccess(res, data, 'Active custom blouse options retrieved');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/custom-blouse-options/admin:
 *   get:
 *     summary: Get all custom blouse options (Admin only)
 *     tags: [CustomBlouseOptions]
 */
router.get('/admin', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CUSTOM_BLOUSE), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await customBlouseOptionService.getAllOptions();
    sendSuccess(res, data, 'All custom blouse options retrieved');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/custom-blouse-options:
 *   post:
 *     summary: Create a new custom blouse option (Admin only)
 *     tags: [CustomBlouseOptions]
 */
router.post('/', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CUSTOM_BLOUSE), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await customBlouseOptionService.createOption(req.body);
    sendCreated(res, data, 'Option created successfully');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/custom-blouse-options/{id}:
 *   patch:
 *     summary: Update a custom blouse option (Admin only)
 *     tags: [CustomBlouseOptions]
 */
router.patch('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CUSTOM_BLOUSE), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = await customBlouseOptionService.updateOption(id as string, req.body);
    sendSuccess(res, data, 'Option updated successfully');
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/custom-blouse-options/{id}:
 *   delete:
 *     summary: Delete a custom blouse option (Admin only)
 *     tags: [CustomBlouseOptions]
 */
router.delete('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CUSTOM_BLOUSE), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await customBlouseOptionService.deleteOption(id as string);
    sendSuccess(res, null, 'Option deleted successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
