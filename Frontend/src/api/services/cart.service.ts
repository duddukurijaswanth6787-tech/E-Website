import apiClient from '../client';
import type { CartItem } from '../../types/cart';

export const cartService = {
  // Sync a local cart explicitly into the backend after login 
  syncCart: async (items: CartItem[]) => {
    return apiClient.post('/cart/sync', { items: items.map(item => ({
      product: item.id,
      quantity: item.quantity,
      customizations: item.customizations
    })) });
  },

  mergeCart: async () => {
    return apiClient.post('/cart/merge', {});
  },

  // Fetch the active user cart from database
  getCart: async () => {
    return apiClient.get('/cart');
  },

  // Add individual item - backend uses POST /cart/items
  addItem: async (productId: string, quantity: number, customizations?: any) => {
    return apiClient.post('/cart/items', { productId, quantity, customizations });
  },

  // Update quantity - backend uses PATCH /cart/items/:itemId
  updateItem: async (itemId: string, quantity: number) => {
    return apiClient.patch(`/cart/items/${itemId}`, { quantity });
  },

  // Remove individual item - backend uses DELETE /cart/items/:itemId
  removeItem: async (itemId: string) => {
    return apiClient.delete(`/cart/items/${itemId}`);
  },

  clearCart: async () => {
    return apiClient.delete('/cart');
  },

  applyCoupon: async (code: string) => {
    return apiClient.post('/cart/coupon', { code });
  },

  removeCoupon: async () => {
    return apiClient.delete('/cart/coupon');
  }
};
