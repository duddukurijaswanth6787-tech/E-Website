import apiClient from '../client';

export type EmployeeLiveStatus = 'online' | 'offline' | 'idle' | 'working' | 'on_break' | 'busy' | 'in_meeting';

export interface WorkforceOverviewMember {
  _id: string;
  name: string;
  type: 'tailor' | 'manager' | 'admin';
  liveStatus: EmployeeLiveStatus;
  lastActive?: string;
  isPresent: boolean;
  checkIn?: string;
  checkOut?: string;
  attendanceStatus: string;
  tailorCode?: string;
  managerCode?: string;
  specialization?: string[];
  branchName?: string;
}

export const workforceService = {
  updateStatus: async (status: EmployeeLiveStatus, taskId?: string, taskType?: string) => {
    return apiClient.patch('/workforce/status', { status, taskId, taskType });
  },

  getOverview: async () => {
    return apiClient.get('/workforce/overview');
  },

  getOperationsIntelligence: async () => {
    return apiClient.get('/workforce/operations-intelligence');
  }
};
