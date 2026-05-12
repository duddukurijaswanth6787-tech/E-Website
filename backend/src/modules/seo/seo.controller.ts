import { Request, Response, NextFunction } from 'express';
import { Product } from '../products/product.model';
import { Category } from '../categories/category.model';
import { ContentPage as Blog } from '../content/content.model';

export class SeoController {
  static async getSitemap(req: Request, res: Response, next: NextFunction) {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'https://vasanthicreations.com';
      
      const [products, categories, blogs] = await Promise.all([
        Product.find({ status: 'published', deletedAt: null }).select('slug updatedAt').lean(),
        Category.find({ isActive: true, deletedAt: null }).select('slug updatedAt').lean(),
        Blog.find({ status: 'PUBLISHED', deletedAt: null }).select('slug updatedAt').lean(),
      ]);

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // Static Pages
      const staticPages = ['', '/shop', '/about', '/contact', '/track-order'];
      staticPages.forEach(path => {
        xml += `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      });

      // Products
      products.forEach(p => {
        xml += `  <url>\n    <loc>${baseUrl}/product/${p.slug}</loc>\n    <lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      });

      // Categories
      categories.forEach(c => {
        xml += `  <url>\n    <loc>${baseUrl}/category/${c.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      });

      // Blogs
      blogs.forEach(b => {
        xml += `  <url>\n    <loc>${baseUrl}/blog/${b.slug}</loc>\n    <lastmod>${b.updatedAt.toISOString().split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
      });

      xml += `</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.status(200).send(xml);
    } catch (err) { next(err); }
  }

  static async getRobots(req: Request, res: Response) {
    const baseUrl = process.env.FRONTEND_URL || 'https://vasanthicreations.com';
    const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /checkout/
Disallow: /my-account/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.header('Content-Type', 'text/plain');
    res.status(200).send(robots);
  }
}
