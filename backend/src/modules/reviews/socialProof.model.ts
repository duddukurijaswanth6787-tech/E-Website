import { Schema, model, Document } from 'mongoose';

export interface ISocialProofEvent extends Document {
  tenantId: string;
  type: 'purchase' | 'view' | 'cart_add' | 'loyal_customer';
  data: {
    customerName?: string;
    location?: string;
    productName?: string;
    productId?: Schema.Types.ObjectId;
    count?: number;
  };
  expiresAt: Date;
  createdAt: Date;
}

const SocialProofEventSchema = new Schema<ISocialProofEvent>({
  tenantId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: ['purchase', 'view', 'cart_add', 'loyal_customer'], 
    required: true 
  },
  data: {
    customerName: String,
    location: String,
    productName: String,
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    count: Number
  },
  expiresAt: { type: Date, required: true, index: { expires: 0 } } // TTL Index
}, { timestamps: true });

SocialProofEventSchema.index({ tenantId: 1, type: 1 });

export const SocialProofEvent = model<ISocialProofEvent>('SocialProofEvent', SocialProofEventSchema);
