import { z } from 'zod';
import { TailorSpecialization } from './tailor.model';

export const createTailorSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(8, 'Phone must be at least 8 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    specialization: z.array(z.nativeEnum(TailorSpecialization)).optional(),
    experienceYears: z.number().min(0).optional(),
    isAvailable: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateTailorSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(8).optional(),
    specialization: z.array(z.nativeEnum(TailorSpecialization)).optional(),
    experienceYears: z.number().min(0).optional(),
    isAvailable: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Tailor ID'),
  }),
});

export const getTailorsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    specialization: z.nativeEnum(TailorSpecialization).optional(),
    isActive: z.string().optional().transform(val => val === 'true'),
    isAvailable: z.string().optional().transform(val => val === 'true'),
    search: z.string().optional(),
  }),
});

export const updateTailorStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one status field must be provided"
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Tailor ID'),
  }),
});
