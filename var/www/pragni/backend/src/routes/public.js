// Public routes for SEO, sitemap, robots.txt, contact info, categories, banner
const router = require('express').Router();
const { SeoSettings, ContactSettings, Banner, Category, Course, Workshop, Bundle } = require('../models');

// ── robots.txt (served from backend, nginx should proxy /robots.txt here) ──
router.get('/robots.txt', async (req, res) => {
  try {
    const seo = await SeoSettings.findOne();
    const txt = seo?.robotsTxt || 'User-agent: *\nAllow: /\nDisallow: /api/\n';
    res.type('text/plain').send(txt);
  } catch { res.type('text/plain').send('User-agent: *\nAllow: /\n'); }
});

// ── sitemap.xml ────────────────────────────────────────────────────────────
router.get('/sitemap.xml', async (req, res) => {
  try {
    const seo = await SeoSettings.findOne();
    const base = (seo?.siteUrl || 'https://pragni.com').replace(/\/$/, '');

    const courses = await Course.find({ isPublished: true }).select('slug updatedAt').lean();
    const workshops = await Workshop.find({ isActive: true }).select('_id updatedAt').lean();

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
      ...staticPages.map(p => `
  <url>
    <loc>${base}${p.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
      ...courses.map(c => `
  <url>
    <loc>${base}/courses/${c.slug}</loc>
    <lastmod>${new Date(c.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

    res.type('application/xml').send(xml);
  } catch (err) {
    res.status(500).type('application/xml').send('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
  }
});

// ── SEO meta (for React Helmet injection) ─────────────────────────────────
router.get('/seo', async (req, res) => {
  try {
    let seo = await SeoSettings.findOne();
    if (!seo) seo = new SeoSettings();
    res.json({ success: true, seo });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ── Contact info ───────────────────────────────────────────────────────────
router.get('/contact', async (req, res) => {
  try {
    let contact = await ContactSettings.findOne();
    if (!contact) contact = new ContactSettings();
    res.json({ success: true, contact });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ── Active banner ──────────────────────────────────────────────────────────
router.get('/banner/active', async (req, res) => {
  try {
    const banner = await Banner.findOne({ isActive: true });
    res.json({ success: true, banner: banner || null });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ── Public categories ──────────────────────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const cats = await Category.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, categories: cats });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ── Public active bundles ──────────────────────────────────────────────────
router.get('/bundles', async (req, res) => {
  try {
    const bundles = await Bundle.find({ isActive: true })
      .populate('courses', 'title price thumbnail slug level')
      .sort({ isFeatured: -1, createdAt: -1 });
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, bundles });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
