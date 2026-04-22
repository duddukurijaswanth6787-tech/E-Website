import { Request } from 'express';
export declare class PaymentService {
    getAllPayments(req: Request): Promise<{
        payments: (import("./payment.model").IPayment & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    getPaymentById(id: string): Promise<import("mongoose").Document<unknown, {}, import("./payment.model").IPayment, {}, import("mongoose").DefaultSchemaOptions> & import("./payment.model").IPayment & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
export declare const paymentService: PaymentService;
