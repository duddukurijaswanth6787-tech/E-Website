import { Request } from 'express';
export declare class OrderService {
    createOrder(userId: string, data: {
        addressId?: string;
        address?: Record<string, string>;
        couponCode?: string;
        paymentMethod: string;
        note?: string;
        items?: Array<{
            productId: string;
            variantId?: string;
            quantity: number;
        }>;
    }): Promise<import("mongoose").Document<unknown, {}, import("./order.model").IOrder, {}, import("mongoose").DefaultSchemaOptions> & import("./order.model").IOrder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    createRazorpayOrder(orderId: string, userId: string): Promise<{
        razorpayOrderId: string;
        amount: string | number;
        currency: string;
        keyId: string;
    }>;
    verifyPayment(data: {
        orderId: string;
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        userId: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./order.model").IOrder, {}, import("mongoose").DefaultSchemaOptions> & import("./order.model").IOrder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getUserOrders(userId: string, req: Request): Promise<{
        orders: (import("./order.model").IOrder & Required<{
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
    getOrderDetail(orderId: string, userId: string): Promise<import("mongoose").Document<unknown, {}, import("./order.model").IOrder, {}, import("mongoose").DefaultSchemaOptions> & import("./order.model").IOrder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    cancelOrder(orderId: string, userId: string, reason: string): Promise<import("mongoose").Document<unknown, {}, import("./order.model").IOrder, {}, import("mongoose").DefaultSchemaOptions> & import("./order.model").IOrder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getAllOrders(req: Request): Promise<{
        orders: (import("./order.model").IOrder & Required<{
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
    updateOrderStatus(orderId: string, status: string, note: string, adminId: string): Promise<import("mongoose").Document<unknown, {}, import("./order.model").IOrder, {}, import("mongoose").DefaultSchemaOptions> & import("./order.model").IOrder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
export declare const orderService: OrderService;
