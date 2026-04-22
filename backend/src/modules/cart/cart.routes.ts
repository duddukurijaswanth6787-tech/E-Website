import { Router, Request, Response, NextFunction } from 'express';
import { Cart } from './cart.model';
import { Product } from '../products/product.model';
import { Coupon } from '../coupons/coupon.model';
import { authenticateUser, optionalAuthenticateUser } from '../../common/middlewares';
import { sendSuccess } from '../../common/responses';
import { NotFoundError, BadRequestError } from '../../common/errors';

const router = Router();

const recalcCart = async (cart: InstanceType<typeof Cart>) => {
  let subtotal = 0;
  for (const item of cart.items) {
    subtotal += item.price * item.quantity;
  }
  cart.subtotal = subtotal;
  cart.total = subtotal - (cart.couponDiscount || 0);
};

// GET cart
router.get('/', optionalAuthenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = req.user ? { user: req.user.userId } : { sessionId: req.headers['x-session-id'] };
    const cart = await Cart.findOne(filter).populate('items.product', 'name images price slug status');
    sendSuccess(res, cart || { items: [], subtotal: 0, total: 0, couponDiscount: 0 });
  } catch (err) { next(err); }
});

// ADD item
router.post('/items', optionalAuthenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    if (!productId) throw new BadRequestError('Product ID required');

    const product = await Product.findOne({ _id: productId, status: 'published', deletedAt: null });
    if (!product) throw new NotFoundError('Product');

    let price = product.price;
    if (variantId && product.hasVariants) {
      const variant = product.variants.find((v) => v._id?.toString() === variantId);
      if (variant) price = variant.price;
    }

    const filter = req.user ? { user: req.user.userId } : { sessionId: req.headers['x-session-id'] };
    let cart = await Cart.findOne(filter);

    if (!cart) {
      cart = new Cart({
        ...(req.user ? { user: req.user.userId } : { sessionId: req.headers['x-session-id'], expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }),
        items: [],
      });
    }

    const existing = cart.items.find((i) => i.product.toString() === productId && i.variantId === variantId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product: product._id, variantId, quantity, price, name: product.name, image: product.images[0] || '' });
    }

    await recalcCart(cart);
    await cart.save();
    sendSuccess(res, cart, 'Item added to cart');
  } catch (err) { next(err); }
});

// UPDATE item quantity
router.patch('/items/:itemId', optionalAuthenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = req.user ? { user: req.user.userId } : { sessionId: req.headers['x-session-id'] };
    const cart = await Cart.findOne(filter);
    if (!cart) throw new NotFoundError('Cart');

    const item = (cart.items as any).id(req.params.itemId);
    if (!item) throw new NotFoundError('Cart item');

    if (req.body.quantity <= 0) {
      (cart.items as any).pull(req.params.itemId);
    } else {
      item.quantity = req.body.quantity;
    }

    await recalcCart(cart);
    await cart.save();
    sendSuccess(res, cart, 'Cart updated');
  } catch (err) { next(err); }
});

// REMOVE item
router.delete('/items/:itemId', optionalAuthenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = req.user ? { user: req.user.userId } : { sessionId: req.headers['x-session-id'] };
    const cart = await Cart.findOne(filter);
    if (!cart) throw new NotFoundError('Cart');
    (cart.items as any).pull(req.params.itemId);
    await recalcCart(cart);
    await cart.save();
    sendSuccess(res, cart, 'Item removed');
  } catch (err) { next(err); }
});

// APPLY coupon
router.post('/coupon', optionalAuthenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    const filter = req.user ? { user: req.user.userId } : { sessionId: req.headers['x-session-id'] };
    const cart = await Cart.findOne(filter);
    if (!cart) throw new NotFoundError('Cart');

    const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
    if (!coupon) throw new BadRequestError('Invalid coupon code');

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) throw new BadRequestError('Coupon expired');
    if (cart.subtotal < coupon.minOrderAmount) throw new BadRequestError(`Minimum order ₹${coupon.minOrderAmount} required`);

    let discount = coupon.type === 'percentage'
      ? (cart.subtotal * coupon.value) / 100
      : coupon.value;
    if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);

    cart.coupon = coupon._id;
    cart.couponDiscount = discount;
    cart.total = cart.subtotal - discount;
    await cart.save();

    sendSuccess(res, { cart, discountApplied: discount }, 'Coupon applied');
  } catch (err) { next(err); }
});

// REMOVE coupon
router.delete('/coupon', optionalAuthenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = req.user ? { user: req.user.userId } : { sessionId: req.headers['x-session-id'] };
    const cart = await Cart.findOne(filter);
    if (!cart) throw new NotFoundError('Cart');
    cart.coupon = undefined;
    cart.couponDiscount = 0;
    cart.total = cart.subtotal;
    await cart.save();
    sendSuccess(res, cart, 'Coupon removed');
  } catch (err) { next(err); }
});

// CLEAR cart
router.delete('/', authenticateUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Cart.findOneAndDelete({ user: req.user!.userId });
    sendSuccess(res, null, 'Cart cleared');
  } catch (err) { next(err); }
});

export default router;
