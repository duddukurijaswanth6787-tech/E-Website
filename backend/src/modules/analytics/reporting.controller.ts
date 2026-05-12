import { Request, Response } from 'express';
import { BusinessAnalyticsService } from './businessAnalytics.service';
import { ExportService } from './export.service';
import { Order } from '../orders/order.model';
import { User } from '../users/user.model';
import { sendSuccess } from '../../common/responses';

export class ReportingController {
  /**
   * Get Executive Business Insights
   */
  static async getExecutiveInsights(req: Request, res: Response) {
    const [financials, funnel, retention, workforce, traffic] = await Promise.all([
      BusinessAnalyticsService.getFinancialGrowth(30),
      BusinessAnalyticsService.getConversionFunnel(30),
      BusinessAnalyticsService.getCustomerRetention(),
      BusinessAnalyticsService.getWorkforceKPIs(),
      BusinessAnalyticsService.getTrafficSources(30)
    ]);

    return sendSuccess(res, {
      financials,
      funnel,
      retention,
      workforce: workforce[0] || {},
      marketing: {
        traffic
      }
    }, 'Executive insights retrieved');
  }

  /**
   * Get Real-time Marketing Activity
   */
  static async getMarketingActivity(req: Request, res: Response) {
    const activity = await BusinessAnalyticsService.getRecentActivity(20);
    return sendSuccess(res, activity, 'Marketing activity retrieved');
  }

  /**
   * Track Event (Public)
   */
  static async trackEvent(req: Request, res: Response) {
    const { type, path, metadata, utm, device, guestId } = req.body;
    
    // We import Event model here to avoid circular dependencies if any, 
    // but better to use a dedicated service if it grows
    const { Event } = await import('./event.model');
    
    await Event.create({
      type,
      path,
      metadata,
      utm,
      device,
      guestId,
      user: (req as any).user?._id
    });

    return sendSuccess(res, null, 'Event tracked');
  }

  /**
   * Export Orders to CSV
   */
  static async exportOrders(req: Request, res: Response) {
    const orders = await Order.find({ deletedAt: null }).populate('user', 'name email').lean();
    const formatted = ExportService.formatOrdersForExport(orders);
    const csv = ExportService.jsonToCsv(formatted, ['OrderNumber', 'Customer', 'Email', 'Total', 'Status', 'PaymentStatus', 'Date', 'ItemsCount']);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=orders-export-${Date.now()}.csv`);
    return res.status(200).send(csv);
  }

  /**
   * Export Customers to CSV
   */
  static async exportCustomers(req: Request, res: Response) {
    const customers = await User.find({ role: 'customer', deletedAt: null }).lean();
    const formatted = ExportService.formatCustomersForExport(customers);
    const csv = ExportService.jsonToCsv(formatted, ['Name', 'Email', 'Mobile', 'JoinedAt']);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=customers-export-${Date.now()}.csv`);
    return res.status(200).send(csv);
  }

  /**
   * Get Behavioral Heatmap Data
   */
  static async getHeatmapData(req: Request, res: Response) {
    const { path, type } = req.query;
    const data = await BusinessAnalyticsService.getHeatmapData(path as string, type as string);
    return sendSuccess(res, data, 'Heatmap data retrieved');
  }
}
