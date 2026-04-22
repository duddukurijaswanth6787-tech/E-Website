import { Transporter } from 'nodemailer';
export declare const getMailTransporter: () => Transporter;
export declare const verifyMailConnection: () => Promise<void>;
