export interface JwtAccessPayload {
    userId: string;
    role: string;
    type: 'access';
}
export interface JwtRefreshPayload {
    userId: string;
    tokenId: string;
    type: 'refresh';
}
export interface JwtAdminAccessPayload {
    adminId: string;
    role: string;
    permissions: string[];
    type: 'admin_access';
}
export declare const generateAccessToken: (payload: Omit<JwtAccessPayload, "type">) => string;
export declare const generateRefreshToken: (payload: Omit<JwtRefreshPayload, "type">) => string;
export declare const generateAdminAccessToken: (payload: Omit<JwtAdminAccessPayload, "type">) => string;
export declare const verifyAccessToken: (token: string) => JwtAccessPayload;
export declare const verifyRefreshToken: (token: string) => JwtRefreshPayload;
export declare const verifyAdminAccessToken: (token: string) => JwtAdminAccessPayload;
export declare const decodeTokenWithoutVerify: (token: string) => Record<string, unknown> | null;
