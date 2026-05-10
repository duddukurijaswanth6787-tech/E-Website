import api from '../client';

export interface Review {
  _id: string;
  product: { _id: string; name: string; image?: string };
  user: { _id: string; name: string; email: string; avatar?: string };
  rating: number;
  title?: string;
  body: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  isFeatured: boolean;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface SocialProofEvent {
  _id: string;
  type: 'purchase' | 'view' | 'cart_add' | 'signup';
  product?: string;
  location?: string;
  userName?: string;
  timestamp: string;
}

export const reviewService = {
  getAdminReviews: (params?: any) => api.get<Review[]>('/reviews/admin', { params }),
  getReviewStats: () => api.get<any[]>('/reviews/admin/stats'),
  updateReview: (id: string, data: Partial<Review>) => api.patch<Review>(`/reviews/admin/${id}`, data),
  deleteReview: (id: string) => api.delete(`/reviews/admin/${id}`),

  // Social Proof
  getSocialProof: (productId?: string) => api.get<SocialProofEvent[]>(`/reviews/social-proof${productId ? `/${productId}` : ''}`),
};

