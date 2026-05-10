import mongoose, { Schema, Document } from 'mongoose';

export interface IBoutique extends Document {
  boutiqueId: string;
  name: string;
  owner: string;
  email: string;
  mobile: string;
  address: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BoutiqueSchema = new Schema<IBoutique>(
  {
    boutiqueId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    owner: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    category: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Boutique = mongoose.model<IBoutique>('Boutique', BoutiqueSchema);
