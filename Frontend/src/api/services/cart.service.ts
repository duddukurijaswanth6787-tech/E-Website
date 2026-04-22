import apiClient from '../client';
import type { CartItem } from '../../store/cartStore';

export const cartService = {
  // Sync a local cart explicitly into the backend after login 
  syncCart: async (items: CartItem[]) => {
    return apiClient.post('/cart/sync', { items: items.map(item => ({
      product: item.id,
      quantity: item.quantity
    })) });
  },

  // Fetch the active user cart from database
  getCart: async () => {
    return apiClient.get('/cart');
  },

  // Add individual item
  addItem: async (productId: string, quantity: number) => {
    return apiClient.post('/cart', { productId, quantity });
  },

  // Update quantity securely
  updateItem: async (productId: string, quantity: number) => {
    return apiClient.put('/cart', { productId, quantity });
  },

  // Remove individual item
  removeItem: async (productId: string) => {
    return apiClient.delete(`/cart/${productId}`);
  },

  clearCart: async () => {
    return apiClient.delete('/cart');
  }
};
