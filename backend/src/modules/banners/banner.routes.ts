import { Router, Request, Response, NextFunction } from 'express';
import { Banner } from './banner.model';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/responses';
import { PERMISSIONS } from '../../common/constants';
import { NotFoundError } from '../../common/errors';
import { validateZod } from '../../common/middlewares/zodValidate.middleware';
import { trackEngagementSchema } from '../marketing/marketing.validation';
import { domainEventBus } from '../../realtime/bus/domainEventBus';
import { ERP_EVENTS } from '../../realtime/events/erpEvents';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const filter: Record<string, unknown> = { isActive: true };
    if (req.query.section) filter.section = req.query.section;
    filter.$or = [
      { startDate: { $exists: false } },
      { startDate: { $lte: now } },
    ];

    const banners = await Banner.find(filter as never).sort({ order: 1 }).lean();
    sendSuccess(res, banners);
  } catch (err) { next(err); }
});

router.get('/admin/all', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_BANNERS),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const banners = await Banner.find().sort({ order: 1 }).lean();
      sendSuccess(res, banners);
    } catch (err) { next(err); }
  }
);

router.post('/', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_BANNERS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const banner = await Banner.create({ ...req.body, createdBy: req.admin!.adminId });
      sendCreated(res, banner, 'Banner created');
    } catch (err) { next(err); }
  }
);

router.put('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_BANNERS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const banner = await Banner.findByIdAndUpdate(
        req.params.id, { ...req.body, updatedBy: req.admin!.adminId }, { new: true }
      );
      if (!banner) throw new NotFoundError('Banner');
      sendSuccess(res, banner, 'Banner updated');
    } catch (err) { next(err); }
  }
);

router.delete('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_BANNERS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const b = await Banner.findByIdAndDelete(req.params.id);
      if (!b) throw new NotFoundError('Banner');
      sendNoContent(res);
    } catch (err) { next(err); }
  }
);

router.post('/:id/impression', validateZod(trackEngagementSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } }, { new: true });
    if (banner) {
      domainEventBus.publish({
        type: ERP_EVENTS.MARKETING_EVENT,
        payload: { type: 'banner_impression', bannerId: banner._id, section: banner.section },
        metadata: { timestamp: new Date() }
      } as never);
    }
    sendSuccess(res, null);
  } catch (err) { next(err); }
});

router.post('/:id/click', validateZod(trackEngagementSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } }, { new: true });
    if (banner) {
      domainEventBus.publish({
        type: ERP_EVENTS.MARKETING_EVENT,
        payload: { type: 'banner_click', bannerId: banner._id, section: banner.section },
        metadata: { timestamp: new Date() }
      } as never);
    }
    sendSuccess(res, null);
  } catch (err) { next(err); }
});

export default router;
