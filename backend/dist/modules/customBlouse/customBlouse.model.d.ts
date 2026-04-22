import mongoose, { Document } from 'mongoose';
export interface ICustomBlouseRequest extends Document {
    user: mongoose.Types.ObjectId;
    requestNumber: string;
    blouseType: string;
    measurements: {
        bust?: number;
        waist?: number;
        hip?: number;
        shoulderWidth?: number;
        sleeveLength?: number;
        blouseLength?: number;
        neckDepthFront?: number;
        neckDepthBack?: number;
        armhole?: number;
    };
    preferredNeckStyle?: string;
    preferredSleeveStyle?: string;
    references: string[];
    notes?: string;
    preferredDeliveryDate?: Date;
    estimatedPrice?: number;
    finalPrice?: number;
    status: string;
    adminNotes?: string;
    priceNote?: string;
    timeline: Array<{
        status: string;
        note?: string;
        updatedBy?: string;
        updatedAt: Date;
    }>;
    deliveryNote?: string;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CustomBlouseRequest: mongoose.Model<ICustomBlouseRequest, {}, {}, {}, mongoose.Document<unknown, {}, ICustomBlouseRequest, {}, mongoose.DefaultSchemaOptions> & ICustomBlouseRequest & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICustomBlouseRequest>;
