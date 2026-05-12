import { Request, Response } from 'express';
import { seoService } from './seo.service';

export class SitemapController {
  /**
   * Serve dynamic sitemap.xml
   */
  static async getSitemap(req: Request, res: Response) {
    try {
      const xml = await seoService.generateSitemap();
      res.header('Content-Type', 'application/xml');
      return res.status(200).send(xml);
    } catch (error) {
      return res.status(500).send('Sitemap generation failed');
    }
  }

  /**
   * Serve robots.txt
   */
  static getRobots(req: Request, res: Response) {
    const robots = seoService.generateRobotsTxt();
    res.header('Content-Type', 'text/plain');
    return res.status(200).send(robots);
  }
}
