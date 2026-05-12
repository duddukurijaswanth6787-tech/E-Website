import { Router, Request, Response, NextFunction } from 'express';
import { Order } from '../orders/order.model';
import { User } from '../users/user.model';
import { Product } from '../products/product.model';
import { CustomBlouse } from '../customBlouse/customBlouse.model';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { sendSuccess } from '../../common/responses';
import { PERMISSIONS } from '../../common/constants';
import { ReportingController } from './reporting.controller';
import { trackEventSchema, getHeatmapSchema } from './analytics.validation';
import { validateZod } from '../../common/middlewares/zodValidate.middleware';

const router = Router();

// --- Public Behavioral Tracking (Unauthenticated) ---
router.post('/public/track-event', validateZod(trackEventSchema), ReportingController.trackEvent);

// All other analytics routes require admin auth + VIEW_ANALYTICS permission
router.use(authenticateAdmin, requirePermission(PERMISSIONS.VIEW_ANALYTICS));

// Dashboard summary
router.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const [
      totalOrders, totalRevenue, totalUsers, totalProducts,
      pendingBlouseRequests, lowStockProducts,
      recentOrders, ordersByStatus,
      workflowStats,
      tailorStats,
      todayDeliveries
    ] = await Promise.all([
      Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'packed', 'shipped'] }, deletedAt: null }),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' }, paymentStatus: { $ne: 'failed' }, deletedAt: null } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      User.countDocuments({ role: 'customer', deletedAt: null }),
      Product.countDocuments({ status: 'published', deletedAt: null }),
      CustomBlouse.countDocuments({ status: { $in: ['submitted', 'under_review', 'price_assigned'] }, deletedAt: null }),
      Product.countDocuments({ stock: { $lte: 5 }, status: 'published', deletedAt: null }),
      Order.find({ deletedAt: null }).populate('user', 'name email').sort({ createdAt: -1 }).limit(10).lean(),
      Order.aggregate([{ $match: { deletedAt: null } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      
      import('../workflows/workflow.model').then(m => m.WorkflowTask.aggregate([
        { $match: { status: { $ne: 'Delivered' } } },
        {
          $group: {
            _id: null,
            pending: { $sum: { $cond: [{ $in: ['$status', ['Assigned', 'Fabric Received', 'Cutting']] }, 1, 0] } },
            active: { $sum: { $cond: [{ $in: ['$status', ['Stitching', 'Embroidery', 'Trial Ready']] }, 1, 0] } },
            delayed: { $sum: { $cond: [{ $lt: ['$deadline', new Date()] }, 1, 0] } },
            urgent: { $sum: { $cond: [{ $eq: ['$priority', 'Urgent'] }, 1, 0] } },
            qcPending: { $sum: { $cond: [{ $eq: ['$status', 'QC'] }, 1, 0] } },
            alteration: { $sum: { $cond: [{ $eq: ['$status', 'Alteration'] }, 1, 0] } },
            completedToday: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'Completed'] }, { $gte: ['$updatedAt', todayStart] }] }, 1, 0] } }
          }
        }
      ])),

      import('../tailors/tailor.model').then(m => m.Tailor.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            available: { $sum: { $cond: [{ $and: ['$isActive', '$isAvailable'] }, 1, 0] } },
            atCapacity: { $sum: { $cond: [{ $gte: ['$currentAssignedCount', '$dailyCapacity'] }, 1, 0] } },
            totalWorkload: { $sum: '$currentAssignedCount' },
            totalCapacity: { $sum: '$dailyCapacity' }
          }
        }
      ])),

      import('../workflows/workflow.model').then(m => m.WorkflowTask.find({
        deadline: { $gte: todayStart, $lte: todayEnd }
      }).populate('orderId').lean())
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
      production: {
        workflows: workflowStats[0] || { pending: 0, active: 0, delayed: 0, urgent: 0, qcPending: 0, alteration: 0, completedToday: 0 },
        tailors: tailorStats[0] || { total: 0, active: 0, available: 0, atCapacity: 0, totalWorkload: 0, totalCapacity: 0 },
        todayDeliveries: todayDeliveries || []
      }
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
      { $match: { status: { $ne: 'cancelled' }, paymentStatus: { $ne: 'failed' }, ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}) } },
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

// M-17 Executive Business Insights
router.get('/executive-insights', ReportingController.getExecutiveInsights);

// M-18 Marketing & Behavior (Live Feed)
router.get('/marketing-activity', ReportingController.getMarketingActivity);

// M-14 Behavioral Heatmaps
router.get('/heatmap-data', validateZod(getHeatmapSchema), ReportingController.getHeatmapData);

// M-16 Export Systems
router.get('/export/orders', ReportingController.exportOrders);
router.get('/export/customers', ReportingController.exportCustomers);

export default router;
