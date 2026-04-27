import { Request, Response, NextFunction } from 'express';
import { orderService } from './order.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../common/responses';

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.createOrder(req.user!.userId, req.body);
      sendCreated(res, order, 'Order placed successfully');
    } catch (err) { next(err); }
  }

  async createRazorpayOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await orderService.createRazorpayOrder(req.params.id as string, req.user!.userId);
      sendSuccess(res, result, 'Razorpay order created');
    } catch (err) { next(err); }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.verifyPayment({ ...req.body, userId: req.user!.userId });
      sendSuccess(res, order, 'Payment verified');
    } catch (err) { next(err); }
  }

  async getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orders, pagination } = await orderService.getUserOrders(req.user!.userId, req);
      sendPaginated(res, orders, pagination);
    } catch (err) { next(err); }
  }

  async getOrderDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.getOrderDetail(req.params.id as string, req.user!.userId);
      sendSuccess(res, order);
    } catch (err) { next(err); }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.cancelOrder(req.params.id as string, req.user!.userId, req.body.reason || 'Cancelled by user');
      sendSuccess(res, order, 'Order cancelled');
    } catch (err) { next(err); }
  }

  // Admin
  async getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orders, pagination } = await orderService.getAllOrders(req);
      sendPaginated(res, orders, pagination);
    } catch (err) { next(err); }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.updateOrderStatus(
        req.params.id as string, req.body.status, req.body.note || '', req.admin!.adminId
      );
      sendSuccess(res, order, 'Order status updated');
    } catch (err) { next(err); }
  }

  async updatePaymentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.updatePaymentStatus(
        req.params.id as string, req.body.status, req.admin!.adminId
      );
      sendSuccess(res, order, 'Payment status updated');
    } catch (err) { next(err); }
  }

  async getAdminOrderDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.getOrderDetailById(req.params.id as string);
      sendSuccess(res, order);
    } catch (err) { next(err); }
  }
}

export const orderController = new OrderController();
