import { Router } from 'express';
import { cmsController } from './cms.controller';
import { updateHeroValidation } from './cms.validation';
import { handleValidationErrors, authenticateAdmin, requirePermission } from '../../common/middlewares';
import { PERMISSIONS } from '../../common/constants';

const publicRouter = Router();
const adminRouter = Router();

// Public routes: /api/v1/cms/home/hero
publicRouter.get('/home/hero', cmsController.getPublicHero);

// Admin routes: /api/v1/admin/cms/home/hero
adminRouter.get(
  '/home/hero',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_CONTENT),
  cmsController.getAdminHero
);

adminRouter.put(
  '/home/hero',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_CONTENT),
  updateHeroValidation,
  handleValidationErrors,
  cmsController.updateHero
);

export { publicRouter as cmsRoutes, adminRouter as adminCmsRoutes };

