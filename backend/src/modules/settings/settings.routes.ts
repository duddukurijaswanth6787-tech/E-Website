import { Router, Request, Response, NextFunction } from 'express';
import { Setting } from './setting.model';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { sendSuccess, sendNoContent } from '../../common/responses';
import { PERMISSIONS } from '../../common/constants';
import { NotFoundError } from '../../common/errors';

const router = Router();

// PUBLIC: Get public settings (brand, SEO, contact, social)
router.get('/public', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await Setting.find({ isPublic: true }).lean();
    const result = settings.reduce((acc: Record<string, unknown>, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    sendSuccess(res, result);
  } catch (err) { next(err); }
});

// ADMIN: Get all settings grouped
router.get('/', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_SETTINGS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: Record<string, unknown> = {};
      if (req.query.group) filter.group = req.query.group;
      const settings = await Setting.find(filter).lean();
      sendSuccess(res, settings);
    } catch (err) { next(err); }
  }
);

// ADMIN: Bulk upsert settings
router.put('/', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_SETTINGS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updates: Array<{ key: string; value: unknown }> = req.body.settings;
      await Promise.all(updates.map(({ key, value }) =>
        Setting.findOneAndUpdate({ key }, { value, updatedBy: req.admin!.adminId }, { upsert: true, new: true })
      ));
      sendSuccess(res, null, 'Settings updated');
    } catch (err) { next(err); }
  }
);

router.patch('/:key', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_SETTINGS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const setting = await Setting.findOneAndUpdate(
        { key: req.params.key },
        { value: req.body.value, updatedBy: req.admin!.adminId },
        { new: true }
      );
      if (!setting) throw new NotFoundError('Setting');
      sendSuccess(res, setting, 'Setting updated');
    } catch (err) { next(err); }
  }
);

export default router;
