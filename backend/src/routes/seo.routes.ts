import { Router, Request, Response } from 'express';
import { Product } from '../modules/products/product.model';
import { Category } from '../modules/categories/category.model';
import { Collection } from '../modules/collections/collection.model';

const router = Router();

router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const baseUrl = 'https://vasanthicreations.com';
    const staticPages = ['', '/shop', '/about', '/contact', '/blogs', '/custom-blouse'];
    
    const [products, categories, collections] = await Promise.all([
      Product.find({ status: 'published', deletedAt: null }).select('slug').lean(),
      Category.find({ isActive: true, deletedAt: null }).select('slug').lean(),
      Collection.find({ isActive: true, deletedAt: null }).select('slug').lean(),
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static
    staticPages.forEach(p => {
      xml += `<url><loc>${baseUrl}${p}</loc><changefreq>weekly</changefreq></url>`;
    });

    // Dynamic
    products.forEach(p => {
      xml += `<url><loc>${baseUrl}/product/${p.slug}</loc></url>`;
    });
    categories.forEach(c => {
      xml += `<url><loc>${baseUrl}/category/${c.slug}</loc></url>`;
    });
    collections.forEach(c => {
      xml += `<url><loc>${baseUrl}/collection/${c.slug}</loc></url>`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).end();
  }
});

router.get('/robots.txt', (req: Request, res: Response) => {
  const robots = `User-agent: *
Allow: /
Sitemap: https://vasanthicreations.com/sitemap.xml`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

export default router;
