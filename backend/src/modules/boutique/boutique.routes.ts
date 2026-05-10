import { Router } from 'express';
import { boutiqueController } from './boutique.controller';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { PERMISSIONS } from '../../common/constants';

const router = Router();

/**
 * @swagger
 * /boutiques:
 *   post:
 *     tags: [Boutique]
 *     summary: Create a new boutique
 *     security:
 *       - AdminBearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [boutiqueId, name, owner, email, mobile, address, category]
 *             properties:
 *               boutiqueId: { type: string }
 *               name: { type: string }
 *               owner: { type: string }
 *               email: { type: string }
 *               mobile: { type: string }
 *               address: { type: string }
 *               category: { type: string }
 *     responses:
 *       201:
 *         description: Boutique created
 */
router.post(
  '/',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_SETTINGS), // Example permission
  boutiqueController.create
);

/**
 * @swagger
 * /boutiques:
 *   get:
 *     tags: [Boutique]
 *     summary: List all boutiques
 *     responses:
 *       200:
 *         description: List of boutiques
 */
router.get('/', boutiqueController.list);

/**
 * @swagger
 * /boutiques/{id}:
 *   get:
 *     tags: [Boutique]
 *     summary: Get boutique details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Boutique details
 */
router.get('/:id', boutiqueController.getOne);

export default router;
