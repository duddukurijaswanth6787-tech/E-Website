import nodemailer, { Transporter } from 'nodemailer';
import { env } from './env';
import { logger } from '../common/logger';

let transporter: Transporter | null = null;

export const getMailTransporter = (): Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      secure: env.mail.port === 465,
      auth: {
        user: env.mail.user,
        pass: env.mail.pass,
      },
    });
  }
  return transporter;
};

export const verifyMailConnection = async (): Promise<void> => {
  if (!env.mail.enabled) {
    logger.warn('⚠️  Mail is disabled by configuration (MAIL_ENABLED=false)');
    return;
  }
  if (!env.mail.user || !env.mail.pass) {
    logger.warn('⚠️  Mail credentials not set — email sending will be disabled');
    return;
  }
  try {
    const t = getMailTransporter();
    await t.verify();
    logger.info('✅ Mail transporter ready');
  } catch (error: any) {
    logger.warn(`⚠️  Mail connection failed: ${error.message.split('\\n')[0]} - Email sending disabled`);
  }
};
