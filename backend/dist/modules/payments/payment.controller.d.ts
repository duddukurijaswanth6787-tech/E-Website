import { Request, Response, NextFunction } from 'express';
export declare class PaymentController {
    getAllPayments(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPaymentDetail(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const paymentController: PaymentController;
