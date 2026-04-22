import { Router, Request, Response } from 'express';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { PERMISSIONS, ROLE_PERMISSIONS, ADMIN_ROLES } from '../../common/constants';
import { sendSuccess } from '../../common/responses';

const router = Router();

// ADMIN ROUTES
router.get('/',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_ROLES),
  (_req: Request, res: Response) => {
    // Expose the static role configuration from the backend source
    sendSuccess(res, {
      roles: Object.values(ADMIN_ROLES),
      rolePermissions: ROLE_PERMISSIONS,
    });
  }
);

router.get('/permissions',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_ROLES),
  (_req: Request, res: Response) => {
    // Expose all valid permission strings
    sendSuccess(res, Object.values(PERMISSIONS));
  }
);

export default router;
