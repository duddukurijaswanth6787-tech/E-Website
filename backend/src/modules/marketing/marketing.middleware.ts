import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../common/errors';
import { MARKETING_ROLES, ROLE_PERMISSION_MATRIX } from './marketing.constants';
import { MarketingAuditLog } from './audit.model';

/**
 * SaaS Tenant Middleware
 * Ensures every marketing request is scoped to a specific tenant (store)
 */
export const injectTenantId = (req: Request, _res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'] || req.admin?.tenantId || 'vasanthi_main';
  (req as any).tenantId = tenantId as string;
  next();
};

/**
 * Marketing RBAC Middleware
 * Validates if the current admin has the required marketing permission
 */
export const requireMarketingPermission = (permission: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const rawRole = req.admin?.role?.toUpperCase();
    
    if (!rawRole) {
      throw new UnauthorizedError('Admin role not identified');
    }

    // Map global store roles to Marketing ERP roles safely
    let adminRole = rawRole as MARKETING_ROLES;
    if (rawRole === 'SUPER_ADMIN' || rawRole === 'ADMIN') {
      adminRole = MARKETING_ROLES.SUPER_ADMIN;
    }

    const permissions = ROLE_PERMISSION_MATRIX[adminRole] || [];
    
    if (!permissions.includes(permission)) {
      throw new ForbiddenError(`Missing required marketing permission: ${permission}`);
    }

    next();
  };
};

/**
 * Enterprise Audit Logger
 * Logs critical marketing actions to the database for compliance
 */
export const auditMarketingAction = (action: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await MarketingAuditLog.create({
        tenantId: (req as any).tenantId,
        adminId: req.admin?.adminId,
        action,
        resource: req.originalUrl,
        payload: req.method !== 'GET' ? req.body : undefined,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      next();
    } catch (err) {
      console.error('Audit Logging Failed:', err);
      next(); // Don't block the request if audit logging fails
    }
  };
};

