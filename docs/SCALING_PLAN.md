# NexLapTech - Enterprise Scaling Plan & Disaster Recovery Architecture

This document details the scaling roadmap and disaster recovery strategy for growing NexLapTech from initial launch to **10K**, **100K**, and **1M** active monthly users.

---

## 1. Architectural Scaling Milestones

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│     TIER 1: 10K USERS     │  ➜   │    TIER 2: 100K USERS     │  ➜   │     TIER 3: 1M USERS      │
│  Single VPS (4GB / 2vCPU) │      │  Dual VPS + Load Balancer │      │ K8s Cluster + Read Reps   │
│ Cloudflare CDN + Supabase │      │  Redis Cache + Cloudflare │      │ Global CDN + Elastic Storage│
└───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
```

### Phase 1: 10,000 Monthly Active Users (Baseline Production)
- **Infrastructure**: Single 4GB RAM / 2 vCPU Linux Cloud VPS.
- **Frontend**: Next.js SSR / Static Generation managed by PM2 on Port 3000.
- **Backend API**: Express server managed by PM2 on Port 3001.
- **Database**: Supabase Free/Pro Tier (Connection Pooling enabled).
- **Caching**: Cloudflare CDN Edge caching for images, CSS, and static JS bundles.
- **Estimated Cost**: $20 - $35 / month.

---

### Phase 2: 100,000 Monthly Active Users (High Concurrency Expansion)
- **Infrastructure**: 
  - Nginx Load Balancer VPS (Port 80/443).
  - 2x Application Worker VPS nodes running Next.js & Express API.
- **Caching Layer**: **Redis** cluster running on VPS for session store, API query caching, and rate limiting counter store.
- **Database**: Supabase Pro Tier with dedicated connection pooler (PGBouncer) handling 1,000 concurrent database connections.
- **Storage**: Supabase Storage / AWS S3 offloading product catalog images, PDFs, and invoices.
- **Estimated Cost**: $120 - $250 / month.

---

### Phase 3: 1,000,000 Monthly Active Users (Hyper-Scale Enterprise Cluster)
- **Infrastructure**: Containerized Docker microservices managed via Kubernetes (EKS / GKE) with Horizontal Pod Autoscaling (HPA).
- **Database Architecture**:
  - Primary Supabase PostgreSQL instance for write transactions.
  - Read-Replicas in multiple regions to handle heavy query loads.
- **CDN**: Multi-region Cloudflare Enterprise / AWS CloudFront distribution.
- **Async Queue**: RabbitMQ or AWS SQS handling transactional email dispatch, WhatsApp message dispatch, and PDF generation asynchronously.
- **Estimated Cost**: $800 - $2,500 / month.

---

## 2. Disaster Recovery Plan (DRP)

### Target Recovery Metrics
- **RPO (Recovery Point Objective)**: Max 1 hour data loss target.
- **RTO (Recovery Time Objective)**: Max 30 minutes total downtime target.

### Automated Backup Protocol
1. **Database Backups**:
   - Supabase Point-In-Time-Recovery (PITR) enabled.
   - Daily automated logical SQL dumps exported to secondary S3 bucket via `scripts/backup.sh`.
2. **Code & Environment**:
   - Git repository tagged per release.
   - One-click rollback via `scripts/rollback.sh`.
3. **Restoration Drills**:
   - Executed quarterly on staging environment to verify data integrity.

---

## 3. High Availability Checklist

- [x] PM2 process manager configured for auto-restart on memory leaks (`max_memory_restart: 1G`).
- [x] Nginx reverse proxy configured with health check bypass.
- [x] Express backend configured with graceful shutdown handlers (`SIGTERM`/`SIGINT`).
- [x] Cloudflare Security & DDoS protection enabled.
- [x] Automated database backup cron job active.
