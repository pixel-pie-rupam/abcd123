require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'", "'unsafe-inline'", "https://www.youtube-nocookie.com", "https://s.ytimg.com"],
      styleSrc:       ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:        ["'self'", "https://fonts.gstatic.com"],
      imgSrc:         ["'self'", "data:", "https:", "http:"],
      connectSrc:     ["'self'"],
      frameSrc:       ["https://www.youtube-nocookie.com", "https://www.youtube.com"],
      mediaSrc:       ["https://www.youtube-nocookie.com", "https://*.googlevideo.com"],
      frameAncestors: ["'self'"],
    }
  },
  // ALL of these must be false — they cause Origin-Agent-Cluster conflicts on HTTP
  crossOriginOpenerPolicy:   false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  originAgentCluster:        false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.MAX_REQUESTS_PER_15MIN) || 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many admin requests.' }
});

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

app.use('/api/courses',   require('./routes/courses'));
app.use('/api/videos',    require('./routes/videos'));
app.use('/api/workshops', require('./routes/workshops'));
app.use('/api/comments',  require('./routes/comments'));
app.use('/api/trainers',  require('./routes/trainers'));
app.use('/api/enrollments', require('./routes/enrollments'));

// ── No-cache middleware for dynamic public API routes ─────────────────────────
// Prevents browser/proxy from serving stale banner/logo/seo data after admin saves
app.use(['/api/banner', '/api/settings/logo', '/api/seo/meta', '/api/contact/public', '/api/categories'], (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Public data routes (categories + banner) – accessible without admin path
const { Category, Banner, Seo, Contact, Course, ContactMessage } = require('./models');
app.get('/api/categories/public', async (req, res) => {
  try {
    const cats = await Category.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, categories: cats });
  } catch { res.status(500).json({ error: 'Server error' }); }
});
app.get('/api/banner/active', async (req, res) => {
  try {
    const banner = await Banner.findOne({ isActive: true });
    res.json({ success: true, banner: banner || null });
  } catch { res.status(500).json({ error: 'Server error' }); }
});
app.get('/api/settings/logo', async (req, res) => {
  try {
    const { Settings } = require('./models');
    const setting = await Settings.findOne({ key: 'logoUrl' });
    res.json({ success: true, logoUrl: setting ? setting.value : '' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ── Public SEO meta endpoint ──────────────────────────────────────────────
app.get('/api/seo/meta', async (req, res) => {
  try {
    const seo = await Seo.findOne() || {};
    res.json({ success: true, seo });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ── Public contact/social endpoint ────────────────────────────────────────
app.get('/api/contact/public', async (req, res) => {
  try {
    const contact = await Contact.findOne() || {};
    res.json({ success: true, contact });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ── robots.txt ────────────────────────────────────────────────────────────
app.get('/robots.txt', async (req, res) => {
  try {
    const seo = await Seo.findOne();
    const txt = seo?.robotsTxt ||
      'User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ' +
      (seo?.canonicalUrl || (req.protocol + '://' + req.get('host'))) + '/sitemap.xml';
    res.type('text/plain').send(txt);
  } catch { res.type('text/plain').send('User-agent: *\nAllow: /'); }
});

// ── sitemap.xml ───────────────────────────────────────────────────────────
app.get('/sitemap.xml', async (req, res) => {
  try {
    const seo    = await Seo.findOne();
    const base   = seo?.canonicalUrl || (req.protocol + '://' + req.get('host'));
    const courses = await Course.find({ isPublished: true, isComing: false }, 'slug updatedAt');

    const staticPages = ['', '/courses', '/workshops', '/trainers', '/about', '/contact'];
    const now = new Date().toISOString();

    const urls = [
      ...staticPages.map(p => `
  <url>
    <loc>${base}${p}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${p === '' ? '1.0' : '0.8'}</priority>
  </url>`),
      ...courses.map(c => `
  <url>
    <loc>${base}/courses/${c.slug}</loc>
    <lastmod>${(c.updatedAt || new Date()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`),
    ];

    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.join('') +
      '\n</urlset>';

    res.type('application/xml').send(xml);
  } catch (e) {
    res.status(500).type('text/plain').send('Sitemap error');
  }
});


// ── Public journey slides ─────────────────────────────────────────────────────
app.get('/api/journey', async (req, res) => {
  try {
    const { JourneySlide } = require('./models');
    const slides = await JourneySlide.find({ isActive: true }).sort({ order: 1 });
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, slides });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ── Public team members ───────────────────────────────────────────────────────
app.get('/api/team', async (req, res) => {
  try {
    const { TeamMember } = require('./models');
    const members = await TeamMember.find({ showOnAboutPage: true }).sort({ order: 1 });
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, members });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ── Public site content ───────────────────────────────────────────────────────
app.get('/api/site-content', async (req, res) => {
  try {
    const { SiteContent } = require('./models');
    const items = await SiteContent.find();
    const obj = {};
    items.forEach(i => { obj[i.key] = i.value; });
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, content: obj });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ── Public active bundles ─────────────────────────────────────────────────────
app.get('/api/bundles', async (req, res) => {
  try {
    const { Bundle } = require('./models');
    const bundles = await Bundle.find({ isActive: true })
      .populate('courses', 'title price thumbnail slug level')
      .sort({ isFeatured: -1, createdAt: -1 });
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, bundles });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ── Public coupon validation ──────────────────────────────────────────────────
app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { Coupon } = require('./models');
    const code = (req.body.code || '').toString().trim().toUpperCase().slice(0, 50);
    if (!code) return res.status(400).json({ error: 'Coupon code required' });
    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return res.status(400).json({ error: 'Coupon has expired' });
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'Coupon usage limit reached' });
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, description: coupon.description } });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ── Contact form submission (Fix #2 — stored in DB for admin portal) ────────
app.post('/api/contact/submit', async (req, res) => {
  try {
    const { ContactMessage } = require('./models');
    const name    = (req.body.name    || '').toString().trim().slice(0, 100);
    const email   = (req.body.email   || '').toString().trim().toLowerCase().slice(0, 200);
    const message = (req.body.message || '').toString().trim().slice(0, 3000);
    if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
    await ContactMessage.create({ name, email, message });
    console.log('[Contact Form]', { name, email, message: message.slice(0,100) });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});


const adminPath = process.env.ADMIN_SECRET_PATH;
if (!adminPath || adminPath.length < 8) {
  console.error('FATAL: ADMIN_SECRET_PATH not set or too short. Exiting.');
  process.exit(1);
}
app.use(`/api/${adminPath}`, require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
  });
}

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
  console.log('Admin API: /api/' + adminPath);
});

module.exports = app;
