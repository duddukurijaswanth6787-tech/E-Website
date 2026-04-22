import { Router, Request, Response, NextFunction } from 'express';
import { Admin } from './admin.model';
import { hashPassword } from '../../common/utils/hash';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../../common/responses';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../../common/constants';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination';
import { NotFoundError, ForbiddenError } from '../../common/errors';

const router = Router();

router.get('/', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_ADMINS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip } = parsePagination(req);
      const [admins, total] = await Promise.all([
        Admin.find({ deletedAt: null }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Admin.countDocuments({ deletedAt: null }),
      ]);
      sendPaginated(res, admins, buildPaginationMeta(total, page, limit));
    } catch (err) { next(err); }
  }
);

router.post('/', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_ADMINS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, role } = req.body;
      const permissions = ROLE_PERMISSIONS[role] || [];
      const passwordHash = await hashPassword(password);
      const admin = await Admin.create({
        name, email: email.toLowerCase(), passwordHash, role, permissions,
        createdBy: req.admin!.adminId,
      });
      sendCreated(res, admin, 'Admin created');
    } catch (err) { next(err); }
  }
);

router.put('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_ADMINS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admin = await Admin.findOne({ _id: req.params.id, deletedAt: null });
      if (!admin) throw new NotFoundError('Admin');
      if (req.body.role) req.body.permissions = ROLE_PERMISSIONS[req.body.role] || [];
      if (req.body.password) {
        req.body.passwordHash = await hashPassword(req.body.password);
        delete req.body.password;
      }
      Object.assign(admin, { ...req.body, updatedBy: req.admin!.adminId });
      await admin.save();
      sendSuccess(res, admin, 'Admin updated');
    } catch (err) { next(err); }
  }
);

router.patch('/:id/status', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_ADMINS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admin = await Admin.findByIdAndUpdate(
        req.params.id, { isActive: req.body.isActive }, { new: true }
      );
      if (!admin) throw new NotFoundError('Admin');
      sendSuccess(res, admin, `Admin ${req.body.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) { next(err); }
  }
);

router.delete('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_ADMINS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.params.id === req.admin!.adminId) throw new ForbiddenError('You cannot delete your own account');
      const a = await Admin.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
      if (!a) throw new NotFoundError('Admin');
      sendNoContent(res);
    } catch (err) { next(err); }
  }
);

export default router;
