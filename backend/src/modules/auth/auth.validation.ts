import { z } from 'zod';
import { commonSchemas } from '../../common/validation/schemas';

export const registerSchema = z.object({
  body: z.object({
    name: commonSchemas.name,
    email: commonSchemas.email,
    password: commonSchemas.password,
    mobile: commonSchemas.mobile,
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  })
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: commonSchemas.email,
    otp: commonSchemas.otp,
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: commonSchemas.email,
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: commonSchemas.email,
    otp: commonSchemas.otp,
    newPassword: commonSchemas.password,
  })
});

export const resendOTPSchema = z.object({
  body: z.object({
    email: commonSchemas.email,
  })
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  })
});
