import apiClient from '../client';
// import { PaginatedResponse } from './adminTailor.service';

export interface ManagerDashboardAnalytics {
  statusCounts: Record<string, number>;
  delayedTasksCount: number;
  reworkCount: number;
}

export interface TailorProductivity {
  id: string;
  name: string;
  tailorCode: string;
  specialization: string[];
  currentAssignedCount: number;
  completedOrdersCount: number;
  dailyCapacity: number;
  loadPercentage: number;
  status: 'AVAILABLE' | 'HIGH' | 'OVERLOADED';
}

export interface Escalation {
  _id: string;
  taskNumber: string;
  taskDescription: string;
  status: string;
  priority: string;
  escalationSeverity: string;
  escalationFlags: string[];
  deadline: string;
  tailorId: {
    _id: string;
    name: string;
    tailorCode: string;
  };
  orderId?: {
    _id: string;
    orderNumber: string;
  };
}

export const managerDashboardService = {
  getDashboardAnalytics: async (): Promise<{ status: string; data: ManagerDashboardAnalytics }> => {
    return apiClient.get('/admin/workflows/analytics/dashboard');
  },
  
  getTailorProductivity: async (): Promise<{ status: string; data: TailorProductivity[] }> => {
    return apiClient.get('/admin/workflows/analytics/tailors');
  },

  getEscalations: async (): Promise<{ status: string; data: Escalation[] }> => {
    return apiClient.get('/admin/workflows/analytics/escalations');
  }
};

