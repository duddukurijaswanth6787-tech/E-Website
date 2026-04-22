import apiClient from '../client';

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  author?: {
    name: string;
  } | string;
  status: string;
  tags?: string[];
  createdAt: string;
}

export const blogService = {
  getBlogs: async (params?: Record<string, any>) => {
    return apiClient.get<any, { success: boolean, data: BlogPost[] | any }>('/blogs', { params });
  },

  getBlogBySlug: async (slug: string) => {
    return apiClient.get<any, { success: boolean, data: BlogPost }>(`/blogs/${slug}`);
  },

  // Admin Methods
  getAdminBlogs: async (params?: Record<string, any>) => {
    return apiClient.get<any, { success: boolean, data: any }>('/blogs/admin', { params });
  },

  createBlog: async (data: FormData | Record<string, any>) => {
    const isFormData = data instanceof FormData;
    return apiClient.post('/blogs', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
  },

  updateBlog: async (id: string, data: FormData | Record<string, any>) => {
    const isFormData = data instanceof FormData;
    return apiClient.put(`/blogs/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
  },

  deleteBlog: async (id: string) => {
    return apiClient.delete(`/blogs/${id}`);
  }
};
