import { z } from 'zod';
import { MANAGER_PERMISSIONS, MANAGER_TYPES } from './manager.constants';

const permissionsEnum = Object.values(MANAGER_PERMISSIONS) as [string, ...string[]];
const typesEnum = Object.values(MANAGER_TYPES) as [string, ...string[]];

export const createManagerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Invalid phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    managerType: z.enum(typesEnum).default(MANAGER_TYPES.FLOOR_MANAGER),
    department: z.enum(['PRODUCTION', 'QUALITY_CONTROL', 'GENERAL']).default('PRODUCTION'),
    permissions: z.array(z.enum(permissionsEnum)).optional(),
    
    assignedTailors: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Tailor ID')).optional(),
    branchId: z.string().optional(),
    branchName: z.string().optional(),
    
    isActive: z.boolean().optional(),
  })
});

export const updateManagerSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().regex(/^\+?[\d\s-]{10,}$/).optional(),
    managerType: z.enum(typesEnum).optional(),
    department: z.enum(['PRODUCTION', 'QUALITY_CONTROL', 'GENERAL']).optional(),
    permissions: z.array(z.enum(permissionsEnum)).optional(),
    
    assignedTailors: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
    branchId: z.string().optional(),
    branchName: z.string().optional(),
    
    notificationPreferences: z.object({
      emailAlerts: z.boolean().optional(),
      whatsappAlerts: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
    }).optional(),
  })
});

export const updateManagerStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean().optional(),
    isVerified: z.boolean().optional(),
    unlockAccount: z.boolean().optional(), // Admin can manually unlock
  })
});

export const resetManagerPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
});
