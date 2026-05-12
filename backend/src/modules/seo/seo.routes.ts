import { Router } from 'express';
import { SeoController } from './seo.controller';

const router = Router();

router.get('/sitemap.xml', SeoController.getSitemap);
router.get('/robots.txt', SeoController.getRobots);

export default router;
