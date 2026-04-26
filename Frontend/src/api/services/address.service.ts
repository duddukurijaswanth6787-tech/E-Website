import apiClient from '../client';

export interface Address {
  _id?: string;
  type: string; // 'Home', 'Work', 'Other'
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
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
