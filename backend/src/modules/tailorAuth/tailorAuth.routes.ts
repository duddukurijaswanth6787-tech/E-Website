import { Router } from 'express';
import { login, refreshToken, logout } from './tailorAuth.controller';
import { validateZod } from '../../common/middlewares/zodValidate.middleware';
import { tailorLoginSchema, tailorRefreshTokenSchema } from './tailorAuth.validation';
import { authenticateTailor } from '../../common/middlewares/auth.middleware';
import 'express-async-errors';

const router = Router();

router.post('/login', validateZod(tailorLoginSchema), login);
router.post('/refresh-token', validateZod(tailorRefreshTokenSchema), refreshToken);
router.post('/logout', authenticateTailor, logout);

export const tailorAuthRoutes = router;
