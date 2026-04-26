"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_model_1 = require("../modules/products/product.model");
const category_model_1 = require("../modules/categories/category.model");
const collection_model_1 = require("../modules/collections/collection.model");
const router = (0, express_1.Router)();
router.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = 'https://vasanthicreations.com';
        const staticPages = ['', '/shop', '/about', '/contact', '/blogs', '/custom-blouse'];
        const [products, categories, collections] = await Promise.all([
            product_model_1.Product.find({ status: 'published', deletedAt: null }).select('slug').lean(),
            category_model_1.Category.find({ isActive: true, deletedAt: null }).select('slug').lean(),
            collection_model_1.Collection.find({ isActive: true, deletedAt: null }).select('slug').lean(),
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
    }
    catch (err) {
        res.status(500).end();
    }
});
router.get('/robots.txt', (req, res) => {
    const robots = `User-agent: *
Allow: /
Sitemap: https://vasanthicreations.com/sitemap.xml`;
    res.header('Content-Type', 'text/plain');
    res.send(robots);
});
exports.default = router;
//# sourceMappingURL=seo.routes.js.map