import { Router } from 'express';
import { ownerAuthController } from './ownerAuth.controller';
import { ownerRegisterValidation, ownerLoginValidation, ownerRefreshValidation } from './ownerAuth.validation';
import { handleValidationErrors, authenticateUser } from '../../common/middlewares';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: OwnerAuth
 *   description: Boutique Owner Authentication
 */

/**
 * @swagger
 * /owner-auth/register:
 *   post:
 *     tags: [OwnerAuth]
 *     summary: Boutique owner registration
 *     description: Creates a new boutique owner account. Account is pending admin approval before login is allowed.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ownerName, email, mobile, password]
 *             properties:
 *               ownerName: { type: string, example: "Priya Sharma" }
 *               email: { type: string, example: "priya@boutique.com" }
 *               mobile: { type: string, example: "9876543210" }
 *               password: { type: string, example: "Secure@123" }
 *     responses:
 *       201:
 *         description: Registration successful – pending approval
 *       409:
 *         description: Email already registered
 */
router.post('/register', ownerRegisterValidation, handleValidationErrors, ownerAuthController.register);

/**
 * @swagger
 * /owner-auth/login:
 *   post:
 *     tags: [OwnerAuth]
 *     summary: Boutique owner login
 *     description: Login is only allowed after admin approves the account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful – returns accessToken and refreshToken
 *       403:
 *         description: Account pending approval or suspended
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', ownerLoginValidation, handleValidationErrors, ownerAuthController.login);

/**
 * @swagger
 * /owner-auth/refresh:
 *   post:
 *     tags: [OwnerAuth]
 *     summary: Refresh owner access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New token pair returned
 */
router.post('/refresh', ownerRefreshValidation, handleValidationErrors, ownerAuthController.refresh);

/**
 * @swagger
 * /owner-auth/logout:
 *   post:
 *     tags: [OwnerAuth]
 *     summary: Boutique owner logout
 *     security:
 *       - CustomerBearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authenticateUser, ownerAuthController.logout);

/**
 * @swagger
 * /owner-auth/me:
 *   get:
 *     tags: [OwnerAuth]
 *     summary: Get current owner profile
 *     security:
 *       - CustomerBearerAuth: []
 *     responses:
 *       200:
 *         description: Owner profile
 */
router.get('/me', authenticateUser, ownerAuthController.getMe);

export default router;
