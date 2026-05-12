import { Product } from '../products/product.model';
import { Category } from '../categories/category.model';
import { Collection } from '../collections/collection.model';
import { ContentPage as Blog } from '../content/content.model';
import { LandingPage } from './landingPage.model';
import { logger } from '../../common/logger';

export interface SeoMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

class SeoService {
  private readonly baseUrl = 'https://vasanthicreations.com';

  async generateSitemap(): Promise<string> {
    try {
      const [products, categories, collections, blogs, landingPages] = await Promise.all([
        Product.find({ status: 'published', deletedAt: null }).select('slug updatedAt').lean(),
        Category.find({ isActive: true, deletedAt: null }).select('slug updatedAt').lean(),
        Collection.find({ isActive: true, deletedAt: null }).select('slug updatedAt').lean(),
        Blog.find({ isPublished: true, type: 'blog' }).select('slug updatedAt').lean(),
        LandingPage.find({ isActive: true }).select('slug updatedAt').lean(),
      ]);

      const staticPages = [
        { url: '', priority: 1.0, changefreq: 'daily' },
        { url: '/shop', priority: 0.9, changefreq: 'daily' },
        { url: '/about', priority: 0.5, changefreq: 'monthly' },
        { url: '/contact', priority: 0.5, changefreq: 'monthly' },
        { url: '/blogs', priority: 0.8, changefreq: 'daily' },
        { url: '/custom-blouse', priority: 0.9, changefreq: 'weekly' },
      ];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

      // Static Pages
      staticPages.forEach(p => {
        xml += `
  <url>
    <loc>${this.baseUrl}${p.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`;
      });

      // Products with Images
      products.forEach((p: any) => {
        xml += `
  <url>
    <loc>${this.baseUrl}/product/${p.slug}</loc>
    <lastmod>${(p.updatedAt || new Date()).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
      });

      // Categories
      categories.forEach((c: any) => {
        xml += `
  <url>
    <loc>${this.baseUrl}/category/${c.slug}</loc>
    <lastmod>${(c.updatedAt || new Date()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });

      // Blogs
      blogs.forEach((b: any) => {
        xml += `
  <url>
    <loc>${this.baseUrl}/blogs/${b.slug}</loc>
    <lastmod>${(b.updatedAt || new Date()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      });
      
      // Landing Pages
      landingPages.forEach((lp: any) => {
        xml += `
  <url>
    <loc>${this.baseUrl}/l/${lp.slug}</loc>
    <lastmod>${(lp.updatedAt || new Date()).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
      });

      xml += `\n</urlset>`;
      return xml;
    } catch (err) {
      logger.error('Sitemap generation failed:', err);
      throw err;
    }
  }

  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /manager/
Disallow: /tailor/
Disallow: /my/
Disallow: /api/
Disallow: /checkout/
Disallow: /order-success/

Sitemap: ${this.baseUrl}/sitemap.xml
Host: ${this.baseUrl}`;
  }

  async getPageMetadata(type: string, slug: string): Promise<SeoMetadata | null> {
    // Strategy for dynamic metadata generation if SEO field is empty
    switch (type) {
      case 'product':
        const product = await Product.findOne({ slug }).lean();
        if (!product) return null;
        return {
          title: product.seo?.title || `${product.name} | Vasanthi Creations`,
          description: product.seo?.description || product.shortDescription || product.description.substring(0, 160),
          keywords: product.seo?.keywords || product.tags || [],
          ogImage: product.seo?.ogImage || product.images?.[0]?.url,
        };
      case 'category':
        const category = await Category.findOne({ slug }).lean();
        if (!category) return null;
        return {
          title: category.seo?.title || `${category.name} Collections | Vasanthi Creations`,
          description: category.seo?.description || category.description?.substring(0, 160) || `Explore our premium ${category.name} collection.`,
          keywords: category.seo?.keywords || [],
          ogImage: category.seo?.ogImage || category.banner,
        };
      case 'blog':
        const blog = await Blog.findOne({ slug, type: 'blog' }).lean();
        if (!blog) return null;
        return {
          title: blog.seo?.title || `${blog.title} | The Journal`,
          description: blog.seo?.description || (blog as any).excerpt || blog.body.substring(0, 160),
          keywords: blog.seo?.keywords || blog.tags || [],
          ogImage: blog.seo?.ogImage || blog.coverImage,
        };
      default:
        return null;
    }
  }
}

export const seoService = new SeoService();
