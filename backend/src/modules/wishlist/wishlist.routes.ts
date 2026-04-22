import { Router, Request, Response, NextFunction } from 'express';
import { Wishlist } from './wishlist.model';
import { Product } from '../products/product.model';
import { authenticateUser, authenticateAdmin, requirePermission } from '../../common/middlewares';
import { sendSuccess } from '../../common/responses';
import { PERMISSIONS } from '../../common/constants';
import { NotFoundError } from '../../common/errors';

const router = Router();

router.get('/', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user!.userId })
      .populate('items.product', 'name images price slug status');
    sendSuccess(res, wishlist || { items: [] });
  } catch (err) { next(err); }
});

router.post('/toggle', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) throw new NotFoundError('Product');

    let wishlist = await Wishlist.findOne({ user: req.user!.userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user!.userId, items: [] });
    }

    const existingIndex = wishlist.items.findIndex((i) => i.product.toString() === productId);
    let action: string;

    if (existingIndex > -1) {
      wishlist.items.splice(existingIndex, 1);
      action = 'removed';
    } else {
      wishlist.items.push({ product: product._id, addedAt: new Date() });
      action = 'added';
    }

    await wishlist.save();
    sendSuccess(res, { wishlist, action }, `Product ${action} ${action === 'added' ? 'to' : 'from'} wishlist`);
  } catch (err) { next(err); }
});

router.delete('/:productId', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user!.userId });
    if (!wishlist) throw new NotFoundError('Wishlist');
    wishlist.items = wishlist.items.filter((i) => i.product.toString() !== req.params.productId);
    await wishlist.save();
    sendSuccess(res, wishlist, 'Removed from wishlist');
  } catch (err) { next(err); }
});

// Admin: most wished products
router.get('/insights',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await Wishlist.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $project: { 'product.name': 1, 'product.images': 1, 'product.slug': 1, count: 1 } },
      ]);
      sendSuccess(res, results);
    } catch (err) { next(err); }
  },
);

export default router;
