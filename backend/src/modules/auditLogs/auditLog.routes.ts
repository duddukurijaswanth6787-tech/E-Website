import { Router, Request, Response, NextFunction } from 'express';
import { AuditLog } from './auditLog.model';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { sendSuccess, sendPaginated } from '../../common/responses';
import { PERMISSIONS } from '../../common/constants';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination';

const router = Router();

router.get('/', authenticateAdmin, requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip } = parsePagination(req, 50);
      const filter: Record<string, unknown> = {};
      if (req.query.module) filter.module = req.query.module;
      if (req.query.admin) filter.admin = req.query.admin;

      const [logs, total] = await Promise.all([
        AuditLog.find(filter)
          .populate('admin', 'name email role')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        AuditLog.countDocuments(filter),
      ]);
      sendPaginated(res, logs, buildPaginationMeta(total, page, limit));
    } catch (err) { next(err); }
  }
);

export default router;
