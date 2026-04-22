import { Request } from 'express';
export declare class NotificationService {
    getAllNotifications(req: Request): Promise<{
        notifications: (import("./notification.model").INotification & Required<{
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
    markAsRead(id: string): Promise<import("mongoose").Document<unknown, {}, import("./notification.model").INotification, {}, import("mongoose").DefaultSchemaOptions> & import("./notification.model").INotification & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    createNotification(data: any): Promise<import("mongoose").Document<unknown, {}, import("./notification.model").INotification, {}, import("mongoose").DefaultSchemaOptions> & import("./notification.model").INotification & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
export declare const notificationService: NotificationService;
