import { customBlouseRepository } from './customBlouse.repository';
import { ICustomBlouse } from './customBlouse.model';
import { Types } from 'mongoose';

export const customBlouseService = {
  createRequest: async (payload: Partial<ICustomBlouse>, userId: string) => {
    const customerInfo: any = payload.customerInfo || {};
    const data: Partial<ICustomBlouse> = {
      ...payload,
      customerId: new Types.ObjectId(userId),
      customerInfo: {
        name: customerInfo.name || '',
        email: customerInfo.email || '',
        phone: customerInfo.phone || '',
      },
      statusHistory: [{ status: 'Submitted', updatedAt: new Date(), updatedBy: new Types.ObjectId(userId) }],
    };
    return await customBlouseRepository.create(data);
  },
  getUserRequests: async (userId: string) => {
    return await customBlouseRepository.findByUser(userId);
  },
  getRequestById: async (id: string) => {
    return await customBlouseRepository.findById(id);
  },
  getAllAdmin: async (page: number, limit: number = 20) => {
    return await customBlouseRepository.findAllAdmin(page, limit);
  },
  updateStatus: async (id: string, status: string, adminId: string) => {
    return await customBlouseRepository.updateStatus(id, status, adminId);
  },
  updatePrice: async (id: string, price: number) => {
    return await customBlouseRepository.updatePrice(id, price);
  },
  updateNotes: async (id: string, notes: string) => {
    return await customBlouseRepository.updateNotes(id, notes);
  },
  addReferenceImages: async (id: string, urls: string[]) => {
    return await customBlouseRepository.addReferenceImages(id, urls);
  },
};
