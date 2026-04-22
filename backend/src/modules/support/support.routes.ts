import { Router, Request, Response, NextFunction } from 'express';
import { SupportTicket } from './support.model';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { sendSuccess, sendCreated, sendPaginated } from '../../common/responses';
import { PERMISSIONS } from '../../common/constants';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination';
import { NotFoundError } from '../../common/errors';

const router = Router();

// PUBLIC: Submit contact form
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, mobile, subject, message } = req.body;
    const ticket = await SupportTicket.create({ name, email, mobile, subject, message });
    sendCreated(res, { id: ticket._id }, 'Message received. We will get back to you soon!');
  } catch (err) { next(err); }
});

// ADMIN routes
router.get('/', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_SUPPORT),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip } = parsePagination(req);
      const filter: Record<string, unknown> = {};
      if (req.query.status) filter.status = req.query.status;

      const [tickets, total] = await Promise.all([
        SupportTicket.find(filter).populate('assignedTo', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        SupportTicket.countDocuments(filter),
      ]);
      sendPaginated(res, tickets, buildPaginationMeta(total, page, limit));
    } catch (err) { next(err); }
  }
);

router.patch('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_SUPPORT),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await SupportTicket.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          ...(req.body.status === 'resolved' ? { resolvedAt: new Date() } : {}),
        },
        { new: true }
      );
      if (!ticket) throw new NotFoundError('Ticket');
      sendSuccess(res, ticket, 'Ticket updated');
    } catch (err) { next(err); }
  }
);

export default router;
