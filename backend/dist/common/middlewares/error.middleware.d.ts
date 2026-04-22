import { Request, Response, NextFunction } from 'express';
export declare const globalErrorHandler: (err: Error, req: Request, res: Response, _next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
