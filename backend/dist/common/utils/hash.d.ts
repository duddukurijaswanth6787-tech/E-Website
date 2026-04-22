export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (plainPassword: string, hashedPassword: string) => Promise<boolean>;
