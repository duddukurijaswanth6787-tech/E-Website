export declare class AuthService {
    register(data: {
        name: string;
        email: string;
        password: string;
        mobile?: string;
    }): Promise<{
        message: string;
        email: string;
        requiresOtp: boolean;
        user?: undefined;
        accessToken?: undefined;
        refreshToken?: undefined;
    } | {
        message: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
        accessToken: string;
        refreshToken: string;
        requiresOtp: boolean;
        email?: undefined;
    }>;
    verifyEmail(email: string, otp: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(email: string, password: string): Promise<{
        message: string;
        email: string;
        requiresOtp: boolean;
        user?: undefined;
        accessToken?: undefined;
        refreshToken?: undefined;
    } | {
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            avatar: string;
        };
        accessToken: string;
        refreshToken: string;
        requiresOtp: boolean;
        message?: undefined;
        email?: undefined;
    }>;
    verifyLoginOTP(email: string, otp: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            avatar: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, refreshToken: string): Promise<void>;
    forgotPassword(email: string): Promise<{
        message: string;
        requiresOtp?: undefined;
    } | {
        message: string;
        requiresOtp: boolean;
    }>;
    resetPassword(email: string, otp: string, newPassword: string): Promise<{
        message: string;
    }>;
    resendOTP(email: string): Promise<{
        message: string;
    }>;
}
export declare const authService: AuthService;
