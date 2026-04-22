interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare const sendMail: (options: SendMailOptions) => Promise<void>;
export declare const sendOTPEmail: (email: string, name: string, otp: string) => Promise<void>;
export declare const sendPasswordResetEmail: (email: string, name: string, otp: string) => Promise<void>;
export declare const sendOrderConfirmationEmail: (email: string, name: string, orderNumber: string, total: number) => Promise<void>;
export {};
