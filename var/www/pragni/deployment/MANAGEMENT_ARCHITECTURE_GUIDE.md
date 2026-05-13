# Pragni Tech — Management & Architecture Guide

## Architecture (Production)

### Network
- VPC
  - Public subnet: App EC2
  - Private subnet: DB EC2 (MongoDB, no public IP)
- Security groups:
  - App SG: 22 (restricted), 80, 443
  - DB SG: 27017 only from App SG

### Runtime Components
- **Nginx**: TLS termination + static build + reverse proxy `/api/*`
- **Node/Express backend**: API + admin routes + public routes
- **MongoDB**: content, users, SEO, categories, banner, journey, team, site content
- **React frontend**: public pages + hidden admin panel route

## Application Content Control Model

### Fully admin-managed content blocks
- Site Content (`/api/<ADMIN_PATH>/site-content`)
  - Brand text
  - Hero text/stats
  - Mission text
  - Footer text
  - Services page text/cards/CTA/background URL
- Banner, Categories, Journey, Team, SEO, Contact, Trainers, Courses, Workshops

### Public read endpoints
- `/api/site-content`
- `/api/banner/active`
- `/api/categories/public`
- `/api/journey`
- `/api/team`
- `/api/seo/meta`
- `/api/contact/public`

## New Services Page (Redesign Scope)

- Public route: `/services`
- Glassmorphism UI with layered background
- Content driven from admin keys:
  - `services_background_image`
  - `services_eyebrow`, `services_title`, `services_subtitle`
  - `services_cards_json` (optional)
  - `services_card_1_title/text` ... `services_card_12_title/text`
  - `services_cta_title`, `services_cta_text`
  - `services_cta_primary_label/url`
  - `services_cta_secondary_label/url`

## Branding Standard

- Default brand: **Pragni Tech**
- Update through Site Content:
  - `brand_name`
  - `brand_tagline`
  - `footer_description`
  - `footer_tagline`

## Change Management Workflow

1. Update content from admin panel whenever possible (no deploy needed).
2. For code updates:
   - Deploy backend, restart PM2.
   - Build frontend.
   - Reload Nginx.
3. Verify health + critical routes.
4. Record version/tag and keep rollback commit handy.

## QA / Regression Checklist

- Public routes: `/`, `/courses`, `/services`, `/workshops`, `/trainers`, `/about`, `/contact`
- Admin routes load and save:
  - Site Content, Banner, Categories, SEO, Contact, Journey, Team
- `Site Content` save succeeds and reflects instantly.
- `sitemap.xml` includes `/services`.
- Security basics:
  - admin path hidden/random
  - no DB public access
  - HTTPS valid

## Troubleshooting

### Admin Site Content save fails
- Check backend logs:
  - `pm2 logs pragni-backend`
- Ensure backend is up and DB reachable.

### Public page not updating after admin save
- Hard refresh browser
- Confirm endpoint returns fresh content:
  - `curl -s https://yourdomain.com/api/site-content`

### Nginx 502/503
- `sudo nginx -t`
- check upstream backend port and PM2 status

### Build failure
- run from `/var/www/pragni/frontend`:
  - `npm install`
  - `npm run build`

## Backup & Recovery

- Mongo backup:
  - `mongodump --uri="mongodb://<user>:<pass>@<private-ip>:27017/pragni" --out=/backup/`
- App code backup:
  - Git + tagged release before production deploy.

