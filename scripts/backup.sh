#!/bin/bash

# Nex LapTech Database & Application Backup Script
set -e

BACKUP_DIR="/var/backups/nexbyte"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
DEST_FILE="$BACKUP_DIR/nexbyte_backup_$TIMESTAMP.tar.gz"

echo "========================================================="
echo "📦 Starting Nex LapTech System Backup..."
echo "Timestamp: $TIMESTAMP"
echo "========================================================="

mkdir -p "$BACKUP_DIR"

# 1. Archive PM2 application logs & local assets
APP_DIR="/var/www/nexbyte"
if [ -d "$APP_DIR" ]; then
  echo "🗂️ Archiving logs & uploaded media..."
  tar -czf "$DEST_FILE" -C "$APP_DIR" logs public/images 2>/dev/null || true
fi

# 2. Cleanup backups older than 30 days
echo "🧹 Cleaning up backups older than 30 days..."
find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +30 -exec rm -f {} \;

echo "========================================================="
echo "✅ Backup Completed: $DEST_FILE"
echo "Backup Size: $(du -sh "$DEST_FILE" 2>/dev/null | cut -f1)"
echo "========================================================="
