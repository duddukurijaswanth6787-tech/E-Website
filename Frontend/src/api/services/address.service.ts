import apiClient from '../client';

export interface Address {
  _id?: string;
  type: string; // 'home', 'work', 'other'
  name: string;
  mobile: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  altMobile?: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
}

export const addressService = {
  getAddresses: async () => {
    return apiClient.get('/addresses');
  },

  addAddress: async (address: Address) => {
    return apiClient.post('/addresses', address);
  },

  updateAddress: async (id: string, address: Address) => {
    return apiClient.put(`/addresses/${id}`, address);
  },

  deleteAddress: async (id: string) => {
    return apiClient.delete(`/addresses/${id}`);
  },

  setDefaultAddress: async (id: string) => {
    return apiClient.patch(`/addresses/${id}/default`);
  }
};
