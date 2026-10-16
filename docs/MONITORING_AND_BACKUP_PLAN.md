# Nex LapTech - Monitoring, Backup & Disaster Recovery Plan

This document outlines the free monitoring strategy, automated backup retention, and disaster recovery protocol.

---

## 1. Zero-Cost Monitoring Architecture

### Free Uptime Pings (UptimeRobot / Better Stack Free)
- **Monitored Endpoint 1**: `https://www.nexbyte.com` (Ping frequency: 5 minutes)
- **Monitored Endpoint 2**: `https://api.nexbyte.com/health` (Ping frequency: 5 minutes)
- **Alert Channel**: Instant Email & Discord / Telegram Bot notification on downtime or 5xx status.

### PM2 Process Monitoring
```bash
# Check running process status, memory, and CPU usage
pm2 status

# Tail real-time application logs
pm2 logs nexbyte-backend
pm2 logs nexbyte-frontend
```

---

## 2. Automated Backup Strategy

### Schedule & Execution
- Executed automatically via daily cron job:
  ```bash
  0 2 * * * /var/www/nexbyte/scripts/lowcost-backup.sh >> /var/log/nexbyte-backup.log 2>&1
  ```
- **Backup Location**: `/var/backups/nexbyte/`
- **Retention Policy**: Backups older than 14 days are automatically purged to prevent filling up VPS storage.
- **Supabase Cloud Backups**: Database snapshots stored securely on Supabase cloud.

---

## 3. Disaster Recovery Checklist (DRC)

- [x] **RPO (Recovery Point Objective)**: Max 24 hours.
- [x] **RTO (Recovery Time Objective)**: Max 15 minutes.
- [x] **Reboot Self-Healing**: PM2 `systemd` integration auto-restarts Next.js and Express processes on VPS reboot.
- [x] **SSL Auto-Renewal**: Certbot systemd timer automatically renews Let's Encrypt certificates every 60 days.
- [x] **One-Command Redeploy**: Execute `./scripts/lowcost-deploy.sh` to redeploy or recover clean state.
