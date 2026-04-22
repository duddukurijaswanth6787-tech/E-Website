export declare const generateOTP: () => string;
export declare const storeOTP: (key: string, otp: string) => Promise<void>;
export declare const verifyOTP: (key: string, otp: string) => Promise<boolean>;
export declare const deleteOTP: (key: string) => Promise<void>;
export declare const getOTPRemainingTTL: (key: string) => Promise<number>;
