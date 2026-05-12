import { Router } from 'express';
import { Category } from './category.model';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { PERMISSIONS } from '../../common/constants';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/responses';
import { generateUniqueSlug } from '../../common/utils/helpers';
import { NotFoundError } from '../../common/errors';
import { Request, Response, NextFunction } from 'express';
import { validateZod } from '../../common/middlewares/zodValidate.middleware';
import { categorySchema } from '../../common/validation/enterprise.schemas';

const router = Router();

// PUBLIC
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find({ isActive: true, deletedAt: null })
      .populate('parent', 'name slug')
      .sort({ order: 1 })
      .lean();
    sendSuccess(res, categories);
  } catch (err) { next(err); }
});

// ADMIN (read full taxonomy, including inactive)
router.get(
  '/admin/all',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_CATEGORIES),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await Category.find({ deletedAt: null })
        .populate('parent', 'name slug')
        .sort({ order: 1 })
        .lean();
      sendSuccess(res, categories);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true, deletedAt: null });
    if (!category) throw new NotFoundError('Category');
    sendSuccess(res, category);
  } catch (err) { next(err); }
});

// ADMIN
router.post('/',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CATEGORIES),
  validateZod(categorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = await generateUniqueSlug(req.body.name, async (s) => !!(await Category.findOne({ slug: s })));
      const category = await Category.create({ ...req.body, slug, createdBy: req.admin!.adminId });
      sendCreated(res, category, 'Category created');
    } catch (err) { next(err); }
  },
);

router.put('/:id',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CATEGORIES),
  validateZod(categorySchema.deepPartial()),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedBy: req.admin!.adminId },
        { new: true }
      );
      if (!category) throw new NotFoundError('Category');
      sendSuccess(res, category, 'Category updated');
    } catch (err) { next(err); }
  },
);

router.delete('/:id',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_CATEGORIES),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cat = await Category.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
      if (!cat) throw new NotFoundError('Category');
      sendNoContent(res);
    } catch (err) { next(err); }
  },
);

export default router;
