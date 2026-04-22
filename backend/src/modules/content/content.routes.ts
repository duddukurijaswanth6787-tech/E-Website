import { Router, Request, Response, NextFunction } from 'express';
import { ContentPage } from './content.model';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../../common/responses';
import { PERMISSIONS } from '../../common/constants';
import { generateUniqueSlug } from '../../common/utils/helpers';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination';
import { NotFoundError } from '../../common/errors';

const router = Router();

// PUBLIC
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const filter: Record<string, unknown> = { isPublished: true, deletedAt: null };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.tag) filter.tags = req.query.tag;

    const [items, total] = await Promise.all([
      ContentPage.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      ContentPage.countDocuments(filter),
    ]);
    sendPaginated(res, items, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
});

router.get('/blogs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req, 9);
    const filter: Record<string, unknown> = { type: 'blog', isPublished: true, deletedAt: null };
    if (req.query.tag) filter.tags = req.query.tag;

    const [blogs, total] = await Promise.all([
      ContentPage.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
      ContentPage.countDocuments(filter),
    ]);
    sendPaginated(res, blogs, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
});

router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await ContentPage.findOne({ slug: req.params.slug, isPublished: true, deletedAt: null });
    if (!content) throw new NotFoundError('Content page');
    sendSuccess(res, content);
  } catch (err) { next(err); }
});

// ADMIN
router.get('/admin/all', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CONTENT),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip } = parsePagination(req);
      const filter: Record<string, unknown> = { deletedAt: null };
      if (req.query.type) filter.type = req.query.type;

      const [items, total] = await Promise.all([
        ContentPage.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
        ContentPage.countDocuments(filter),
      ]);
      sendPaginated(res, items, buildPaginationMeta(total, page, limit));
    } catch (err) { next(err); }
  }
);

router.post('/', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CONTENT),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.body.slug || await generateUniqueSlug(req.body.title, async (s) => !!(await ContentPage.findOne({ slug: s })));
      const content = await ContentPage.create({
        ...req.body, slug,
        publishedAt: req.body.isPublished ? new Date() : undefined,
        createdBy: req.admin!.adminId,
      });
      sendCreated(res, content, 'Content page created');
    } catch (err) { next(err); }
  }
);

router.put('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CONTENT),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const update: Record<string, unknown> = { ...req.body, updatedBy: req.admin!.adminId };
      if (req.body.isPublished && !req.body.publishedAt) update.publishedAt = new Date();
      const content = await ContentPage.findByIdAndUpdate(req.params.id, update, { new: true });
      if (!content) throw new NotFoundError('Content page');
      sendSuccess(res, content, 'Content page updated');
    } catch (err) { next(err); }
  }
);

router.delete('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CONTENT),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const c = await ContentPage.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
      if (!c) throw new NotFoundError('Content page');
      sendNoContent(res);
    } catch (err) { next(err); }
  }
);

export default router;
