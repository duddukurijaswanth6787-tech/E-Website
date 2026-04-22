import Razorpay from 'razorpay';
import { env } from './env';

let razorpayInstance: Razorpay | null = null;

export const getRazorpayInstance = (): Razorpay => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: env.razorpay.keyId,
      key_secret: env.razorpay.keySecret,
    });
  }
  return razorpayInstance;
};
