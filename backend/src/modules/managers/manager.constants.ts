export const MANAGER_PERMISSIONS = {
  // Operational Assignments
  ASSIGN_WORKFLOW_TASKS: 'assign_workflow_tasks',
  REASSIGN_TASKS: 'reassign_tasks',
  
  // Workload & Analytics
  VIEW_ALL_TAILORS: 'view_all_tailors',
  VIEW_WORKFLOW_ANALYTICS: 'view_workflow_analytics',
  VIEW_MANAGER_ANALYTICS: 'view_manager_analytics',
  EXPORT_REPORTS: 'export_reports',
  
  // Deadlines & Status
  UPDATE_DEADLINES: 'update_deadlines',
  MANAGE_ESCALATIONS: 'manage_escalations',
  VIEW_PRODUCTION_STATUS: 'view_production_status',
  VIEW_ALL_WORKFLOWS: 'view_all_workflows',
  UPDATE_WORKFLOW_PRIORITY: 'update_workflow_priority',
  VIEW_DELAYED_TASKS: 'view_delayed_tasks',
  
  // Quality Control
  VIEW_QC_STATUS: 'view_qc_status',
  ASSIGN_QC_TASKS: 'assign_qc_tasks',
} as const;

export type ManagerPermission = typeof MANAGER_PERMISSIONS[keyof typeof MANAGER_PERMISSIONS];

export const MANAGER_TYPES = {
  SENIOR_MANAGER: 'SENIOR_MANAGER',
  FLOOR_MANAGER: 'FLOOR_MANAGER',
  QC_MANAGER: 'QC_MANAGER',
  PRODUCTION_LEAD: 'PRODUCTION_LEAD',
  QUALITY_INSPECTOR: 'QUALITY_INSPECTOR',
  STORE_MANAGER: 'STORE_MANAGER',
} as const;

export type ManagerType = typeof MANAGER_TYPES[keyof typeof MANAGER_TYPES];
