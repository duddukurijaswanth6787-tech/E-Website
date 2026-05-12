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

const router = Router();

router.get('/retention/public-activities', RetentionController.getActiveActivities);

// Public Welcome Banners
router.get('/welcome-banners/active', MarketingController.getActiveWelcomeBanners);
router.post('/welcome-banners/:id/track', MarketingController.trackWelcomeBannerAction);

// Public Onboarding Wizard
router.get('/onboarding-wizard/active', MarketingController.getActiveOnboardingWizard);


// Global Security & Multi-tenancy
router.use(authenticateAdmin);
router.use(injectTenantId);

// M-1 Dashboard Stats
router.get('/stats', 
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_DASHBOARD), 
  validateZod(getStatsSchema), 
  MarketingController.getMarketingStats
);

// M-13 Sales Trends
router.get('/sales-trends', 
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_FINANCIALS), 
  validateZod(getSalesTrendsSchema), 
  MarketingController.getSalesTrends
);

// M-9 Influencers
router.get('/influencers', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_INFLUENCERS), 
  IntelligenceController.getInfluencers
);
router.post('/influencers', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_INFLUENCERS), 
  validateZod(createInfluencerSchema),
  auditMarketingAction('ONBOARD_INFLUENCER'),
  IntelligenceController.createInfluencer
);

// M-11 Ad Performance
router.get('/ad-campaigns', 
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_AI_INSIGHTS), 
  IntelligenceController.getAdCampaigns
);

// M-12 Funnel Tracking
router.get('/funnel-analytics', 
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_BEHAVIOR), 
  IntelligenceController.getFunnelAnalytics
);
router.post('/funnel-track', 
  validateZod(trackFunnelSchema),
  IntelligenceController.trackFunnelStep
);

// M-14 Heatmaps
router.get('/heatmap-data', 
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_BEHAVIOR), 
  IntelligenceController.getHeatmapData
);
router.post('/behavior-track', 
  validateZod(trackBehaviorSchema),
  IntelligenceController.trackBehaviorEvent
);

// M-15 Notification Engine
router.get('/templates', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_CAMPAIGNS), 
  AutomationController.getTemplates
);
router.post('/campaigns/:id/send', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_CAMPAIGNS), 
  auditMarketingAction('TRIGGER_CAMPAIGN'),
  AutomationController.sendCampaign
);

// M-16 AI Marketing
router.get('/ai/insights', 
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_AI_INSIGHTS), 
  AutomationController.getAIInsights
);

// M-3 Promo Blocks
router.get('/promo-blocks', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_BANNERS), 
  MarketingController.getPromoBlocks
);
router.post('/promo-blocks', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_BANNERS), 
  auditMarketingAction('CREATE_PROMO_BLOCK'),
  MarketingController.createPromoBlock
);

// M-5 Sticky Offers
router.get('/sticky-offers', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_BANNERS), 
  MarketingController.getStickyOffers
);

// M-8 Festival Campaigns
router.get('/festivals', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_CAMPAIGNS), 
  MarketingController.getFestivalCampaigns
);

// --- Retention & Social Activity System ---

// Protected Admin routes
router.get('/retention/settings', 
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_DASHBOARD), 
  RetentionController.getSettings
);

router.post('/retention/settings', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_CAMPAIGNS), 
  auditMarketingAction('UPDATE_RETENTION_SETTINGS'),
  RetentionController.updateSettings
);

router.post('/retention/cleanup', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_CAMPAIGNS), 
  auditMarketingAction('TRIGGER_MANUAL_CLEANUP'),
  RetentionController.triggerCleanup
);

router.post('/retention/emergency-purge', 
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_CAMPAIGNS), 
  auditMarketingAction('EMERGENCY_DATA_PURGE'),
  RetentionController.emergencyPurge
);

// M-17: Welcome Banners
router.get('/welcome-banners',
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_DASHBOARD),
  MarketingController.getWelcomeBanners
);
router.post('/welcome-banners',
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_BANNERS),
  validateZod(createWelcomeBannerSchema),
  auditMarketingAction('CREATE_WELCOME_BANNER'),
  MarketingController.createWelcomeBanner
);
router.put('/welcome-banners/:id',
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_BANNERS),
  validateZod(updateWelcomeBannerSchema),
  auditMarketingAction('UPDATE_WELCOME_BANNER'),
  MarketingController.updateWelcomeBanner
);
router.delete('/welcome-banners/:id',
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_BANNERS),
  auditMarketingAction('DELETE_WELCOME_BANNER'),
  MarketingController.deleteWelcomeBanner
);

// M-18: Onboarding Wizard
router.get('/onboarding-wizard',
  requireMarketingPermission(MARKETING_PERMISSIONS.VIEW_DASHBOARD),
  MarketingController.getOnboardingWizard
);
router.put('/onboarding-wizard',
  requireMarketingPermission(MARKETING_PERMISSIONS.MANAGE_BANNERS),
  validateZod(saveOnboardingWizardSchema),
  auditMarketingAction('UPDATE_ONBOARDING_WIZARD'),
  MarketingController.saveOnboardingWizard
);

export default router;
