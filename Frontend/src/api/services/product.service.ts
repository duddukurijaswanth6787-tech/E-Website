import apiClient, { publicClient } from '../client';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  shortDescription?: string;
  description: string;
  price: number;
  comparePrice?: number;
  originalPrice?: number;
  category?: any;
  images: string[];
  stock: number;
  tags?: string[];
  fabric?: string;
  occasion?: string;
  color?: string;
  occasions?: string[];
  careInstructions?: string;
  blouseDetails?: string;
  weavingTechnique?: string;
  pallu?: string;
  speciality?: string;
  handloomCraftsmanship?: string;
  designHighlight?: string;
  stylingTips?: string;
  discountType?: 'percentage' | 'flat';
  discountValue?: number;
  taxPercent?: number;
  codAvailable?: boolean;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'preorder';
  lowStockThreshold?: number;
  attributes?: {
    sareeLength?: string;
    sareeWidth?: string;
    blouseLength?: string;
    blouseWidth?: string;
    weight?: string;
  };
  status?: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  showOnHomepage?: boolean;
  sortOrder?: number;
  returnable?: boolean;
  returnWindowDays?: number;
  exchangeAvailable?: boolean;
  cancellationAllowed?: boolean;
  rewardPoints?: number;
  ratings?: {
    average: number;
    count: number;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const productService = {
  // Configured with standard paginated API endpoints supporting multiple query hooks
  getProducts: async (params?: Record<string, any>) => {
    return publicClient.get<any, ProductsResponse>('/products', { params });
  },

  // Admin list (full catalog with pagination)
  getAdminProducts: async (params?: Record<string, any>) => {
    return apiClient.get<any, ProductsResponse>('/products/admin/all', { params });
  },

  // Lookup deeply nested product objects by SEO slug
  getProductBySlug: async (slug: string) => {
    return publicClient.get<any, { success: boolean; data: Product }>(`/products/slug/${slug}`);
  },

  // Related items: backend route is GET /products/:id/related?category=<categoryId>
  getRelatedProducts: async (productId: string, categoryId?: string) => {
    return publicClient.get<any, { success: boolean; data: Product[] }>(`/products/${productId}/related`, {
      params: categoryId ? { category: categoryId } : {},
    });
  },

  // Admin CRUD Methods
  createProduct: async (productData: FormData | Record<string, any>) => {
    const isFormData = productData instanceof FormData;
    return apiClient.post('/products', productData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
  },

  updateProduct: async (id: string, productData: FormData | Record<string, any>) => {
    const isFormData = productData instanceof FormData;
    return apiClient.put(`/products/${id}`, productData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
  },

  // Featured items
  getFeaturedProducts: async () => {
    return publicClient.get<any, { success: boolean; data: Product[] }>('/products/featured');
  },

  // Trending items
  getTrendingProducts: async () => {
    return publicClient.get<any, { success: boolean; data: Product[] }>('/products/trending');
  },

  deleteProduct: async (id: string) => {
    return apiClient.delete(`/products/${id}`);
  }
};
