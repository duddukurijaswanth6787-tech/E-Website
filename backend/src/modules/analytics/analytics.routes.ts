import { Router, Request, Response, NextFunction } from 'express';
import { Order } from '../orders/order.model';
import { User } from '../users/user.model';
import { Product } from '../products/product.model';
import { CustomBlouseRequest } from '../customBlouse/customBlouse.model';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { sendSuccess } from '../../common/responses';
import { PERMISSIONS } from '../../common/constants';

const router = Router();

// All analytics routes require admin auth + VIEW_ANALYTICS permission
router.use(authenticateAdmin, requirePermission(PERMISSIONS.VIEW_ANALYTICS));

// Dashboard summary
router.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalOrders, totalRevenue, totalUsers, totalProducts,
      pendingBlouseRequests, lowStockProducts,
      recentOrders, ordersByStatus,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      User.countDocuments({ deletedAt: null }),
      Product.countDocuments({ status: 'published', deletedAt: null }),
      CustomBlouseRequest.countDocuments({ status: { $in: ['submitted', 'under_review', 'price_assigned'] } }),
      Product.countDocuments({ stock: { $lte: 5 }, status: 'published', deletedAt: null }),
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10).lean(),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    sendSuccess(res, {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalUsers,
      totalProducts,
      pendingBlouseRequests,
      lowStockProducts,
      recentOrders,
      ordersByStatus: ordersByStatus.reduce((acc: Record<string, number>, item: { _id: string; count: number }) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    });
  } catch (err) { next(err); }
});

// Sales report by date range
router.get('/sales', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to, groupBy = 'day' } = req.query;
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.$gte = new Date(from as string);
    if (to) dateFilter.$lte = new Date(to as string);

    const groupFormat = groupBy === 'month' ? '%Y-%m' : groupBy === 'year' ? '%Y' : '%Y-%m-%d';

    const sales = await Order.aggregate([
      { $match: { paymentStatus: 'paid', ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}) } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    sendSuccess(res, sales);
  } catch (err) { next(err); }
});

// Top products
router.get('/top-products', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.total' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);
    sendSuccess(res, topProducts);
  } catch (err) { next(err); }
});

// Customer growth
router.get('/customer-growth', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const growth = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);
    sendSuccess(res, growth);
  } catch (err) { next(err); }
});

export default router;
