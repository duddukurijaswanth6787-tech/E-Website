import { Request, Response, NextFunction } from 'express';
import { Order } from '../orders/order.model';
import { User } from '../users/user.model';
import { Banner } from '../banners/banner.model';
import { Coupon } from '../coupons/coupon.model';
import { PromoBlock, StickyOffer, FestivalCampaign, WelcomeBanner, OnboardingWizard } from './marketing.models';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/responses';
import { NotFoundError } from '../../common/errors';

export const getMarketingStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId;
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

    // Calculate real conversion rate
    const [totalVisitors, totalOrdersCount] = await Promise.all([
      import('../analytics/event.model').then(m => m.Event.countDocuments({ tenantId, type: 'page_view' })),
      Order.countDocuments({ tenantId, status: { $ne: 'cancelled' }, deletedAt: null })
    ]);

    const conversionRate = totalVisitors > 0 
      ? Number(((totalOrdersCount / totalVisitors) * 100).toFixed(2)) 
      : 0;

    sendSuccess(res, {
      kpis: {
        totalRevenue: revenue.totalRevenue,
        todayRevenue: revenue.todayRevenue,
        avgOrderValue: revenue.avgOrderValue,
        activeBanners,
        activeCoupons,
        activePromoBlocks,
        totalCustomers: customerStats,
        conversionRate
      },
      campaigns
    });
  } catch (err) { next(err); }
};

export const getSalesTrends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '7days' } = req.query;
    const tenantId = (req as any).tenantId;
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
    const filters: any = { tenantId: (req as any).tenantId };
    if (req.query.placement) filters.placement = req.query.placement;
    if (req.query.isActive) filters.isActive = req.query.isActive === 'true';

    const blocks = await PromoBlock.find(filters).sort({ priority: -1, createdAt: -1 }).lean();
    sendSuccess(res, blocks);
  } catch (err) { next(err); }
};

export const createPromoBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const block = await PromoBlock.create({ ...req.body, tenantId: (req as any).tenantId, createdBy: req.admin?.adminId });
    sendCreated(res, block);
  } catch (err) { next(err); }
};

export const updatePromoBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const block = await PromoBlock.findOneAndUpdate(
      { _id: req.params.id, tenantId: (req as any).tenantId }, 
      req.body, 
      { new: true }
    );
    if (!block) throw new NotFoundError('Promo Block');
    sendSuccess(res, block);
  } catch (err) { next(err); }
};

export const deletePromoBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const block = await PromoBlock.findOneAndDelete({ _id: req.params.id, tenantId: (req as any).tenantId });
    if (!block) throw new NotFoundError('Promo Block');
    sendNoContent(res);
  } catch (err) { next(err); }
};

// --- STICKY OFFERS (M-5) ---
export const getStickyOffers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const offers = await StickyOffer.find({ tenantId: (req as any).tenantId }).sort({ createdAt: -1 }).lean();
    sendSuccess(res, offers);
  } catch (err) { next(err); }
};

export const createStickyOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const offer = await StickyOffer.create({ ...req.body, tenantId: (req as any).tenantId });
    sendCreated(res, offer);
  } catch (err) { next(err); }
};

export const updateStickyOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const offer = await StickyOffer.findOneAndUpdate(
      { _id: req.params.id, tenantId: (req as any).tenantId }, 
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
    const campaigns = await FestivalCampaign.find({ tenantId: (req as any).tenantId }).sort({ startDate: -1 }).lean();
    sendSuccess(res, campaigns);
  } catch (err) { next(err); }
};

export const createFestivalCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await FestivalCampaign.create({ ...req.body, tenantId: (req as any).tenantId });
    sendCreated(res, campaign);
  } catch (err) { next(err); }
};

// --- WELCOME BANNERS (M-17) ---
export const getWelcomeBanners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banners = await WelcomeBanner.find({ tenantId: (req as any).tenantId }).sort({ priority: -1, createdAt: -1 }).lean();
    sendSuccess(res, banners);
  } catch (err) { next(err); }
};

export const createWelcomeBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await WelcomeBanner.create({ ...req.body, tenantId: (req as any).tenantId });
    sendCreated(res, banner);
  } catch (err) { next(err); }
};

export const updateWelcomeBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await WelcomeBanner.findOneAndUpdate(
      { _id: req.params.id, tenantId: (req as any).tenantId },
      req.body,
      { new: true }
    );
    if (!banner) throw new NotFoundError('Welcome Banner');
    sendSuccess(res, banner);
  } catch (err) { next(err); }
};

export const deleteWelcomeBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await WelcomeBanner.findOneAndDelete({ _id: req.params.id, tenantId: (req as any).tenantId });
    if (!banner) throw new NotFoundError('Welcome Banner');
    sendNoContent(res);
  } catch (err) { next(err); }
};

export const getActiveWelcomeBanners = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Fetch all active banners first to guarantee visibility regardless of null date formats
    const rawBanners = await WelcomeBanner.find({ isActive: true }).sort({ priority: -1 }).lean();
    
    const now = new Date().getTime();
    const activeBanners = rawBanners.filter(b => {
      if (b.startDate && new Date(b.startDate).getTime() > now) return false; // Not started yet
      if (b.endDate && new Date(b.endDate).getTime() < now) return false; // Expired
      return true;
    });
    
    sendSuccess(res, activeBanners);
  } catch (err) { next(err); }
};

export const trackWelcomeBannerAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { action } = req.body; // 'view' or 'click'
    const updateQuery = action === 'click' ? { 'analytics.clicks': 1 } : { 'analytics.impressions': 1 };
    
    await WelcomeBanner.findByIdAndUpdate(req.params.id, { $inc: updateQuery });
    sendSuccess(res, null, 'Action tracked');
  } catch (err) { next(err); }
};

// --- ONBOARDING WIZARD (M-18) ---
export const getOnboardingWizard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let wizard = await OnboardingWizard.findOne({ tenantId: (req as any).tenantId }).lean();
    if (!wizard) {
      wizard = {
        tenantId: (req as any).tenantId,
        isActive: false,
        steps: [
          {
            title: 'Welcome to Vasanthi Creations',
            subtitle: 'Where Tradition Meets Modern Elegance',
            content: 'Experience the finest designer blouses and sarees, tailored specifically for you. Let us guide you through your luxury journey.',
            icon: 'Sparkles',
            color: 'blue'
          },
          {
            title: 'Discover Your Style',
            subtitle: 'Curated Collections for Every Occasion',
            content: 'From bridal masterpieces to contemporary designer wear, our collections are crafted to make you stand out.',
            icon: 'Heart',
            color: 'rose'
          },
          {
            title: 'Perfect Fit, Guaranteed',
            subtitle: 'Smart Measurement & Custom Tailoring',
            content: 'Save your measurements once and enjoy a perfect fit for all future orders. Our experts ensure precision in every stitch.',
            icon: 'Ruler',
            color: 'amber'
          },
          {
            title: 'Let’s Get Started',
            subtitle: 'Your Personal Boutique Experience',
            content: 'Create your profile to save favorites, track orders, and receive exclusive styling consultations.',
            icon: 'ShoppingBag',
            color: 'emerald'
          }
        ]
      } as any;
    }
    sendSuccess(res, wizard);
  } catch (err) { next(err); }
};

export const saveOnboardingWizard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive, steps } = req.body;
    const wizard = await OnboardingWizard.findOneAndUpdate(
      { tenantId: (req as any).tenantId },
      { isActive, steps },
      { new: true, upsert: true }
    );
    sendSuccess(res, wizard);
  } catch (err) { next(err); }
};

export const getActiveOnboardingWizard = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const wizard = await OnboardingWizard.findOne({ isActive: true }).lean();
    sendSuccess(res, wizard);
  } catch (err) { next(err); }
};
