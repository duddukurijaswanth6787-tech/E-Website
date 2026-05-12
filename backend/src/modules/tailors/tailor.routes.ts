import { Router } from 'express';
import { createTailor, getTailors, getTailorById, updateTailor, updateTailorStatus, deleteTailor } from './tailor.controller';
import { validateZod } from '../../common/middlewares/zodValidate.middleware';
import { createTailorSchema, updateTailorSchema, getTailorsQuerySchema, updateTailorStatusSchema } from './tailor.validation';
import { authenticateAdmin, requirePermission } from '../../common/middlewares/auth.middleware';
import { PERMISSIONS } from '../../common/constants/roles';
import 'express-async-errors';

const router = Router();

// Apply RBAC to all routes
router.use(authenticateAdmin);
router.use(requirePermission(PERMISSIONS.MANAGE_TAILORS));

router.route('/')
  .post(validateZod(createTailorSchema), createTailor)
  .get(validateZod(getTailorsQuerySchema), getTailors);

router.route('/:id')
  .get(getTailorById)
  .put(validateZod(updateTailorSchema), updateTailor)
  .delete(deleteTailor);

router.patch('/:id/status', validateZod(updateTailorStatusSchema), updateTailorStatus);

export const tailorAdminRoutes = router;
