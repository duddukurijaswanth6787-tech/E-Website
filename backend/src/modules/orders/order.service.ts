import { Order } from './order.model';
import { Cart } from '../cart/cart.model';
import { Coupon } from '../coupons/coupon.model';
import { Payment } from '../payments/payment.model';
import { Product } from '../products/product.model';
import { sendOrderConfirmationEmail } from '../../common/utils/email';
import { User } from '../users/user.model';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors';
import { generateOrderNumber } from '../../common/utils/helpers';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination';
import { Request } from 'express';

import { getRazorpayInstance } from '../../config/razorpay';
import crypto from 'crypto';
import { env } from '../../config/env';
import { paise } from '../../common/utils/helpers';

export class OrderService {
  async createOrder(userId: string, data: {
    addressId?: string;
    address?: Record<string, string>;
    couponCode?: string;
    paymentMethod: string;
    note?: string;
    items?: Array<{ productId: string; variantId?: string; quantity: number }>;
  }) {
    // Get cart or use provided items
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) throw new BadRequestError('Cart is empty');

    // Validate and price items
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.product);
      if (!product || product.status !== 'published') continue;

      let price = product.price;
      if (cartItem.variantId && product.hasVariants) {
        const variant = product.variants.find((v) => v._id?.toString() === cartItem.variantId);
        if (variant) price = variant.price;
      }

      const itemTotal = price * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        variantId: cartItem.variantId,
        name: product.name,
        image: product.images[0] || '',
        sku: product.sku,
        quantity: cartItem.quantity,
        price,
        total: itemTotal,
      });
    }

    if (orderItems.length === 0) throw new BadRequestError('No valid items in cart');

    // Coupon
    let couponDiscount = 0;
    let couponDoc = null;
    if (data.couponCode) {
      couponDoc = await Coupon.findOne({ code: data.couponCode.toUpperCase(), isActive: true });
      if (couponDoc) {
        const now = new Date();
        if (now < couponDoc.validFrom || now > couponDoc.validTo) {
          throw new BadRequestError('Coupon has expired');
        }
        if (couponDoc.maxUses && couponDoc.usedCount >= couponDoc.maxUses) {
          throw new BadRequestError('Coupon usage limit reached');
        }
        if (subtotal < couponDoc.minOrderAmount) {
          throw new BadRequestError(`Minimum order amount for this coupon is ₹${couponDoc.minOrderAmount}`);
        }

        if (couponDoc.type === 'percentage') {
          couponDiscount = (subtotal * couponDoc.value) / 100;
          if (couponDoc.maxDiscountAmount) {
            couponDiscount = Math.min(couponDiscount, couponDoc.maxDiscountAmount);
          }
        } else {
          couponDiscount = Math.min(couponDoc.value, subtotal);
        }
      }
    }

    const shippingCharge = subtotal > 999 ? 0 : 99;
    const total = subtotal - couponDiscount + shippingCharge;

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      user: userId,
      items: orderItems,
      address: data.address,
      coupon: couponDoc?._id,
      couponCode: data.couponCode,
      couponDiscount,
      subtotal,
      shippingCharge,
      tax: 0,
      total,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'cod' ? 'pending' : 'pending',
      status: 'pending',
      note: data.note,
      timeline: [{ status: 'pending', note: 'Order placed', updatedAt: new Date() }],
    });

    // Update coupon usage
    if (couponDoc) {
      await Coupon.findByIdAndUpdate(couponDoc._id, {
        $inc: { usedCount: 1 },
        $push: { usedBy: userId },
      });
    }

    // Clear cart
    await Cart.findOneAndDelete({ user: userId });

    // Send confirmation email
    const user = await User.findById(userId);
    if (user) {
      sendOrderConfirmationEmail(user.email, user.name, orderNumber, total).catch(() => {});
    }

    return order;
  }

  async createRazorpayOrder(orderId: string, userId: string) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new NotFoundError('Order');
    if (order.paymentMethod !== 'razorpay') throw new BadRequestError('Invalid payment method');

    const razorpay = getRazorpayInstance();
    const rzpOrder = await razorpay.orders.create({
      amount: paise(order.total),
      currency: 'INR',
      receipt: order.orderNumber,
    });

    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    return { razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, keyId: env.razorpay.keyId };
  }

  async verifyPayment(data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    userId: string;
  }) {
    const order = await Order.findOne({ _id: data.orderId, user: data.userId });
    if (!order) throw new NotFoundError('Order');

    const expectedSignature = crypto
      .createHmac('sha256', env.razorpay.keySecret)
      .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== data.razorpaySignature) {
      throw new BadRequestError('Payment verification failed');
    }

    const payment = await Payment.create({
      order: order._id,
      user: data.userId,
      provider: 'razorpay',
      razorpayOrderId: data.razorpayOrderId,
      razorpayPaymentId: data.razorpayPaymentId,
      razorpaySignature: data.razorpaySignature,
      amount: order.total,
      currency: 'INR',
      status: 'paid',
    });

    order.paymentStatus = 'paid';
    order.paymentId = payment._id;
    order.status = 'confirmed';
    order.timeline.push({ status: 'confirmed', note: 'Payment received', updatedAt: new Date() });
    await order.save();

    return order;
  }

  async getUserOrders(userId: string, req: Request) {
    const { page, limit, skip } = parsePagination(req);
    const [orders, total] = await Promise.all([
      Order.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments({ user: userId }),
    ]);
    return { orders, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getOrderDetail(orderId: string, userId: string) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new NotFoundError('Order');
    return order;
  }

  async cancelOrder(orderId: string, userId: string, reason: string) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new NotFoundError('Order');
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new BadRequestError('Order cannot be cancelled at this stage');
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    order.timeline.push({ status: 'cancelled', note: reason, updatedAt: new Date() });
    await order.save();

    return order;
  }

  // Admin methods
  async getAllOrders(req: Request) {
    const { page, limit, skip } = parsePagination(req);
    const filter: Record<string, any> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return { orders, pagination: buildPaginationMeta(total, page, limit) };
  }

  async updateOrderStatus(orderId: string, status: string, note: string, adminId: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order');

    order.status = status as typeof order.status;
    order.timeline.push({ status, note, updatedBy: adminId, updatedAt: new Date() });
    await order.save();

    return order;
  }
}

export const orderService = new OrderService();
