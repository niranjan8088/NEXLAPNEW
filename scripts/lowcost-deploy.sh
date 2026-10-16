#!/bin/bash

# Nex LapTech Low-Cost VPS Deployment Script
set -e

echo "========================================================="
echo "🚀 Starting Nex LapTech Low-Cost Production Deployment..."
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================================="

# 1. Move to app directory
APP_DIR="/var/www/nexbyte"
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR"
fi

# 2. Pull latest code from production branch
echo "📥 Fetching latest code from git production branch..."
git fetch origin production
git checkout production
git pull origin production

# 3. Install production dependencies
echo "📦 Installing npm production dependencies..."
npm ci --only=production
if [ -d "./server" ]; then
  cd ./server && npm ci --only=production && cd ..
fi

# 4. Build Next.js frontend
echo "🏗️ Building Next.js production bundle..."
npm run build

# 5. Create logs directory
mkdir -p ./logs

# 6. PM2 Zero-Downtime Reload
echo "🔄 Reloading PM2 processes (nexbyte-frontend & nexbyte-backend)..."
pm2 reload ecosystem.config.js --env production --update-env || pm2 start ecosystem.config.js --env production
pm2 save

# 7. Reload Nginx configuration
echo "🌐 Verifying & reloading Nginx dual-subdomain configuration..."
sudo nginx -t && sudo systemctl reload nginx

echo "========================================================="
echo "✅ Nex LapTech Deployment Succeeded!"
echo "Frontend: https://www.nexbyte.com"
echo "Backend:  https://api.nexbyte.com/health"
echo "========================================================="
