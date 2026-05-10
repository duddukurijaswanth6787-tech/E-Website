import express from 'express';
import { managerLogin, refreshManagerToken, managerLogout, changeManagerPassword } from './managerAuth.controller';
import { validateZod as validate } from '../../common/middlewares/zodValidate.middleware';
import { managerLoginSchema, managerRefreshSchema, changePasswordSchema } from './managerAuth.validation';
import { isManager as authenticateManager } from '../../middlewares/isManager';

const router = express.Router();

router.post('/login', validate(managerLoginSchema), managerLogin);
router.post('/refresh', validate(managerRefreshSchema), refreshManagerToken);
router.post('/logout', managerLogout);
router.patch('/change-password', authenticateManager, validate(changePasswordSchema), changeManagerPassword);

export default router;
