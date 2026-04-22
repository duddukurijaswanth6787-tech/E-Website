import { getMailTransporter } from '../../config/mail';
import { env } from '../../config/env';
import { logger } from '../logger';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendMail = async (options: SendMailOptions): Promise<void> => {
  if (!env.mail.user || !env.mail.pass) {
    logger.warn(`[Email DISABLED] Would send to ${options.to}: ${options.subject}`);
    return;
  }

  try {
    const transporter = getMailTransporter();
    await transporter.sendMail({
      from: env.mail.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}:`, error);
    if (env.nodeEnv === 'production') {
      throw new Error('Failed to send email. Please try again later.');
    } else {
      logger.warn(`[DEVSAVE] Email sending failed but suppressed for ${options.to}`);
    }
  }
};

export const sendOTPEmail = async (email: string, name: string, otp: string): Promise<void> => {
  await sendMail({
    to: email,
    subject: 'Verify Your Email — Vasanthi Creations',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #A51648 0%, #7b1035 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">Vasanthi Creations</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Premium Ethnic Fashion</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1a1a2e; margin: 0 0 16px; font-size: 22px;">Hello, ${name}! 🌸</h2>
          <p style="color: #4a4a68; line-height: 1.7; margin: 0 0 24px;">Please use the verification code below to complete your registration:</p>
          <div style="background: #fdf2f7; border: 2px dashed #A51648; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
            <p style="color: #888; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
            <div style="font-size: 42px; font-weight: 700; color: #A51648; letter-spacing: 8px;">${otp}</div>
            <p style="color: #888; font-size: 12px; margin: 12px 0 0;">This code expires in <strong>10 minutes</strong></p>
          </div>
          <p style="color: #4a4a68; font-size: 13px; line-height: 1.7; margin: 0 0 32px;">If you did not request this, please ignore this email. Do not share this code with anyone.</p>
          <div style="border-top: 1px solid #f0f0f7; padding-top: 24px; text-align: center;">
            <p style="color: #aaa; font-size: 12px; margin: 0;">© 2024 Vasanthi Creations. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
    text: `Hello ${name},\n\nYour OTP for Vasanthi Creations is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
  });
};

export const sendPasswordResetEmail = async (email: string, name: string, otp: string): Promise<void> => {
  await sendMail({
    to: email,
    subject: 'Reset Your Password — Vasanthi Creations',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #A51648 0%, #7b1035 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">Vasanthi Creations</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1a1a2e; margin: 0 0 16px;">Password Reset Request</h2>
          <p style="color: #4a4a68; line-height: 1.7; margin: 0 0 24px;">Hello ${name}, use the code below to reset your password:</p>
          <div style="background: #fdf2f7; border: 2px dashed #A51648; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
            <div style="font-size: 42px; font-weight: 700; color: #A51648; letter-spacing: 8px;">${otp}</div>
            <p style="color: #888; font-size: 12px; margin: 12px 0 0;">Expires in <strong>10 minutes</strong></p>
          </div>
          <p style="color: #4a4a68; font-size: 13px;">If you did not request a password reset, please secure your account immediately.</p>
        </div>
      </div>
    `,
    text: `Hello ${name},\n\nYour password reset OTP is: ${otp}\n\nThis code expires in 10 minutes.`,
  });
};

export const sendOrderConfirmationEmail = async (
  email: string,
  name: string,
  orderNumber: string,
  total: number,
): Promise<void> => {
  await sendMail({
    to: email,
    subject: `Order Confirmed #${orderNumber} — Vasanthi Creations`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #A51648 0%, #7b1035 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Vasanthi Creations</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1a1a2e;">🎉 Order Confirmed!</h2>
          <p style="color: #4a4a68; line-height: 1.7;">Hello ${name}, your order has been confirmed successfully.</p>
          <div style="background: #fdf2f7; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 8px; color: #888; font-size: 13px;">ORDER NUMBER</p>
            <p style="margin: 0; color: #A51648; font-size: 20px; font-weight: 700;">#${orderNumber}</p>
            <p style="margin: 12px 0 0; color: #4a4a68;">Total: <strong>₹${total.toLocaleString('en-IN')}</strong></p>
          </div>
          <p style="color: #4a4a68;">You can track your order status from your dashboard. We'll keep you updated!</p>
        </div>
      </div>
    `,
    text: `Hello ${name},\n\nYour order #${orderNumber} has been confirmed!\nTotal: ₹${total}`,
  });
};
