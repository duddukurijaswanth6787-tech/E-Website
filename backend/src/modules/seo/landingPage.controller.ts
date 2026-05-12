import { Request, Response } from 'express';
import { LandingPage } from './landingPage.model';
import { sendSuccess } from '../../common/responses';
import { NotFoundError } from '../../common/errors';

export class LandingPageController {
  /**
   * Get a landing page by slug for public display
   */
  static async getBySlug(req: Request, res: Response) {
    const { slug } = req.params;
    
    const page = await LandingPage.findOne({ slug, isActive: true });
    
    if (!page) {
      throw new NotFoundError('Landing page not found');
    }

    return sendSuccess(res, page, 'Landing page retrieved');
  }

  /**
   * Admin: List all landing pages
   */
  static async list(req: Request, res: Response) {
    const pages = await LandingPage.find().sort('-createdAt');
    return sendSuccess(res, pages, 'Landing pages retrieved');
  }

  /**
   * Admin: Create or Update landing page
   */
  static async save(req: Request, res: Response) {
    const { slug } = req.body;
    
    const page = await LandingPage.findOneAndUpdate(
      { slug: slug.toLowerCase() },
      { ...req.body, slug: slug.toLowerCase() },
      { upsert: true, new: true, runValidators: true }
    );

    return sendSuccess(res, page, 'Landing page saved');
  }
}
