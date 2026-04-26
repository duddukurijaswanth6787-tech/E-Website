import apiClient from '../client';

export interface UserNode {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  role: string;
  isBlocked: boolean;
  blockedReason?: string;
  isEmailVerified?: boolean;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
  // Aggregated order stats
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  pendingOrders?: number;
  deliveredOrders?: number;
  cancelledOrders?: number;
}

export interface CustomerDetail {
  user: UserNode;
  orders: Order[];
  addresses: Address[];
  wishlistCount: number;
  stats: {
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
  };
}

export interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  shippingCharge: number;
  couponDiscount: number;
  items: OrderItem[];
  address: any;
  timeline: TimelineEntry[];
  note?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  user?: any;
}

export interface OrderItem {
  _id?: string;
  name: string;
  image: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  product?: any;
}

export interface TimelineEntry {
  status: string;
  note?: string;
  updatedBy?: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  type?: string;
  name?: string;
  street?: string;
  line1?: string;
  line2?: string;
  city: string;
  state: string;
  zipCode?: string;
  pincode?: string;
  country?: string;
  phone?: string;
  mobile?: string;
  isDefault?: boolean;
}

export const userService = {
  // Public / Customer Scoped Profile Sync
  updateProfile: async (data: Record<string, any>) => {
    return apiClient.put('/users/profile', data);
  },

  // Admin: List customers with order stats aggregation
  getAdminUsers: async (params?: Record<string, any>) => {
    return apiClient.get<any, { success: boolean; data: UserNode[] | any }>('/users', { params });
  },

  // Admin: Get full customer detail (profile + stats + orders + addresses)
  getCustomerDetail: async (id: string) => {
    return apiClient.get<any, { success: boolean; data: CustomerDetail }>(`/users/${id}`);
  },

  // Admin: Get single order detail
  getAdminOrderDetail: async (orderId: string) => {
    return apiClient.get<any, { success: boolean; data: Order }>(`/orders/admin/${orderId}`);
  },

  blockUser: async (id: string, block: boolean, reason?: string) => {
    return apiClient.patch(`/users/${id}/block`, { block, reason });
  },
};
