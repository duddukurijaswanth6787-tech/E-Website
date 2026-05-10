import { body } from 'express-validator';

export const ownerRegisterValidation = [
  body('ownerName').trim().notEmpty().withMessage('Owner name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Enter a valid email'),
  body('mobile')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit Indian mobile number'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter and one number'),
];

export const ownerLoginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const ownerRefreshValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];
