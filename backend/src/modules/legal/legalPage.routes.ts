import { Router } from 'express';
import { LegalPageController } from './legalPage.controller';
import { authenticateAdmin } from '../../common/middlewares';
import { validateZod } from '../../common/middlewares/zodValidate.middleware';
import { legalSchema } from '../../common/validation/enterprise.schemas';

const router = Router();

/**
 * Public Routes
 */
router.get('/public/:slug', LegalPageController.getBySlug);

/**
 * Admin Routes (Protected)
 */
router.use(authenticateAdmin);

router.get('/admin/list', LegalPageController.getAll);
router.get('/admin/detail/:slug', LegalPageController.getAdminDetail);
router.post('/admin/save', validateZod(legalSchema), LegalPageController.save);
router.post('/admin/publish/:slug', LegalPageController.publish);
router.post('/admin/rollback', LegalPageController.rollback);

export default router;
