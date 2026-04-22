import apiClient from '../client';

export interface SupportTicket {
  _id: string;
  customerName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminNotes?: string;
  createdAt: string;
}

export const supportService = {
  getAdminTickets: async (params?: Record<string, any>) => {
    return apiClient.get<any, { success: boolean, data: SupportTicket[] | any }>('/support/admin', { params });
  },

  updateTicketStatus: async (id: string, status: string, notes?: string) => {
    return apiClient.patch(`/support/${id}/status`, { status, adminNotes: notes });
  }
};
