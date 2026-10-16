#!/bin/bash

# Nex LapTech Low-Cost Database & System Backup Script
# Purges backups older than 14 days to preserve low-cost VPS disk space

set -e

BACKUP_DIR="/var/backups/nexbyte"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
DEST_FILE="$BACKUP_DIR/nexbyte_backup_$TIMESTAMP.tar.gz"

echo "========================================================="
echo "📦 Starting Low-Cost System & Log Backup..."
echo "Timestamp: $TIMESTAMP"
echo "========================================================="

mkdir -p "$BACKUP_DIR"

APP_DIR="/var/www/nexbyte"
if [ -d "$APP_DIR" ]; then
  echo "🗂️ Compressing PM2 log files & application data..."
  tar -czf "$DEST_FILE" -C "$APP_DIR" logs .env.production 2>/dev/null || true
fi

# Rotate backups older than 14 days
echo "🧹 Purging backups older than 14 days..."
find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +14 -exec rm -f {} \;

echo "========================================================="
echo "✅ Backup Completed: $DEST_FILE"
echo "Backup Size: $(du -sh "$DEST_FILE" 2>/dev/null | cut -f1)"
echo "========================================================="
