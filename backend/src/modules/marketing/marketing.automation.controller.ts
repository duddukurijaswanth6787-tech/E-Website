import { Request, Response, NextFunction } from 'express';
import { 
  NotificationTemplate, 
  NotificationCampaign, 
  AIPrediction, 
  AutomationRule 
} from './marketing.automation.models';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/responses';
import { NotFoundError } from '../../common/errors';

// --- M-15: Notification Engine ---
export const getTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await NotificationTemplate.find({ tenantId: req.tenantId }).sort({ createdAt: -1 }).lean();
    sendSuccess(res, templates);
  } catch (err) { next(err); }
};

export const createTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await NotificationTemplate.create({ ...req.body, tenantId: req.tenantId });
    sendCreated(res, template);
  } catch (err) { next(err); }
};

export const getCampaigns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaigns = await NotificationCampaign.find({ tenantId: req.tenantId })
      .populate('template')
      .sort({ createdAt: -1 })
      .lean();
    sendSuccess(res, campaigns);
  } catch (err) { next(err); }
};

export const sendCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await NotificationCampaign.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId }, 
      { status: 'sending' }, 
      { new: true }
    );
    if (!campaign) throw new NotFoundError('Campaign');
    
    // In a real system, this would trigger a background worker (BullMQ/Redis)
    setTimeout(async () => {
      await NotificationCampaign.findByIdAndUpdate(campaign._id, { 
        status: 'completed',
        'analytics.sent': 1200,
        'analytics.delivered': 1180
      });
    }, 2000);

    sendSuccess(res, campaign, 'Campaign processing started');
  } catch (err) { next(err); }
};

// --- M-16: AI Marketing ---
export const getAIPredictions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;
    const filter: any = { tenantId: req.tenantId };
    if (type) filter.type = type;

    const predictions = await AIPrediction.find(filter)
      .populate('customer', 'name email avatar')
      .sort({ score: -1 })
      .limit(50)
      .lean();
    sendSuccess(res, predictions);
  } catch (err) { next(err); }
};

export const getAIInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    // Aggregated AI insights for the dashboard
    const insights = {
      churnRisk: await AIPrediction.countDocuments({ tenantId, type: 'churn', score: { $gt: 0.7 } }),
      avgLTV: 4200, // Predicted
      topRecommendations: ['Summer Silk Saree', 'Bridal Blouse V2'],
      revenueForecast: [
        { month: 'Apr', predicted: 450000, actual: 420000 },
        { month: 'May', predicted: 520000, actual: null }
      ]
    };
    sendSuccess(res, insights);
  } catch (err) { next(err); }
};

// --- Automation Rules ---
export const getAutomationRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rules = await AutomationRule.find({ tenantId: req.tenantId }).sort({ createdAt: -1 }).lean();
    sendSuccess(res, rules);
  } catch (err) { next(err); }
};

export const createAutomationRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rule = await AutomationRule.create({ ...req.body, tenantId: req.tenantId });
    sendCreated(res, rule);
  } catch (err) { next(err); }
};

