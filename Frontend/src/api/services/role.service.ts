import apiClient from '../client';

export interface RoleMatrix {
  roles: string[];
  rolePermissions: Record<string, string[]>;
}

export const roleService = {
  getRoles: async () => {
    return apiClient.get<any, { success: boolean, data: RoleMatrix }>('/roles');
  },

  getPermissionsList: async () => {
    return apiClient.get<any, { success: boolean, data: string[] }>('/roles/permissions');
  }
};
