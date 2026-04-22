import { Router, Request, Response, NextFunction } from 'express';
import { User } from '../users/user.model';
import { Order } from '../orders/order.model';
import { Address } from '../addresses/address.model';
import { authenticateUser, authenticateAdmin, requirePermission } from '../../common/middlewares';
import { sendSuccess, sendPaginated } from '../../common/responses';
import { PERMISSIONS } from '../../common/constants';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination';
import { NotFoundError } from '../../common/errors';

const router = Router();

// USER PROFILE
router.get('/me', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) throw new NotFoundError('User');
    sendSuccess(res, user);
  } catch (err) { next(err); }
});

router.put('/profile', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowed = ['name', 'mobile', 'avatar'];
    const updates: Record<string, unknown> = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user!.userId, updates, { new: true });
    sendSuccess(res, user, 'Profile fully synced');
  } catch (err) { next(err); }
});

router.patch('/me', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowed = ['name', 'mobile', 'avatar'];
    const updates: Record<string, unknown> = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user!.userId, updates, { new: true });
    sendSuccess(res, user, 'Profile updated');
  } catch (err) { next(err); }
});

// ADMIN: List all users
router.get('/', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_USERS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip } = parsePagination(req);
      const filter: Record<string, unknown> = { deletedAt: null };
      if (req.query.isBlocked) filter.isBlocked = req.query.isBlocked === 'true';
      if (req.query.search) filter.$or = [
        { name: new RegExp(req.query.search as string, 'i') },
        { email: new RegExp(req.query.search as string, 'i') },
      ];

      const [users, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        User.countDocuments(filter),
      ]);
      sendPaginated(res, users, buildPaginationMeta(total, page, limit));
    } catch (err) { next(err); }
  }
);

router.get('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_USERS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) throw new NotFoundError('User');
      const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(10).lean();
      sendSuccess(res, { user, orders });
    } catch (err) { next(err); }
  }
);

router.patch('/:id/block', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_USERS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isBlocked: req.body.block, blockedReason: req.body.reason },
        { new: true }
      );
      if (!user) throw new NotFoundError('User');
      sendSuccess(res, user, `User ${req.body.block ? 'blocked' : 'unblocked'}`);
    } catch (err) { next(err); }
  }
);

export default router;
