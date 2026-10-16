# NEXLAPTECH
## Master UI/UX Design Bible & Enterprise Product Design Document (PDD)
### Section 7 & 8: Workflows & System Architecture

***

## 1. Complete Business Workflows

### 1. Product & Service Booking Flowchart
```
Customer Book Form -> Generated Ref ID NB-2026-XXXXXX -> Admin Kanban Alert + Audio Chime -> Status Changed to "In Progress" -> Customer Timeline Advances -> Completion & Invoicing
```

### 2. Review Moderation Flowchart
```
Customer Submits Review (/reviews) -> Status set to "Pending" -> Admin Review Feed Alert -> Admin Clicks "Approve" -> Status set to "Approved" -> Review Renders Publicly on Homepage & Reviews Page
```

### 3. Certificate Issuance & QR Verification Flowchart
```
Student Application -> Document Upload -> Admin Review -> Approval -> PDF Render -> QR Code -> Supabase Storage Upload -> Customer Portal Download -> Online Verification (/verify)
```

***

## 2. Master System Architecture Topology

```
                                 Client Request
                                       │
                                       ▼
                           Cloudflare Free Edge Proxy
                         (DNS + Free SSL + CDN + WAF)
                                       │
                   ┌───────────────────┴───────────────────┐
                   │                                       │
                   ▼                                       ▼
        https://www.nexbyte.com                 https://api.nexbyte.com
        (Next.js Frontend App)                  (Express Backend API)
                   │                                       │
                   └───────────────────┬───────────────────┘
                                       │
                                       ▼
                           Nginx Reverse Proxy (VPS)
                              (Ports 80/443)
                                       │
                   ┌───────────────────┴───────────────────┐
                   │                                       │
                   ▼                                       ▼
         Next.js Frontend App                   Express Backend API
            (Port 3000)                             (Port 3001)
         [PM2: nexbyte-fe]                       [PM2: nexbyte-be]
                   │                                       │
                   └───────────────────┬───────────────────┘
                                       │
                                       ▼
                            Supabase Cloud Instance
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
        ▼                              ▼                              ▼
 PostgreSQL Database           Supabase Storage               Supabase Realtime
(Tables, Auth & RLS)          (nexbyte-assets)               (SSE / WebSockets)
```
