# NEXLAPTECH
## Master UI/UX Design Bible & Enterprise Product Design Document (PDD)
### Section 1: Business Architecture, Business Models & User Journeys

***

## 1. Company Overview

**NexLapTech** is a leading technology solutions provider headquartered in Bengaluru, Karnataka. Specializing in high-performance custom gaming PCs, enterprise laptop sales, doorstep laptop and desktop repair services, Annual Maintenance Contracts (AMC), corporate networking, CCTV surveillance installations, and technical training programs for students and professionals.

- **Head Office Address:** #372, 1st Floor, MK Puttalingaiah Road, Uttarahalli Main Road, Padmanabhanagar, Bengaluru – 560070
- **Branch Offices:** Bengaluru (Head Office), Tumkur Branch (Upparahalli), Hiriyur Branch (Opening Soon)
- **Direct Support Phone:** +91 8088979706 / +91 8904760125
- **Official Email:** `nexbytetechnologies@gmail.com`
- **WhatsApp Channel:** `https://whatsapp.com/channel/0029Vb5jdLWL7UVVMBX23s2d`

***

## 2. Mission Statement

To deliver uncompromised, high-performance technology hardware, transparent doorstep repair services, and industrial-grade security solutions to businesses, gamers, and institutions, backed by 100% genuine components, rigorous quality testing, and instant real-time customer support.

***

## 3. Vision Statement

To become South India's most trusted and technologically advanced computer sales, repair, and technical training ecosystem—setting the benchmark for transparency, zero-downtime service execution, and real-time customer transparency.

***

## 4. Business & Platform Goals

1. **Seamless Lead Capture:** Enable customers to book hardware purchases, laptop repairs, and AMC consultations in under 60 seconds with automated Reference ID (`NB-2026-XXXXXX`) generation.
2. **Real-Time Transparency:** Provide end-to-end status visibility via a live progress timeline (`Submitted` -> `Contacted` -> `In Repair` -> `Completed`) and two-way live chat.
3. **Automated Enterprise Management:** Equipping NexLapTech administrators with a 21-module real-time Admin Console featuring Kanban lead management, stock alerts, invoice printing, and certificate verification.
4. **Zero-Downtime Reliability:** Ensuring 24/7 web app uptime via PM2 process management, Nginx reverse proxying, Cloudflare edge caching, and Supabase cloud infrastructure.

***

## 5. Target Customer Segments

- **Gaming Enthusiasts & Content Creators:** Seeking custom-built RTX 4070/4090 gaming desktops, high-refresh QHD monitors, mechanical RGB keyboards, and liquid cooling upgrades.
- **Corporate Offices & Businesses:** Requiring bulk business laptop supplies (Dell Latitude, ThinkPads), 1U rack servers, enterprise WiFi routing, and Annual Maintenance Contracts (AMC).
- **Retail Store Owners & Homeowners:** Seeking 4MP HD CCTV camera dome kits with smartphone remote preview and night vision installation.
- **Individual Laptop Owners & Students:** Requiring doorstep laptop screen replacement, motherboard chip-level repair, RAM/SSD upgrades, and certified IT training courses.

***

## 6. Business & Monetization Model

```
                                NexLapTech Revenue Streams
                                                 │
      ┌──────────────────┬───────────────────────┼───────────────────────┬──────────────────┐
      ▼                  ▼                       ▼                       ▼                  ▼
Hardware Sales    Doorstep Repairs        AMC Contracts          CCTV Systems      Tech Training
 (PCs / Laptops)   (Chip-level/OS)     (Corporate Retainers)   (Supply + Install)  (Certifications)
```

1. **Hardware Direct Sales:** Retail and wholesale margins on custom gaming PCs, certified pre-owned MacBooks, business laptops, and computer accessories.
2. **Repair & Maintenance Fees:** Labor and component fees for chip-level repair, screen replacements, SSD upgrades, and OS installations.
3. **Recurring AMC Contracts:** Annual maintenance subscriptions providing proactive IT upkeep for corporate desktop fleets.
4. **Security System Installations:** End-to-end turnkey pricing for CCTV camera supply, cabling, NVR setup, and remote mobile app configuration.
5. **Technical Training & IEEE Projects:** Course fees for hands-on web development, hardware engineering, and project mentorship.

***

## 7. Core Services Specification

- **Laptop Repair:** Board-level diagnostics, BGA chipset rework, screen/battery replacement, keyboard repair.
- **Desktop Repair & Custom PC Assembly:** RGB liquid-cooled gaming rigs, AI workstation servers, corporate micro-ATX builds.
- **Windows & Linux OS Installation:** Genuine OS installation, driver tuning, developer environment setup.
- **Corporate Networking & WiFi Solutions:** Structural LAN cabling, AX3000 WiFi 6 router installation, mesh extenders.
- **Annual Maintenance Contracts (AMC):** Scheduled preventive maintenance for corporate offices and educational labs.
- **Data Recovery Services:** Confidential data recovery from degraded HDDs, failed SSDs, and formatted flash drives.

***

## 8. Core Product Categories

1. `gaming_pcs`: Custom ROG Slayer rigs with Nvidia RTX GPUs and liquid cooling.
2. `business_laptops`: Dell Latitude, HP EliteBook, and Lenovo ThinkPad enterprise notebooks.
3. `premium_used_laptops`: Certified pre-owned MacBook Pros and grade-A refurbished laptops.
4. `servers`: 1U/2U enterprise rack servers with Dual Intel Xeon CPUs and ECC RAM.
5. `cctv`: 4MP HD dome & bullet IP cameras with NVR and remote app preview.
6. `accessories` & `storage`: NVMe SSDs, mechanical keyboards, gaming mice, and QHD monitors.

***

## 9. Customer Journey Map

```
[Phase 1: Discovery]
Customer lands on Homepage (/) via Google Search or Social Channel -> Views Trust Badges & Metrics.
          │
[Phase 2: Product & Service Selection]
Navigates to Products (/products) or Services (/services) -> Filters by Category or Budget -> Clicks "Book Now".
          │
[Phase 3: Booking Submission]
Unified Booking Modal opens -> Fills Name, Phone, City & Requirements -> Clicks "Submit Booking".
          │
[Phase 4: Instant Confirmation & Track]
Receives Ref ID NB-2026-XXXXXX -> Redirected to Live Track (/track) -> Realtime timeline renders.
          │
[Phase 5: Real-Time Updates & Service Execution]
Technician contacts customer -> Admin updates status to "In Service" -> Step 2 lights up -> Realtime notification sent.
          │
[Phase 6: Completion & Feedback]
Service completed -> Ref ID marked "Completed" -> Customer submits review on /reviews.
```

***

## 10. Administrator Journey Map

```
[Phase 1: Admin Session Auth]
Administrator logs into Admin Console (/admin/login) with credentials.
          │
[Phase 2: Overview & Audio Alert]
Admin lands on Overview Dashboard (/admin/dashboard) -> Audio chime rings on new incoming booking.
          │
[Phase 3: Lead Management in Kanban]
Navigates to Bookings Kanban (/admin/bookings) -> Sees new card in "Submitted" column.
          │
[Phase 4: Customer Contact & Status Mutation]
Admin clicks card -> Calls customer -> Drags card to "In Progress" -> Realtime event updates customer view.
          │
[Phase 5: Invoicing & Completion]
Admin generates PDF invoice -> Marks booking "Completed" -> System logs entry in Activity Feed.
```
