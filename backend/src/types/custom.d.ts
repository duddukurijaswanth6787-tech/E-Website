import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: {
        userId: string;
        role: string;
      };
      admin?: {
        adminId: string;
        role: string;
        tenantId: string;
      };
      manager?: {
        managerId: string;
        permissions: string[];
        branchId?: string | null;
      };
      tenantId?: string;
    }
  }
}

export {};
