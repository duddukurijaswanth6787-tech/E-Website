import apiClient from '../client';

export interface AttendanceRecord {
  _id: string;
  employeeId: string;
  employeeType: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  totalHours?: number;
  breakDuration: number;
  overtime: number;
  notes?: string;
}

export const attendanceService = {
  checkIn: async (data?: any) => {
    return apiClient.post('/attendance/check-in', data);
  },

  checkOut: async () => {
    return apiClient.post('/attendance/check-out');
  },

  getHistory: async (params?: { startDate?: string; endDate?: string }) => {
    return apiClient.get('/attendance/history', { params });
  }
};
