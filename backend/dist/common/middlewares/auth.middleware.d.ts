import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: string;
            };
            admin?: {
                adminId: string;
                role: string;
                permissions: string[];
            };
        }
    }
}
export declare const authenticateUser: (req: Request, _res: Response, next: NextFunction) => void;
export declare const authenticateAdmin: (req: Request, _res: Response, next: NextFunction) => void;
export declare const optionalAuthenticateUser: (req: Request, _res: Response, next: NextFunction) => void;
export declare const requirePermission: (permission: string) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireAnyPermission: (...permissions: string[]) => (req: Request, _res: Response, next: NextFunction) => void;
