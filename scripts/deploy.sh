#!/bin/bash

# Nex LapTech Zero-Downtime Production Deployment Script
# Target: Cloud VPS (Ubuntu/Debian) running PM2 & Nginx

set -e

echo "========================================================="
echo "🚀 Starting Nex LapTech Production Deployment..."
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================================="

# 1. Navigate to project root directory
APP_DIR="/var/www/nexbyte"
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR"
fi

# 2. Fetch latest changes from GitHub production branch
echo "📥 Pulling latest code from git production branch..."
git fetch origin production
git checkout production
git pull origin production

# 3. Install dependencies
echo "📦 Installing frontend & backend dependencies..."
npm ci --only=production
if [ -d "./server" ]; then
  cd ./server && npm ci --only=production && cd ..
fi

# 4. Build Next.js Frontend
echo "🏗️ Building Next.js production bundle..."
npm run build

# 5. Create log directories if missing
mkdir -p ./logs

# 6. PM2 Zero-Downtime Reload
echo "🔄 Reloading PM2 processes (Zero-Downtime)..."
if command -v pm2 &> /dev/null; then
  pm2 reload ecosystem.config.js --env production --update-env || pm2 start ecosystem.config.js --env production
  pm2 save
else
  echo "⚠️ PM2 not found in PATH. Skipping PM2 reload."
fi

# 7. Reload Nginx configuration
echo "🌐 Verifying & reloading Nginx..."
if command -v nginx &> /dev/null; then
  sudo nginx -t && sudo systemctl reload nginx
fi

echo "========================================================="
echo "✅ Nex LapTech Deployment Completed Successfully!"
echo "Health Check: http://localhost:3001/health"
echo "========================================================="
