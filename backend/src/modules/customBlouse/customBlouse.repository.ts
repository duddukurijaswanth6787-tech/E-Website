import { Model } from 'mongoose';
import { CustomBlouse, ICustomBlouse } from './customBlouse.model';

export const customBlouseRepository = {
  create: async (data: Partial<ICustomBlouse>) => {
    const doc = new CustomBlouse(data);
    return await doc.save();
  },
  findById: async (id: string) => {
    return await CustomBlouse.findById(id);
  },
  findByUser: async (userId: string) => {
    return await CustomBlouse.find({ customerId: userId }).sort({ createdAt: -1 });
  },
  findAllAdmin: async (page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      CustomBlouse.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      CustomBlouse.countDocuments(),
    ]);
    return { items, total, page, limit };
  },
  updateStatus: async (id: string, status: string, updatedBy: string) => {
    return await CustomBlouse.findByIdAndUpdate(
      id,
      {
        $push: { statusHistory: { status, updatedAt: new Date(), updatedBy } },
      },
      { new: true }
    );
  },
  updatePrice: async (id: string, price: number) => {
    return await CustomBlouse.findByIdAndUpdate(id, { price }, { new: true });
  },
  updateNotes: async (id: string, notes: string) => {
    return await CustomBlouse.findByIdAndUpdate(id, { adminNotes: notes }, { new: true });
  },
  addReferenceImages: async (id: string, urls: string[]) => {
    return await CustomBlouse.findByIdAndUpdate(
      id,
      { $push: { referenceImages: { $each: urls } } },
      { new: true }
    );
  },
};
