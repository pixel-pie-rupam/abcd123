const router = require('express').Router();
const { SeoSettings, Course } = require('../models');

// This file handles /robots.txt and /sitemap.xml at the server root

async function getSeo() {
  try { return await SeoSettings.findOne() || {}; } catch { return {}; }
}

async function robotsHandler(req, res) {
  const seo = await getSeo();
  const txt = seo.robotsTxt || `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${seo.siteUrl || 'https://yourdomain.com'}/sitemap.xml`;
  res.type('text/plain').send(txt);
}

async function sitemapHandler(req, res) {
  try {
    const seo = await getSeo();
    const base = (seo.siteUrl || 'https://pragni.com').replace(/\/$/, '');
    const courses = await Course.find({ isPublished: true }).select('slug updatedAt').lean();
    const now = new Date().toISOString();

    const staticPages = [
      { loc: '/', priority: '1.0', freq: 'daily' },
      { loc: '/courses', priority: '0.9', freq: 'daily' },
      { loc: '/workshops', priority: '0.8', freq: 'weekly' },
      { loc: '/trainers', priority: '0.7', freq: 'monthly' },
      { loc: '/about', priority: '0.6', freq: 'monthly' },
      { loc: '/contact', priority: '0.6', freq: 'monthly' },
    ];

    const urls = [
      ...staticPages.map(p => `  <url><loc>${base}${p.loc}</loc><lastmod>${now}</lastmod><changefreq>${p.freq}</changefreq><priority>${p.priority}</priority></url>`),
      ...courses.map(c => `  <url><loc>${base}/courses/${c.slug}</loc><lastmod>${new Date(c.updatedAt).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
    ];

    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`);
  } catch { res.status(500).type('application/xml').send('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>'); }
}

module.exports = { robotsHandler, sitemapHandler };
