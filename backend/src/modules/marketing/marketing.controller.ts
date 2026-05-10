import { Request, Response, NextFunction } from 'express';
import { Order } from '../orders/order.model';
import { User } from '../users/user.model';
import { Banner } from '../banners/banner.model';
import { Coupon } from '../coupons/coupon.model';
import { PromoBlock, StickyOffer, FestivalCampaign } from './marketing.models';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/responses';
import { NotFoundError } from '../../common/errors';

export const getMarketingStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    
    const [
      revenueStats,
      activeBanners,
      activeCoupons,
      activePromoBlocks,
      customerStats,
      campaigns
    ] = await Promise.all([
      Order.aggregate([
        { $match: { tenantId, status: { $ne: 'cancelled' }, paymentStatus: { $ne: 'failed' }, deletedAt: null } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            avgOrderValue: { $avg: '$total' },
            todayRevenue: {
              $sum: { $cond: [{ $gte: ['$createdAt', todayStart] }, '$total', 0] }
            }
          }
        }
      ]),
      Banner.countDocuments({ tenantId, isActive: true }),
      Coupon.countDocuments({ tenantId, isActive: true, validTo: { $gte: new Date() } }),
      PromoBlock.countDocuments({ tenantId, isActive: true }),
      User.countDocuments({ tenantId, role: 'customer', deletedAt: null }),
      FestivalCampaign.find({ tenantId, isActive: true }).limit(5).lean()
    ]);

    const revenue = revenueStats[0] || { totalRevenue: 0, avgOrderValue: 0, todayRevenue: 0 };

    sendSuccess(res, {
      kpis: {
        totalRevenue: revenue.totalRevenue,
        todayRevenue: revenue.todayRevenue,
        avgOrderValue: revenue.avgOrderValue,
        activeBanners,
        activeCoupons,
        activePromoBlocks,
        totalCustomers: customerStats,
        conversionRate: 3.8 
      },
      campaigns
    });
  } catch (err) { next(err); }
};

export const getSalesTrends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '7days' } = req.query;
    const tenantId = req.tenantId;
    let days = 7;
    if (period === '30days') days = 30;
    if (period === '90days') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Order.aggregate([
      { 
        $match: { 
          tenantId,
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' },
          paymentStatus: { $ne: 'failed' },
          deletedAt: null
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    sendSuccess(res, trends);
  } catch (err) { next(err); }
};

// --- PROMO BLOCKS (M-3) ---
export const getPromoBlocks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters: any = { tenantId: req.tenantId };
    if (req.query.placement) filters.placement = req.query.placement;
    if (req.query.isActive) filters.isActive = req.query.isActive === 'true';

    const blocks = await PromoBlock.find(filters).sort({ priority: -1, createdAt: -1 }).lean();
    sendSuccess(res, blocks);
  } catch (err) { next(err); }
};

export const createPromoBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const block = await PromoBlock.create({ ...req.body, tenantId: req.tenantId, createdBy: req.admin?.adminId });
    sendCreated(res, block);
  } catch (err) { next(err); }
};

export const updatePromoBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const block = await PromoBlock.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId }, 
      req.body, 
      { new: true }
    );
    if (!block) throw new NotFoundError('Promo Block');
    sendSuccess(res, block);
  } catch (err) { next(err); }
};

export const deletePromoBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const block = await PromoBlock.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!block) throw new NotFoundError('Promo Block');
    sendNoContent(res);
  } catch (err) { next(err); }
};

// --- STICKY OFFERS (M-5) ---
export const getStickyOffers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const offers = await StickyOffer.find({ tenantId: req.tenantId }).sort({ createdAt: -1 }).lean();
    sendSuccess(res, offers);
  } catch (err) { next(err); }
};

export const createStickyOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const offer = await StickyOffer.create({ ...req.body, tenantId: req.tenantId });
    sendCreated(res, offer);
  } catch (err) { next(err); }
};

export const updateStickyOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const offer = await StickyOffer.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId }, 
      req.body, 
      { new: true }
    );
    if (!offer) throw new NotFoundError('Sticky Offer');
    sendSuccess(res, offer);
  } catch (err) { next(err); }
};

// --- FESTIVAL CAMPAIGNS (M-8) ---
export const getFestivalCampaigns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaigns = await FestivalCampaign.find({ tenantId: req.tenantId }).sort({ startDate: -1 }).lean();
    sendSuccess(res, campaigns);
  } catch (err) { next(err); }
};

export const createFestivalCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await FestivalCampaign.create({ ...req.body, tenantId: req.tenantId });
    sendCreated(res, campaign);
  } catch (err) { next(err); }
};


