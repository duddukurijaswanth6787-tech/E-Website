import { Router, Request, Response, NextFunction } from 'express';
import { User } from '../users/user.model';
import { Order } from '../orders/order.model';
import { Address } from '../addresses/address.model';
import { Wishlist } from '../wishlist/wishlist.model';
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

// ADMIN: List all users with order stats aggregation
router.get('/', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_USERS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip } = parsePagination(req);
      const filter: Record<string, unknown> = { deletedAt: null, role: 'customer' };

      if (req.query.isBlocked !== undefined) filter.isBlocked = req.query.isBlocked === 'true';
      if (req.query.search) {
        filter.$or = [
          { name: new RegExp(req.query.search as string, 'i') },
          { email: new RegExp(req.query.search as string, 'i') },
          { mobile: new RegExp(req.query.search as string, 'i') },
        ];
      }

      const [users, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        User.countDocuments(filter),
      ]);

      // Aggregate order stats for these users
      const userIds = users.map(u => u._id);
      const orderStats = await Order.aggregate([
        { $match: { user: { $in: userIds } } },
        {
          $group: {
            _id: '$user',
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$total' },
            lastOrderDate: { $max: '$createdAt' },
            pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          },
        },
      ]);

      const statsMap = new Map(orderStats.map(s => [String(s._id), s]));
      const enrichedUsers = users.map(u => ({
        ...u,
        totalOrders: statsMap.get(String(u._id))?.totalOrders || 0,
        totalSpent: statsMap.get(String(u._id))?.totalSpent || 0,
        lastOrderDate: statsMap.get(String(u._id))?.lastOrderDate || null,
        pendingOrders: statsMap.get(String(u._id))?.pendingOrders || 0,
        deliveredOrders: statsMap.get(String(u._id))?.deliveredOrders || 0,
        cancelledOrders: statsMap.get(String(u._id))?.cancelledOrders || 0,
      }));

      sendPaginated(res, enrichedUsers, buildPaginationMeta(total, page, limit));
    } catch (err) { next(err); }
  }
);

// ADMIN: Get single user with full profile, orders, addresses
router.get('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_USERS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) throw new NotFoundError('User');

      const [orders, addresses, wishlistCount, orderStats] = await Promise.all([
        Order.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(50).lean(),
        Address.find({ user: req.params.id }).lean(),
        (async () => {
          try {
            const w = await Wishlist.findOne({ user: req.params.id });
            return w?.items?.length || 0;
          } catch { return 0; }
        })(),
        Order.aggregate([
          { $match: { user: user._id } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: '$total' },
              pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
              deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
              cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
            },
          },
        ]),
      ]);

      const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0, pendingOrders: 0, deliveredOrders: 0, cancelledOrders: 0 };

      sendSuccess(res, { user, orders, addresses, wishlistCount, stats });
    } catch (err) { next(err); }
  }
);

// ADMIN: Block / Unblock user
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
