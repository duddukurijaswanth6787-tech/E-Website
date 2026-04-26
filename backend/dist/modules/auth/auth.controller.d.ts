import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    verifyLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    resendOTP(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const authController: AuthController;
