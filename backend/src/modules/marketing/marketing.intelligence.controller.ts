import { Request, Response, NextFunction } from 'express';
import { Influencer, AdCampaign, FunnelStep, BehaviorEvent } from './marketing.intelligence.models';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/responses';
import { NotFoundError } from '../../common/errors';

// --- M-9: Influencer Marketing ---
export const getInfluencers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await Influencer.find({ tenantId: req.tenantId }).sort({ 'analytics.totalRevenue': -1 }).lean();
    sendSuccess(res, list);
  } catch (err) { next(err); }
};

export const createInfluencer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const influencer = await Influencer.create({ ...req.body, tenantId: req.tenantId });
    sendCreated(res, influencer);
  } catch (err) { next(err); }
};

// --- M-11: Ad Performance ---
export const getAdCampaigns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaigns = await AdCampaign.find({ tenantId: req.tenantId }).sort({ startDate: -1 }).lean();
    sendSuccess(res, campaigns);
  } catch (err) { next(err); }
};

export const trackAdPerformance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const update = { $inc: { 'metrics.impressions': req.body.impressions || 0, 'metrics.clicks': req.body.clicks || 0 } };
    const campaign = await AdCampaign.findOneAndUpdate({ _id: id, tenantId: req.tenantId }, update, { new: true });
    sendSuccess(res, campaign);
  } catch (err) { next(err); }
};

// --- M-12: Conversion Funnel ---
export const getFunnelAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stages = ['visitor', 'product_view', 'add_to_cart', 'checkout', 'purchase'];
    const analytics = await Promise.all(stages.map(async (stage) => {
      const count = await FunnelStep.countDocuments({ tenantId: req.tenantId, stage: stage as any });
      return { stage, count };
    }));
    sendSuccess(res, analytics);
  } catch (err) { next(err); }
};

export const trackFunnelStep = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const step = await FunnelStep.create({ ...req.body, tenantId: req.tenantId });
    sendCreated(res, step);
  } catch (err) { next(err); }
};

// --- M-14: Behavior Intelligence (Heatmaps) ---
export const trackBehaviorEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await BehaviorEvent.create({ ...req.body, tenantId: req.tenantId });
    sendCreated(res, event);
  } catch (err) { next(err); }
};

export const getHeatmapData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageUrl, eventType = 'click' } = req.query;
    const events = await BehaviorEvent.find({ 
      tenantId: req.tenantId,
      pageUrl: pageUrl as string, 
      eventType: eventType as any 
    }).select('x y scrollDepth').limit(1000).lean();
    sendSuccess(res, events);
  } catch (err) { next(err); }
};

