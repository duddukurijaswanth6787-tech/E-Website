import { Router, Request, Response, NextFunction } from 'express';
import { Collection } from './collection.model';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/responses';
import { PERMISSIONS } from '../../common/constants';
import { generateUniqueSlug } from '../../common/utils/helpers';
import { NotFoundError } from '../../common/errors';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const collections = await Collection.find({ isActive: true, deletedAt: null })
      .sort({ order: 1 })
      .select('-products')
      .lean();
    sendSuccess(res, collections);
  } catch (err) { next(err); }
});

router.get('/featured', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const collections = await Collection.find({ isActive: true, isFeatured: true, deletedAt: null })
      .sort({ order: 1 }).limit(6).lean();
    sendSuccess(res, collections);
  } catch (err) { next(err); }
});

router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug, isActive: true, deletedAt: null })
      .populate({ path: 'products', match: { status: 'published', deletedAt: null }, select: 'name images price slug' });
    if (!collection) throw new NotFoundError('Collection');
    sendSuccess(res, collection);
  } catch (err) { next(err); }
});

router.post('/', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_COLLECTIONS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = await generateUniqueSlug(req.body.name, async (s) => !!(await Collection.findOne({ slug: s })));
      const collection = await Collection.create({ ...req.body, slug, createdBy: req.admin!.adminId });
      sendCreated(res, collection, 'Collection created');
    } catch (err) { next(err); }
  }
);

router.put('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_COLLECTIONS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const collection = await Collection.findByIdAndUpdate(
        req.params.id, { ...req.body, updatedBy: req.admin!.adminId }, { new: true }
      );
      if (!collection) throw new NotFoundError('Collection');
      sendSuccess(res, collection, 'Collection updated');
    } catch (err) { next(err); }
  }
);

router.delete('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_COLLECTIONS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const c = await Collection.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
      if (!c) throw new NotFoundError('Collection');
      sendNoContent(res);
    } catch (err) { next(err); }
  }
);

export default router;
