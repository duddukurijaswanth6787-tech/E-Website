import { Router, Request, Response, NextFunction } from 'express';
import { Review } from './review.model';
import { Product } from '../products/product.model';
import { authenticateUser, authenticateAdmin, optionalAuthenticateUser, requirePermission } from '../../common/middlewares';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../../common/responses';
import { PERMISSIONS } from '../../common/constants';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination';
import { NotFoundError } from '../../common/errors';

const router = Router();

// PUBLIC: Get reviews for a product
router.get('/product/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req, 10);
    const [reviews, total] = await Promise.all([
      Review.find({ product: req.params.productId, status: 'approved' })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ product: req.params.productId, status: 'approved' }),
    ]);
    sendPaginated(res, reviews, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
});

// USER: Submit review
router.post('/', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, rating, title, body } = req.body;
    const existing = await Review.findOne({ product: productId, user: req.user!.userId });
    if (existing) {
      existing.rating = rating;
      existing.title = title;
      existing.body = body;
      existing.status = 'pending';
      await existing.save();
      sendSuccess(res, existing, 'Review updated. Pending approval.');
      return;
    }

    const review = await Review.create({
      product: productId, user: req.user!.userId,
      rating, title, body, status: 'pending',
    });
    sendCreated(res, review, 'Review submitted. Pending approval.');
  } catch (err) { next(err); }
});

// ADMIN
router.get('/admin', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_REVIEWS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip } = parsePagination(req);
      const filter: Record<string, unknown> = {};
      if (req.query.status) filter.status = req.query.status;

      const [reviews, total] = await Promise.all([
        Review.find(filter).populate('user', 'name email').populate('product', 'name').skip(skip).limit(limit).lean(),
        Review.countDocuments(filter),
      ]);
      sendPaginated(res, reviews, buildPaginationMeta(total, page, limit));
    } catch (err) { next(err); }
  }
);

router.patch('/admin/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_REVIEWS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!review) throw new NotFoundError('Review');

      // Update product rating
      if (req.body.status === 'approved') {
        const stats = await Review.aggregate([
          { $match: { product: review.product, status: 'approved' } },
          { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
        ]);
        if (stats.length > 0) {
          await Product.findByIdAndUpdate(review.product, {
            'ratings.average': Math.round(stats[0].avg * 10) / 10,
            'ratings.count': stats[0].count,
          });
        }
      }

      sendSuccess(res, review, 'Review updated');
    } catch (err) { next(err); }
  }
);

router.delete('/admin/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_REVIEWS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const r = await Review.findByIdAndDelete(req.params.id);
      if (!r) throw new NotFoundError('Review');
      sendNoContent(res);
    } catch (err) { next(err); }
  }
);

export default router;
