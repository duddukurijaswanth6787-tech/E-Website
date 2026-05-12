import { Order } from '../orders/order.model';
import { User } from '../users/user.model';
import { WorkflowTask } from '../workflows/workflow.model';
import { Product } from '../products/product.model';
import { Event } from './event.model';

export class BusinessAnalyticsService {
  /**
   * Get Revenue & Orders Summary (Growth Analysis)
   */
  static async getFinancialGrowth(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' }, deletedAt: null } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  /**
   * Get Conversion Funnel Analytics (Expanded Real Data)
   */
  static async getConversionFunnel(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [visitors, productViews, carts, checkoutStarts, orders] = await Promise.all([
      Event.countDocuments({ type: 'page_view', createdAt: { $gte: startDate } }),
      Event.countDocuments({ type: 'product_view', createdAt: { $gte: startDate } }),
      Event.countDocuments({ type: 'add_to_cart', createdAt: { $gte: startDate } }),
      Event.countDocuments({ type: 'checkout_start', createdAt: { $gte: startDate } }),
      Order.countDocuments({ createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } })
    ]);

    const totalVisitors = Math.max(visitors, 1);
    return [
      { stage: 'Store Visitors', count: totalVisitors, percentage: 100 },
      { stage: 'Product Views', count: productViews, percentage: Math.round((productViews / totalVisitors) * 100) },
      { stage: 'Add to Cart', count: carts, percentage: Math.round((carts / totalVisitors) * 100) },
      { stage: 'Checkout Start', count: checkoutStarts, percentage: Math.round((checkoutStarts / totalVisitors) * 100) },
      { stage: 'Successful Orders', count: orders, percentage: Math.round((orders / totalVisitors) * 100) }
    ];
  }

  /**
   * Get Marketing Traffic Sources
   */
  static async getTrafficSources(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await Event.aggregate([
      { $match: { type: 'page_view', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$utm.source',
          count: { $sum: 1 }
        }
      },
      { $project: { name: { $ifNull: ['$_id', 'Direct'] }, value: '$count' } },
      { $sort: { value: -1 } }
    ]);
  }

  /**
   * Get Recent Activity Feed (Real Events)
   */
  static async getRecentActivity(limit: number = 10) {
    return await Event.find()
      .sort('-createdAt')
      .limit(limit)
      .populate('user', 'name')
      .lean();
  }

  /**
   * Get Customer Cohort (New vs Repeat)
   */
  static async getCustomerRetention() {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const repeatCustomers = await Order.aggregate([
      { $group: { _id: '$user', orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: 'count' }
    ]);

    const repeatCount = repeatCustomers[0]?.count || 0;
    return {
      total: totalCustomers,
      new: totalCustomers - repeatCount,
      repeat: repeatCount,
      retentionRate: totalCustomers > 0 ? Math.round((repeatCount / totalCustomers) * 100) : 0
    };
  }

  /**
   * Get Workforce Operational KPIs
   */
  static async getWorkforceKPIs() {
    return await WorkflowTask.aggregate([
      {
        $group: {
          _id: null,
          avgCompletionDays: { 
            $avg: { $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60 * 24] } 
          },
          onTimeRate: {
            $avg: { $cond: [{ $lte: ['$updatedAt', '$deadline'] }, 1, 0] }
          },
          totalTasks: { $sum: 1 },
          delayedTasks: {
            $sum: { $cond: [{ $and: [{ $gt: [new Date(), '$deadline'] }, { $ne: ['$status', 'Delivered'] }] }, 1, 0] }
          }
        }
      }
    ]);
  }

  /**
   * Get Category Performance
   */
  static async getCategoryPerformance() {
    return await Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productDetail' } },
      { $unwind: '$productDetail' },
      {
        $group: {
          _id: '$productDetail.category',
          totalRevenue: { $sum: '$items.total' },
          totalUnits: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
  }

  /**
   * Get Heatmap Data (Behavioral Interaction points)
   */
  static async getHeatmapData(path: string, type: string = 'click', tenantId?: string) {
    const filters: any = { 
      path: new RegExp(path, 'i'),
      type: type === 'click' ? 'click' : type === 'scroll' ? 'scroll' : type
    };
    if (tenantId) filters.tenantId = tenantId;

    const events = await Event.find(filters)
      .sort('-createdAt')
      .limit(1000)
      .lean();

    return events
      .filter(e => e.metadata?.x !== undefined && e.metadata?.y !== undefined)
      .map(e => ({
        x: e.metadata!.x,
        y: e.metadata!.y,
        intensity: e.metadata?.intensity || 0.5,
        scrollDepth: e.metadata?.scrollDepth || 0
      }));
  }
}
