import { Request, Response, NextFunction } from 'express';
import { cmsService } from './cms.service';
import { sendSuccess } from '../../common/responses';

export const cmsController = {
  /**
   * @swagger
   * /api/v1/cms/home/hero:
   *   get:
   *     tags: [Content]
   *     summary: Get public homepage hero section
   *     responses:
   *       200:
   *         description: Hero section details
   */
  getPublicHero: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hero = await cmsService.getHeroSection();
      // Even if it's not published, we might return a default or just return it and let frontend decide
      sendSuccess(res, hero, 'Hero section fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/v1/admin/cms/home/hero:
   *   get:
   *     tags: [Content]
   *     summary: Get admin homepage hero section
   *     security:
   *       - AdminBearerAuth: []
   *     responses:
   *       200:
   *         description: Hero section details
   */
  getAdminHero: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hero = await cmsService.getHeroSection();
      sendSuccess(res, hero, 'Admin hero section fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * @swagger
   * /api/v1/admin/cms/home/hero:
   *   put:
   *     tags: [Content]
   *     summary: Update homepage hero section
   *     security:
   *       - AdminBearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               titleLine1:
   *                 type: string
   *               titleLine2:
   *                 type: string
   *               subtitle:
   *                 type: string
   *               badgeText:
   *                 type: string
   *               backgroundImage:
   *                 type: string
   *               desktopImageAlt:
   *                 type: string
   *               mobileBackgroundImage:
   *                 type: string
   *               mobileImageAlt:
   *                 type: string
   *               primaryButtonText:
   *                 type: string
   *               primaryButtonLink:
   *                 type: string
   *               secondaryButtonText:
   *                 type: string
   *               secondaryButtonLink:
   *                 type: string
   *               overlayOpacity:
   *                 type: number
   *               isPublished:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Hero section updated successfully
   */
  updateHero: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req.admin as any).adminId;
      const updatedHero = await cmsService.updateHeroSection(req.body, adminId);
      sendSuccess(res, updatedHero, 'Hero section updated successfully');
    } catch (err) {
      next(err);
    }
  },
};
