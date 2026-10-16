# Low-Cost Scaling Plan & Monthly Operating Cost Breakdown

This document presents the detailed cost breakdown and scaling roadmap for Nex LapTech.

---

## 1. Complete Monthly Operating Cost Breakdown

| Component | Provider & Plan | Specs / Limits | Cost / Month |
| :--- | :--- | :--- | :--- |
| **Compute VPS** | Hetzner CPX11 / DigitalOcean | 2GB RAM, 1 vCPU, 40GB NVMe | $6.00 |
| **Domain Name** | Cloudflare / Namecheap (.com) | SSL, WHOIS Privacy included | $0.83 ($10/yr) |
| **CDN & DNS** | Cloudflare Free Tier | Unlimited bandwidth & DDoS | $0.00 |
| **Database** | Supabase Free Tier | 500MB PostgreSQL DB | $0.00 |
| **Authentication** | Supabase Auth | Up to 50,000 MAU | $0.00 |
| **Cloud Storage** | Supabase Storage | 1GB Asset & File Storage | $0.00 |
| **SSL Certificate** | Let's Encrypt / Certbot | Auto-renewing HTTPS | $0.00 |
| **Monitoring** | UptimeRobot Free | 5-minute pings | $0.00 |
| **Total Cost** | | | **~$6.83 / Month** |

---

## 2. Low-Cost Scaling Roadmap

### Tier 1: 0 to 25,000 Monthly Active Users ($6.83 / Mo)
- Single VPS ($6/mo) with Next.js (Port 3000) & Express Backend API (Port 3001).
- Supabase Free Tier for Database & Storage.
- Cloudflare CDN edge caching for static JS/CSS and product images.

### Tier 2: 25,000 to 100,000 Monthly Active Users ($30 - $40 / Mo)
- Upgrade VPS to 4GB RAM / 2 vCPU ($12 - $15/mo).
- Upgrade Supabase to Pro Tier ($25/mo) for 8GB Database storage and automatic backups.

### Tier 3: 100,000+ Monthly Active Users ($80 - $150 / Mo)
- Split Frontend & Backend onto separate VPS instances.
- Add Redis Caching VPS ($10/mo) for session caching and rate limits.
