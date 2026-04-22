import { Request, Response, NextFunction } from 'express';
export declare class OrderController {
    createOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    createRazorpayOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOrderDetail(req: Request, res: Response, next: NextFunction): Promise<void>;
    cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const orderController: OrderController;
