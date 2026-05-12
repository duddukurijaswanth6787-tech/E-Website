import { Router } from 'express';
import * as MarketingController from './marketing.controller';
import * as IntelligenceController from './marketing.intelligence.controller';
import * as AutomationController from './marketing.automation.controller';
import { RetentionController } from './retention/retention.controller';
import { authenticateAdmin } from '../../common/middlewares';
import { validateZod } from '../../common/middlewares/zodValidate.middleware';
import { 
  getStatsSchema, 
  getSalesTrendsSchema, 
  createInfluencerSchema, 
  trackBehaviorSchema, 
  trackFunnelSchema,
  createWelcomeBannerSchema,
  updateWelcomeBannerSchema,
  saveOnboardingWizardSchema
} from './marketing.validation';
import { 
  injectTenantId, 
  requireMarketingPermission, 
  auditMarketingAction 
} from './marketing.middleware';
import { MARKETING_PERMISSIONS } from './marketing.constants';

const publicRouter = Router();
const adminRouter = Router();

// --- PUBLIC ROUTES ---
publicRouter.get('/retention/public-activities', RetentionController.getActiveActivities);

// Public Welcome Banners
publicRouter.get('/welcome-banners/active', MarketingController.getActiveWelcomeBanners);
publicRouter.post('/welcome-banners/:id/track', MarketingController.trackWelcomeBannerAction);

// Public Onboarding Wizard
publicRouter.get('/onboarding-wizard/active', MarketingController.getActiveOnboardingWizard);

// --- ADMIN ROUTES ---
// Global Security & Multi-tenancy for Admin Routes
adminRouter.use(authenticateAdmin);
adminRouter.use(injectTenantId);

// M-1 Dashboard Stats
adminRouter.get('/stats', 
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_DASHBOARD), 
  validateZod(getStatsSchema), 
  MarketingController.getMarketingStats
);

// M-13 Sales Trends
adminRouter.get('/sales-trends', 
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_FINANCIALS), 
  validateZod(getSalesTrendsSchema), 
  MarketingController.getSalesTrends
);

// M-9 Influencers
adminRouter.get('/influencers', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_INFLUENCERS), 
  IntelligenceController.getInfluencers
);
adminRouter.post('/influencers', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_INFLUENCERS), 
  validateZod(createInfluencerSchema),
  auditMarketingAction('ONBOARD_INFLUENCER'),
  IntelligenceController.createInfluencer
);

// M-11 Ad Performance
adminRouter.get('/ad-campaigns', 
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_AI_INSIGHTS), 
  IntelligenceController.getAdCampaigns
);

// M-12 Funnel Tracking
adminRouter.get('/funnel-analytics', 
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_BEHAVIOR), 
  IntelligenceController.getFunnelAnalytics
);
adminRouter.post('/funnel-track', 
  validateZod(trackFunnelSchema),
  IntelligenceController.trackFunnelStep
);

// M-14 Heatmaps
adminRouter.get('/heatmap-data', 
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_BEHAVIOR), 
  IntelligenceController.getHeatmapData
);
adminRouter.post('/behavior-track', 
  validateZod(trackBehaviorSchema),
  IntelligenceController.trackBehaviorEvent
);

// M-15 Notification Engine
adminRouter.get('/templates', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_CAMPAIGNS), 
  AutomationController.getTemplates
);
adminRouter.post('/campaigns/:id/send', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_CAMPAIGNS), 
  auditMarketingAction('TRIGGER_CAMPAIGN'),
  AutomationController.sendCampaign
);

// M-16 AI Marketing
adminRouter.get('/ai/insights', 
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_AI_INSIGHTS), 
  AutomationController.getAIInsights
);

// M-3 Promo Blocks
adminRouter.get('/promo-blocks', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_BANNERS), 
  MarketingController.getPromoBlocks
);
adminRouter.post('/promo-blocks', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_BANNERS), 
  auditMarketingAction('CREATE_PROMO_BLOCK'),
  MarketingController.createPromoBlock
);

// M-5 Sticky Offers
adminRouter.get('/sticky-offers', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_BANNERS), 
  MarketingController.getStickyOffers
);

// M-8 Festival Campaigns
adminRouter.get('/festivals', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_CAMPAIGNS), 
  MarketingController.getFestivalCampaigns
);

// --- Retention & Social Activity System ---

// Protected Admin routes
adminRouter.get('/retention/settings', 
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_DASHBOARD), 
  RetentionController.getSettings
);

adminRouter.post('/retention/settings', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_CAMPAIGNS), 
  auditMarketingAction('UPDATE_RETENTION_SETTINGS'),
  RetentionController.updateSettings
);

adminRouter.post('/retention/cleanup', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_CAMPAIGNS), 
  auditMarketingAction('TRIGGER_MANUAL_CLEANUP'),
  RetentionController.triggerCleanup
);

adminRouter.post('/retention/emergency-purge', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_CAMPAIGNS), 
  auditMarketingAction('EMERGENCY_DATA_PURGE'),
  RetentionController.emergencyPurge
);

// M-17: Welcome Banners
adminRouter.get('/welcome-banners',
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_DASHBOARD),
  MarketingController.getWelcomeBanners
);
adminRouter.post('/welcome-banners',
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_BANNERS),
  validateZod(createWelcomeBannerSchema),
  auditMarketingAction('CREATE_WELCOME_BANNER'),
  MarketingController.createWelcomeBanner
);
adminRouter.put('/welcome-banners/:id',
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_BANNERS),
  validateZod(updateWelcomeBannerSchema),
  auditMarketingAction('UPDATE_WELCOME_BANNER'),
  MarketingController.updateWelcomeBanner
);
adminRouter.delete('/welcome-banners/:id',
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_BANNERS),
  auditMarketingAction('DELETE_WELCOME_BANNER'),
  MarketingController.deleteWelcomeBanner
);

// M-18: Onboarding Wizard
adminRouter.get('/onboarding-wizard',
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_DASHBOARD),
  MarketingController.getOnboardingWizard
);
adminRouter.put('/onboarding-wizard',
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_BANNERS),
  validateZod(saveOnboardingWizardSchema),
  auditMarketingAction('UPDATE_ONBOARDING_WIZARD'),
  MarketingController.saveOnboardingWizard
);

publicRouter.use(adminRouter);
export default publicRouter;

