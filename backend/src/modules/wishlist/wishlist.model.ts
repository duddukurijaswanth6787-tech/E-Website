import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  items: Array<{
    product: mongoose.Types.ObjectId;
    addedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [{
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      addedAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true },
);


export const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema);
