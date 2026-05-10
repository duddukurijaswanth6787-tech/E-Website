import express from 'express';
import { createManager, getManagers, getManagerById, updateManager, updateManagerStatus, deleteManager, resetManagerPassword } from './manager.controller';
import { validateZod as validate } from '../../common/middlewares/zodValidate.middleware';
import { createManagerSchema, updateManagerSchema, updateManagerStatusSchema, resetManagerPasswordSchema } from './manager.validation';
import { authenticateAdmin, requirePermission } from '../../common/middlewares/auth.middleware';
import { PERMISSIONS } from '../../common/constants/roles';

const router = express.Router();

// All Manager CRUD operations are strictly SUPER_ADMIN only
router.use(authenticateAdmin);
router.use(requirePermission(PERMISSIONS.MANAGE_USERS));

router.post('/', validate(createManagerSchema), createManager);
router.get('/', getManagers);
router.get('/:id', getManagerById);
router.put('/:id', validate(updateManagerSchema), updateManager);
router.patch('/:id/status', validate(updateManagerStatusSchema), updateManagerStatus);
router.delete('/:id', deleteManager);
router.post('/:id/reset-password', validate(resetManagerPasswordSchema), resetManagerPassword);

export default router;
