# Pragni Patch — Deployment Guide

## What Changed

### NEW Backend Files
- `backend/src/models/index.js` — Added: SeoSettings, ContactSettings, Banner, Category schemas
- `backend/src/routes/admin.js` — Added: SEO, Contact, Banner, Categories CRUD routes at bottom
- `backend/src/routes/public.js` — NEW: Public API routes (contact info, categories, active banner)
- `backend/src/routes/seo_static.js` — NEW: robots.txt + sitemap.xml generators
- `backend/src/server.js` — Added: public route registration + robots.txt / sitemap.xml endpoints

### NEW Frontend Files
- `frontend/src/admin/pages/SeoAdmin.js` — Full SEO management panel
- `frontend/src/admin/pages/ContactAdmin.js` — Contact info + social media management
- `frontend/src/admin/pages/BannerAdmin.js` — Homepage banner management
- `frontend/src/admin/pages/CategoriesAdmin.js` — Course categories management

### UPDATED Frontend Files
- `frontend/src/admin/AdminApp.js` — Added routes: /seo /contact /banner /categories
- `frontend/src/admin/AdminLayout.js` — Added sidebar links for new pages
- `frontend/src/components/Footer.js` — Dynamic social + categories from DB
- `frontend/src/components/Navbar.js` — Added Contact link; removed dark/light toggle
- `frontend/src/context/ThemeContext.js` — Always dark mode only
- `frontend/src/App.js` — Added /contact route
- `frontend/src/pages/Contact.js` — NEW Contact Us page
- `frontend/public/index.html` — Full SEO meta, OG tags, JSON-LD schema

## Deployment Steps

### 1. Copy files to server
```bash
# From your local machine or the server
rsync -av pragni_patch/ /var/www/pragni/
```

### 2. Restart backend
```bash
cd /var/www/pragni
pm2 restart ecosystem.config.js
```

### 3. Rebuild frontend
```bash
cd /var/www/pragni/frontend
npm install   # if needed
npm run build
```

### 4. Configure SEO from Admin Panel
- Go to: https://yoursite.com/<ADMIN_PATH>/seo
- Set your Site URL (e.g. https://pragni.com)
- Set default title, description, keywords
- Set OG image URL
- Configure robots.txt
- Go to Contact & Social tab — add your social links
- Submit https://yoursite.com/sitemap.xml to Google Search Console

### 4.1 Important Nginx rate-limit note
- Use the repository `nginx/app-ec2.conf` with the updated API rate limits.
- Older values were strict enough to make normal homepage/admin loads return **503** from Nginx when several API calls fired together.
- After updating the file, run:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Submit to Google Search Console
1. Visit https://search.google.com/search-console
2. Add your domain property
3. Choose "HTML tag" verification
4. Copy the content="" value
5. Paste it in Admin → SEO → Verification tab
6. Submit sitemap: https://yoursite.com/sitemap.xml

## New API Endpoints

### Public (no auth)
- GET /api/public/contact — contact info & social links
- GET /api/public/categories — active categories
- GET /api/public/banner/active — active homepage banner
- GET /robots.txt — auto-generated robots.txt
- GET /sitemap.xml — auto-generated sitemap

### Admin (JWT required)
- GET/PUT /api/<ADMIN_PATH>/seo — SEO settings
- GET/PUT /api/<ADMIN_PATH>/contact — contact & social settings
- GET/POST/PUT/DELETE /api/<ADMIN_PATH>/banner/:id — banners
- GET/POST/PUT/DELETE /api/<ADMIN_PATH>/categories/:id — categories

## Admin Panel New Sections
- 📢 Banner — manage homepage top banners
- 🗂️ Categories — manage course categories (replaces hardcoded list)
- 📞 Contact & Social — email, phone, address, all social links
- 🔍 SEO Manager — title, description, keywords, robots.txt, sitemap, schema, verification
