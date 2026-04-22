import { Request, Response, NextFunction } from 'express';
export declare class AdminAuthController {
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const adminAuthController: AdminAuthController;
