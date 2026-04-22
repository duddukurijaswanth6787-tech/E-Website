import Redis from 'ioredis';
export declare const getRedisClient: () => Redis;
export declare const connectRedis: () => Promise<void>;
export declare const disconnectRedis: () => Promise<void>;
