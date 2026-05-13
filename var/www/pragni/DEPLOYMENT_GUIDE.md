# Pragni Tech — EC2/VPC Deployment & Resync Guide

## 1) Target Architecture

- **VPC** with:
  - Public subnet: App EC2 (Nginx + Node backend + React build)
  - Private subnet: MongoDB EC2 (no public IP)
- App EC2 connects to DB EC2 over private IP only.
- Public traffic enters via Nginx (HTTPS) and proxies API to backend.

## 2) Server Paths

- Project root: `/var/www/pragni`
- Backend: `/var/www/pragni/backend`
- Frontend: `/var/www/pragni/frontend`
- Nginx config source: `/var/www/pragni/nginx/app-ec2.conf`

## 3) First-Time Setup (App EC2)

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

Copy code to `/var/www/pragni`, then:

```bash
cd /var/www/pragni/backend
npm install
cp .env.example .env
# Fill .env (MONGO_URI, JWT secrets, ADMIN_SECRET_PATH, ALLOWED_ORIGINS, NODE_ENV=production)
npm run seed
pm2 start src/server.js --name pragni-backend
pm2 save
```

```bash
cd /var/www/pragni/frontend
npm install
# create/update .env:
# REACT_APP_API_URL=/api
# REACT_APP_ADMIN_PATH=<same as backend ADMIN_SECRET_PATH>
npm run build
```

```bash
sudo cp /var/www/pragni/nginx/app-ec2.conf /etc/nginx/sites-available/pragni
sudo ln -sf /etc/nginx/sites-available/pragni /etc/nginx/sites-enabled/pragni
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 4) First-Time Setup (DB EC2 — private only)

- Install MongoDB.
- Bind to private IP only.
- Enable auth and create app user/database.
- Allow inbound `27017` only from App EC2 security group.

## 5) Fast Resync / Redeploy (after code updates)

Run on App EC2:

```bash
cd /var/www/pragni/backend
git pull
npm install
pm2 restart pragni-backend

cd /var/www/pragni/frontend
git pull
npm install
npm run build

sudo nginx -t && sudo systemctl reload nginx
```

## 6) Post-Deploy Verification

- `https://yourdomain.com` loads.
- `https://yourdomain.com/services` loads.
- `https://yourdomain.com/api/health` returns `{ "status": "ok" }`.
- Admin panel path (`/<ADMIN_PATH>`) loads and login works.
- Site Content save works (no server error).
- Footer/nav brand reflects **Pragni Tech**.

## 7) Admin-Controlled Content (important)

From admin panel:

- **Site Content**
  - `brand_name`, `brand_tagline`
  - `footer_description`, `footer_tagline`
  - `services_*` keys for Services page content
- **Journey**, **Team**, **Banner**, **SEO**, **Contact**, **Categories**
  - verify CRUD and public reflection

## 8) Rollback (safe)

```bash
cd /var/www/pragni
git log --oneline -n 10
git checkout <known-good-commit>
cd backend && npm install && pm2 restart pragni-backend
cd ../frontend && npm install && npm run build
sudo nginx -t && sudo systemctl reload nginx
```

## 9) Ops Commands

```bash
pm2 status
pm2 logs pragni-backend
pm2 restart pragni-backend
sudo systemctl status nginx
```

---

For full architecture + ongoing management flows, see:
`deployment/MANAGEMENT_ARCHITECTURE_GUIDE.md`

