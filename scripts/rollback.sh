#!/bin/bash

# Nex LapTech One-Click Rollback Script
set -e

echo "========================================================="
echo "⚠️ Starting Emergency Rollback to Previous Revision..."
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================================="

APP_DIR="/var/www/nexbyte"
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR"
fi

# 1. Rollback git commit by 1 revision
echo "⏪ Rolling back to previous Git commit (HEAD~1)..."
git reset --hard HEAD~1

# 2. Re-install dependencies
echo "📦 Re-synchronizing dependencies..."
npm ci --only=production
if [ -d "./server" ]; then
  cd ./server && npm ci --only=production && cd ..
fi

# 3. Rebuild Next.js
echo "🏗️ Rebuilding previous Next.js production bundle..."
npm run build

# 4. Reload PM2
echo "🔄 Reloading PM2 processes..."
pm2 reload ecosystem.config.js --env production --update-env

echo "========================================================="
echo "✅ Rollback Completed Successfully!"
echo "Current Revision: $(git log -1 --oneline)"
echo "========================================================="
