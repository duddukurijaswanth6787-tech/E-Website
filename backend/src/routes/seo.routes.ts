import { Router, Request, Response } from 'express';
import { Product } from '../modules/products/product.model';
import { Category } from '../modules/categories/category.model';
import { Collection } from '../modules/collections/collection.model';

const router = Router();

router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const { seoService } = await import('../modules/seo/seo.service');
    const xml = await seoService.generateSitemap();
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).end();
  }
});

router.get('/robots.txt', async (req: Request, res: Response) => {
  const { seoService } = await import('../modules/seo/seo.service');
  const robots = seoService.generateRobotsTxt();
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

export default router;
