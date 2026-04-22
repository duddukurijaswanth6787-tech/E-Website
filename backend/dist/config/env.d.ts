export declare const env: {
    nodeEnv: string;
    port: number;
    frontendUrl: string;
    isProduction: boolean;
    mongo: {
        uri: string;
    };
    redis: {
        url: string;
    };
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
    };
    mail: {
        enabled: boolean;
        host: string;
        port: number;
        user: string;
        pass: string;
        from: string;
    };
    razorpay: {
        keyId: string;
        keySecret: string;
        webhookSecret: string;
    };
    rateLimit: {
        windowMs: number;
        max: number;
        authMax: number;
    };
    upload: {
        maxFileSizeMb: number;
        uploadDir: string;
    };
    log: {
        level: string;
        dir: string;
    };
    seed: {
        adminName: string;
        adminEmail: string;
        adminPassword: string;
    };
};
