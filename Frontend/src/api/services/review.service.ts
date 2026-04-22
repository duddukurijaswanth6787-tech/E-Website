import apiClient from '../client';

export interface Review {
  _id: string;
  product: { _id: string; name: string };
  user: { _id: string; name: string; email: string };
  rating: number;
  title?: string;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export const reviewService = {
  getAdminReviews: async (params?: Record<string, any>) => {
    return apiClient.get<any, { success: boolean, data: Review[] | any }>('/reviews/admin', { params });
  },

  updateReviewStatus: async (id: string, status: string) => {
    return apiClient.patch(`/reviews/${id}/status`, { status });
  },

  deleteReview: async (id: string) => {
    return apiClient.delete(`/reviews/${id}`);
  }
};
