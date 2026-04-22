export declare class AdminAuthService {
    login(email: string, password: string, ip?: string): Promise<{
        admin: {
            id: string;
            name: string;
            email: string;
            role: string;
            permissions: string[];
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(adminId: string, refreshToken: string): Promise<void>;
    forceLogout(adminId: string): Promise<void>;
    getMe(adminId: string): Promise<{
        permissions: string[];
        name: string;
        email: string;
        passwordHash: string;
        role: string;
        isActive: boolean;
        avatar?: string;
        refreshTokens: string[];
        lastLoginAt?: Date;
        lastLoginIp?: string;
        createdBy?: import("mongoose").Types.ObjectId;
        updatedBy?: import("mongoose").Types.ObjectId;
        deletedAt?: Date;
        createdAt: Date;
        updatedAt: Date;
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
}
export declare const adminAuthService: AdminAuthService;
