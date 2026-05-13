# ================================================================
#  PRAGNI PLATFORM — COMPLETE AWS DEPLOYMENT GUIDE
#  2 EC2 Instances + VPC + MongoDB + Nginx + SSL
# ================================================================

## ARCHITECTURE OVERVIEW
────────────────────────────────────────────────────────────────
  Internet
     │
     ▼
  [Elastic IP / Route53]
     │
     ▼
  ┌──────────────────────────────────┐
  │  PUBLIC SUBNET (VPC)             │
  │  ┌─────────────────────────┐     │
  │  │  EC2 #1 — App Server    │     │  ← yourdomain.com (port 443)
  │  │  Ubuntu 22.04           │     │
  │  │  Nginx + Node.js        │     │
  │  │  React build            │     │
  │  └─────────┬───────────────┘     │
  │            │ Private IP only      │
  │            ▼                      │
  │  ┌─────────────────────────┐     │
  │  │  EC2 #2 — DB Server     │     │  ← Internal only, NO public IP
  │  │  Ubuntu 22.04           │     │
  │  │  MongoDB 7.x            │     │
  │  └─────────────────────────┘     │
  └──────────────────────────────────┘
────────────────────────────────────────────────────────────────

## STEP 1: CREATE VPC & NETWORK

1. Go to AWS Console → VPC → Create VPC
   - Name: pragni-vpc
   - IPv4 CIDR: 10.0.0.0/16
   - Click "Create VPC"

2. Create Subnets:
   - Public subnet:  10.0.1.0/24  (for App EC2)
   - Private subnet: 10.0.2.0/24  (for DB EC2)

3. Create Internet Gateway:
   - Name: pragni-igw
   - Attach to pragni-vpc

4. Route Tables:
   - Public route table: add route 0.0.0.0/0 → pragni-igw
   - Associate public subnet with public route table

## STEP 2: SECURITY GROUPS

### SG #1: pragni-app-sg (for App EC2)
  Inbound:
    - Port 22   (SSH)   — Source: YOUR IP only  (e.g. 1.2.3.4/32)
    - Port 80   (HTTP)  — Source: 0.0.0.0/0
    - Port 443  (HTTPS) — Source: 0.0.0.0/0
  Outbound:
    - All traffic — 0.0.0.0/0

### SG #2: pragni-db-sg (for DB EC2)
  Inbound:
    - Port 22    (SSH)     — Source: pragni-app-sg (sg-xxxxxxxx)
    - Port 27017 (MongoDB) — Source: pragni-app-sg ONLY
  Outbound:
    - All traffic — 0.0.0.0/0
  ⚠️  DB EC2 gets NO public IP — only private IP in VPC

## STEP 3: LAUNCH EC2 INSTANCES

### App EC2 (#1 — Public):
  - AMI: Ubuntu Server 22.04 LTS
  - Instance type: t3.small (min) or t3.medium (recommended)
  - VPC: pragni-vpc, Subnet: public-subnet
  - Auto-assign public IP: ENABLE
  - Security Group: pragni-app-sg
  - Storage: 20 GB gp3
  - Key pair: pragni-key.pem (save this!)

### DB EC2 (#2 — Private):
  - AMI: Ubuntu Server 22.04 LTS
  - Instance type: t3.small
  - VPC: pragni-vpc, Subnet: private-subnet
  - Auto-assign public IP: DISABLE ← Important!
  - Security Group: pragni-db-sg
  - Storage: 30 GB gp3
  - Key pair: same pragni-key.pem

## STEP 4: SET UP DB EC2 (MongoDB)

# SSH into App EC2 first, then jump to DB EC2 via private IP:
ssh -i pragni-key.pem ubuntu@<APP_EC2_PUBLIC_IP>
ssh -i pragni-key.pem ubuntu@<DB_EC2_PRIVATE_IP>  # from inside App EC2

# --- ON DB EC2 ---
# Install MongoDB 7
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org

# Configure MongoDB to bind to private IP only
sudo nano /etc/mongod.conf
# Change:
#   net:
#     bindIp: 0.0.0.0   ← CHANGE TO private IP
#     bindIp: 10.0.2.X  ← DB EC2 private IP

sudo systemctl enable mongod
sudo systemctl start mongod

# Create MongoDB user
mongosh
use pragni
db.createUser({
  user: "pragni_user",
  pwd: "STRONG_RANDOM_PASSWORD",
  roles: [{ role: "readWrite", db: "pragni" }]
})
exit

# Enable MongoDB auth
sudo nano /etc/mongod.conf
# Add under security:
#   security:
#     authorization: enabled

sudo systemctl restart mongod

## STEP 5: SET UP APP EC2 (Node.js + Nginx)

# --- ON APP EC2 ---
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone / upload your code
cd /var/www
sudo mkdir pragni && sudo chown ubuntu:ubuntu pragni
cd pragni

# Upload your code (from your local machine):
# scp -i pragni-key.pem -r ./pragni/* ubuntu@<APP_EC2_IP>:/var/www/pragni/

# --- Backend setup ---
cd /var/www/pragni/backend
npm install

# Create .env file (copy from .env.example and fill in values)
cp .env.example .env
nano .env
# Fill in:
#   MONGO_URI=mongodb://pragni_user:PASSWORD@10.0.2.X:27017/pragni
#   JWT_SECRET=<generate: openssl rand -hex 64>
#   JWT_ADMIN_SECRET=<generate: openssl rand -hex 64>
#   ADMIN_SECRET_PATH=<generate: openssl rand -hex 8>
#   VIDEO_SALT_KEY=<generate: openssl rand -hex 16>
#   DRIVE_SALT_KEY=<generate: openssl rand -hex 16>
#   ALLOWED_ORIGINS=https://yourdomain.com
#   NODE_ENV=production

# Seed the admin user
npm run seed

# Start with PM2
pm2 start src/server.js --name pragni-backend
pm2 startup && pm2 save

# --- Frontend build ---
cd /var/www/pragni/frontend
npm install

# Create .env file
cat > .env << 'EOF'
REACT_APP_API_URL=/api
REACT_APP_ADMIN_PATH=SAME_VALUE_AS_BACKEND_ADMIN_SECRET_PATH
EOF

npm run build

# --- Nginx setup ---
sudo cp /var/www/pragni/nginx/app-ec2.conf /etc/nginx/sites-available/pragni
sudo nano /etc/nginx/sites-available/pragni
# Replace yourdomain.com with your actual domain

sudo ln -s /etc/nginx/sites-available/pragni /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Important: keep the repo's current rate-limit values.
# Older low limits can make normal homepage/admin API bursts return 503 from Nginx.

# --- SSL Certificate ---
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Follow prompts — certbot auto-configures Nginx for HTTPS

# Auto-renew SSL
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

## STEP 6: DOMAIN / DNS

In your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):
  - A record: @  → <APP_EC2_PUBLIC_IP>
  - A record: www → <APP_EC2_PUBLIC_IP>
  (Or use AWS Route 53 Hosted Zone)

Optionally assign an AWS Elastic IP to App EC2 so the IP never changes.

## STEP 7: VERIFY

□ https://yourdomain.com               → Public site loads
□ https://yourdomain.com/api/courses   → Returns JSON
□ https://yourdomain.com/api/health    → {"status":"ok"}
□ https://yourdomain.com/<ADMIN_PATH>  → Admin login screen
□ DB EC2 has NO public IP, only accessible via VPC
□ pm2 status → shows pragni-backend as "online"

## STEP 8: FIRST LOGIN

1. Open: https://yourdomain.com/<YOUR_ADMIN_SECRET_PATH>
2. Email:    admin@pragni.com
3. Password: ChangeThis@Admin123!
4. Go to Settings → Change password IMMEDIATELY

## MAINTENANCE COMMANDS

# Restart backend
pm2 restart pragni-backend

# View backend logs
pm2 logs pragni-backend

# Deploy updates
cd /var/www/pragni/backend && git pull && pm2 restart pragni-backend
cd /var/www/pragni/frontend && git pull && npm run build

# MongoDB backup
mongodump --uri="mongodb://pragni_user:PASSWORD@10.0.2.X:27017/pragni" --out=/backup/

## COST ESTIMATE (ap-south-1 Mumbai region)

  2x t3.small EC2:  ~$15/month
  30 GB EBS:        ~$3/month
  Data transfer:    ~$1-5/month
  Route 53:         ~$0.50/month
  SSL:              FREE (Let's Encrypt)
  ─────────────────────────────────
  Total:            ~$20-25/month
  
  For t3.micro (free tier): $0 for first 12 months

## SECURITY CHECKLIST

□ Admin path is a random hex string (not "admin", "dashboard", etc.)
□ SSH access restricted to YOUR IP only in security group
□ DB EC2 has no public IP
□ All secrets in .env, never committed to git
□ .gitignore includes .env
□ MongoDB has authentication enabled
□ Nginx hides version (server_tokens off)
□ HTTPS enforced with HSTS
□ Rate limiting on API endpoints
□ YouTube IDs encrypted at rest (AES-256-GCM)
□ Resource URLs encrypted at rest
□ Video stream tokens expire after 4 hours
□ All comments require approval before display
□ Admin panel accessible ONLY via secret path
