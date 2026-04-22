import apiClient from '../client';

export interface WishlistInsightNode {
  _id: string; // Product ID
  count: number;
  product: { name: string; slug: string; images: string[] };
}

export const wishlistService = {
  getInsights: async () => {
    return apiClient.get<any, { success: boolean, data: WishlistInsightNode[] | any }>('/wishlist/insights');
  }
};
