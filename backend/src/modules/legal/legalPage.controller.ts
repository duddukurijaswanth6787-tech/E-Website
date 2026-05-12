import { Request, Response } from 'express';
import LegalPage from './legalPage.model';
import { sendSuccess } from '../../common/responses';
import { NotFoundError, BadRequestError } from '../../common/errors';

export class LegalPageController {
  /**
   * Get all legal pages (Admin list)
   */
  static async getAll(req: Request, res: Response) {
    const pages = await LegalPage.find().select('-history').sort({ title: 1 });
    return sendSuccess(res, pages, 'Legal pages retrieved');
  }

  /**
   * Get public legal page by slug
   */
  static async getBySlug(req: Request, res: Response) {
    const page = await LegalPage.findOne({ slug: req.params.slug, isPublished: true });
    if (!page) throw new NotFoundError('Legal policy not found');
    return sendSuccess(res, page, 'Legal page retrieved');
  }

  /**
   * Get admin detail (including history)
   */
  static async getAdminDetail(req: Request, res: Response) {
    const page = await LegalPage.findOne({ slug: req.params.slug });
    if (!page) throw new NotFoundError('Legal page not found');
    return sendSuccess(res, page, 'Legal page detail retrieved');
  }

  /**
   * Save draft or update legal page
   */
  static async save(req: Request, res: Response) {
    const { slug, title, content, metaTitle, metaDescription } = req.body;
    const adminId = (req as any).user?.id || 'system';

    let page = await LegalPage.findOne({ slug });

    if (!page) {
      page = await LegalPage.create({
        slug,
        title,
        content,
        metaTitle,
        metaDescription,
        updatedBy: adminId
      });
    } else {
      // Save current content to history before updating
      page.history.push({
        content: page.content,
        version: page.version,
        updatedBy: page.updatedBy,
        createdAt: (page as any).updatedAt || new Date()
      });

      page.title = title || page.title;
      page.content = content || page.content;
      page.metaTitle = metaTitle;
      page.metaDescription = metaDescription;
      page.version += 1;
      page.updatedBy = adminId;
      await page.save();
    }

    return sendSuccess(res, page, 'Legal page saved successfully');
  }

  /**
   * Publish legal page
   */
  static async publish(req: Request, res: Response) {
    const page = await LegalPage.findOne({ slug: req.params.slug });
    if (!page) throw new NotFoundError('Legal page not found');

    page.isPublished = true;
    page.publishedAt = new Date();
    await page.save();

    return sendSuccess(res, page, 'Legal page published');
  }

  /**
   * Rollback to a specific version
   */
  static async rollback(req: Request, res: Response) {
    const { slug, version } = req.body;
    const page = await LegalPage.findOne({ slug });
    if (!page) throw new NotFoundError('Legal page not found');

    const historical = page.history.find(h => h.version === version);
    if (!historical) throw new BadRequestError('Specified version not found in history');

    // Swap current with historical
    const currentBackup = {
      content: page.content,
      version: page.version,
      updatedBy: page.updatedBy,
      createdAt: new Date()
    };

    page.content = historical.content;
    page.version = historical.version;
    page.history = page.history.filter(h => h.version !== version);
    page.history.push(currentBackup);
    
    await page.save();

    return sendSuccess(res, page, `Rolled back to version ${version}`);
  }
}
