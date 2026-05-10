import { Router, Request, Response, NextFunction } from 'express';
import { Review } from './review.model';
import { Product } from '../products/product.model';
import { SocialProofEvent } from './socialProof.model';
import { authenticateUser, authenticateAdmin, requirePermission } from '../../common/middlewares';
import { injectTenantId } from '../marketing/marketing.middleware';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../../common/responses';
import { PERMISSIONS } from '../../common/constants';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination';
import { NotFoundError } from '../../common/errors';

const router = Router();

// Apply tenant injection to all review/social proof routes
router.use(injectTenantId);

// --- PUBLIC & SOCIAL PROOF ---

// Get reviews for a product
router.get('/product/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req, 10);
    const [reviews, total] = await Promise.all([
      Review.find({ 
        tenantId: req.tenantId,
        product: req.params.productId, 
        status: 'approved' 
      })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ 
        tenantId: req.tenantId,
        product: req.params.productId, 
        status: 'approved' 
      }),
    ]);
    sendPaginated(res, reviews, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
});

// Social Proof: Get recent events for a product
router.get('/social-proof/:productId?', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = { tenantId: req.tenantId };
    if (req.params.productId) filter['data.productId'] = req.params.productId;
    
    const events = await SocialProofEvent.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    sendSuccess(res, events);
  } catch (err) { next(err); }
});

// --- USER ACTIONS ---

router.post('/', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, rating, title, body, images } = req.body;
    const existing = await Review.findOne({ 
      tenantId: req.tenantId,
      product: productId, 
      user: req.user!.userId 
    });
    
    if (existing) {
      Object.assign(existing, { rating, title, body, images, status: 'pending' });
      await existing.save();
      sendSuccess(res, existing, 'Review updated. Pending approval.');
      return;
    }

    const review = await Review.create({
      tenantId: req.tenantId,
      product: productId, 
      user: req.user!.userId,
      rating, 
      title, 
      body, 
      images, 
      status: 'pending',
    });
    sendCreated(res, review, 'Review submitted. Pending approval.');
  } catch (err) { next(err); }
});

// --- ADMIN MANAGEMENT ---

router.get('/admin/stats', authenticateAdmin, requirePermission(PERMISSIONS.VIEW_ANALYTICS), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await Review.aggregate([
      { $match: { tenantId: req.tenantId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);
    sendSuccess(res, stats);
  } catch (err) { next(err); }
});

router.get('/admin', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_REVIEWS), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name email')
        .populate('product', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);
    sendPaginated(res, reviews, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
});

router.patch('/admin/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_REVIEWS), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!review) throw new NotFoundError('Review');

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
});

router.delete('/admin/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_REVIEWS), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await Review.findByIdAndDelete(req.params.id);
    if (!r) throw new NotFoundError('Review');
    sendNoContent(res);
  } catch (err) { next(err); }
});

export default router;
