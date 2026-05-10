import { Router, Request, Response, NextFunction } from 'express';
import { BoutiqueOwner } from './ownerAuth.model';
import { ownerAuthService } from './ownerAuth.service';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { PERMISSIONS } from '../../common/constants';
import { sendSuccess, sendNoContent, sendPaginated } from '../../common/responses';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination';
import { NotFoundError } from '../../common/errors';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: BoutiqueOwnerAdmin
 *   description: Admin management of boutique owners
 */

/**
 * @swagger
 * /admin/boutique-owners:
 *   get:
 *     tags: [BoutiqueOwnerAdmin]
 *     summary: List all boutique owner accounts
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: isApproved
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Paginated list of boutique owners
 */
router.get(
  '/',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_BOUTIQUES),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip } = parsePagination(req);
      const filter: Record<string, unknown> = { deletedAt: null };
      if (req.query.isApproved !== undefined) {
        filter.isApproved = req.query.isApproved === 'true';
      }
      const [owners, total] = await Promise.all([
        BoutiqueOwner.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        BoutiqueOwner.countDocuments(filter),
      ]);
      sendPaginated(res, owners, buildPaginationMeta(total, page, limit));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /admin/boutique-owners/{id}:
 *   get:
 *     tags: [BoutiqueOwnerAdmin]
 *     summary: Get boutique owner details
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Owner details
 *       404:
 *         description: Not found
 */
router.get(
  '/:id',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_BOUTIQUES),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const owner = await BoutiqueOwner.findOne({ _id: req.params.id, deletedAt: null });
      if (!owner) throw new NotFoundError('Boutique owner');
      sendSuccess(res, owner);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /admin/boutique-owners/{id}/approve:
 *   patch:
 *     tags: [BoutiqueOwnerAdmin]
 *     summary: Approve a boutique owner account
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Owner approved
 */
router.patch(
  '/:id/approve',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_BOUTIQUES),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const owner = await ownerAuthService.approveOwner(req.params.id as string, req.admin!.adminId);
      sendSuccess(res, owner, 'Boutique owner approved successfully');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /admin/boutique-owners/{id}/reject:
 *   patch:
 *     tags: [BoutiqueOwnerAdmin]
 *     summary: Reject a boutique owner account
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Owner rejected
 */
router.patch(
  '/:id/reject',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_BOUTIQUES),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const owner = await ownerAuthService.rejectOwner(req.params.id as string, req.admin!.adminId);
      sendSuccess(res, owner, 'Boutique owner rejected');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /admin/boutique-owners/{id}:
 *   delete:
 *     tags: [BoutiqueOwnerAdmin]
 *     summary: Soft-delete a boutique owner account
 *     security:
 *       - AdminBearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete(
  '/:id',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_BOUTIQUES),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const owner = await BoutiqueOwner.findById(req.params.id);
      if (!owner) throw new NotFoundError('Boutique owner');
      owner.deletedAt = new Date();
      await owner.save();
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
