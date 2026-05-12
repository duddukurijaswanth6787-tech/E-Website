import { Request, Response, NextFunction } from 'express';
import { adminAuthService } from './adminAuth.service';
import { sendSuccess } from '../../common/responses';
import { BadRequestError } from '../../common/errors';
import { auditLogService } from '../auditLogs/auditLog.service';
import { AuditSeverity } from '../auditLogs/auditLog.model';

export class AdminAuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminAuthService.login(req.body.email, req.body.password, req.ip);
      
      if ('accessToken' in result) {
        // Log successful login
        await auditLogService.log({
          actor: {
            id: result.admin.id,
            name: result.admin.name,
            email: result.admin.email,
            role: result.admin.role
          },
          module: 'AUTH',
          action: 'LOGIN',
          entity: { type: 'ADMIN', id: result.admin.id },
          description: `Admin ${result.admin.name} logged in from ${req.ip}`,
          context: { ipAddress: req.ip, userAgent: req.headers['user-agent'] },
          severity: AuditSeverity.INFO
        });
      }

      sendSuccess(res, result, result.requiresOtp ? 'MFA Required' : 'Admin login successful');
    } catch (err) { 
      // Failed login attempts are high-risk
      if (req.body.email) {
        await auditLogService.logSecurityEvent({
          actor: { id: '000000000000000000000000', name: 'UNAUTHENTICATED', email: req.body.email, role: 'unknown' },
          module: 'AUTH',
          action: 'FAILED_LOGIN',
          entity: { type: 'ADMIN' },
          description: `Failed login attempt for ${req.body.email} from ${req.ip}`,
          context: { ipAddress: req.ip, userAgent: req.headers['user-agent'] },
          status: 'failure'
        });
      }
      next(err); 
    }
  }

  async verifyLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body;
      const result = await adminAuthService.verifyLoginOTP(email, otp, req.ip);
      sendSuccess(res, result, 'MFA bypass successful. Login confirmed.');
    } catch (err) { next(err); }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new BadRequestError('Refresh token required');
      const result = await adminAuthService.refreshToken(refreshToken);
      sendSuccess(res, result, 'Token refreshed');
    } catch (err) { next(err); }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminAuthService.logout(req.admin!.adminId, req.body.refreshToken || '');
      sendSuccess(res, null, 'Logged out');
    } catch (err) { next(err); }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminAuthService.getMe(req.admin!.adminId);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }
}

export const adminAuthController = new AdminAuthController();
