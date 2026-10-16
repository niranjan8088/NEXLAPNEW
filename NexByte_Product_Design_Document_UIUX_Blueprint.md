# NEX LAPTECH
## Master Product Design Document (PDD) & UI/UX Architecture Blueprint

***

### Document Control & Design Metadata
- **Document Title:** Master Product Design Document (PDD) & UI/UX Blueprint
- **Project Name:** Nex LapTech Enterprise Platform
- **Version:** v2.0 Production Release
- **Design System:** Deep Space Dark Mode System (Glassmorphic + HSL Neon Accents)
- **Target Devices:** Ultra-wide Desktop (1440px+), Laptop (1024px), Tablet (768px), Mobile (375px)
- **Primary Color Palette:** `#0B1120` (Ink), `#0E1626` (Navy), `#1E5EFF` (Royal Blue), `#00D8F6` (Cyan Accent)
- **Typography:** Inter & Outfit Sans-serif via Google Fonts
- **Audience:** Clients, Investors, UI/UX Designers, Frontend Developers, Engineering Teams

***

## Master Table of Contents
1. [Project Overview & Business Objectives](#1-project-overview--business-objectives)
2. [Information Architecture & Site Map Tree](#2-information-architecture--site-map-tree)
3. [User Journeys & Flowcharts](#3-user-journeys--flowcharts)
4. [Complete Frontend UI Page Specifications](#4-complete-frontend-ui-page-specifications)
5. [Customer Panel & Dashboard UI Design](#5-customer-panel--dashboard-ui-design)
6. [Admin Panel Module Architecture (21 Modules)](#6-admin-panel-module-architecture-21-modules)
7. [Design System & UI Token Specification](#7-design-system--ui-token-specification)
8. [Reusable Component Library Architecture](#8-reusable-component-library-architecture)
9. [Low-Fidelity & High-Fidelity Wireframe Blueprint](#9-low-fidelity--high-fidelity-wireframe-blueprint)
10. [Responsive Layout & Breakpoint Strategy](#10-responsive-layout--breakpoint-strategy)
11. [Visual Screenshot & Layout Matrix](#11-visual-screenshot--layout-matrix)
12. [Complete Navigation Flow Map](#12-complete-navigation-flow-map)
13. [Realtime Bi-Directional Synchronization Flows](#13-realtime-bi-directional-synchronization-flows)
14. [Certificate Lifecycle & Verification Engine](#14-certificate-lifecycle--verification-engine)
15. [Final Product Overview & Future Roadmap](#15-final-product-overview--future-roadmap)

***

## 1. Project Overview & Business Objectives

Nex LapTech is Bengaluru's premier IT solution hub, serving retail customers, gaming enthusiasts, corporate offices, and students. This Product Design Document (PDD) establishes the visual architecture, component hierarchies, interaction patterns, and user flows powering the Nex LapTech platform.

```yaml
Business Goals:
  - Streamline PC sales, laptop repairs, AMC quotes, and student registrations.
  - Eliminate friction in booking hardware services and tracking order status.
  - Provide an enterprise-grade Admin Console for real-time order and lead management.

User Goals:
  - Browse verified PC rigs, laptops, CCTV systems, and IT services.
  - Book services in < 60 seconds and receive instant reference ID tracking.
  - Receive real-time updates and download official verified certificates.
```

***

## 2. Information Architecture & Site Map Tree

```
NEX LAPTECH PUBLIC WEBSITE (www.nexbyte.com)
├── Home (/)
│   ├── Hero Banner & Quick Service CTA
│   ├── Business Metrics Counter
│   ├── Product & Service Teaser
│   ├── Testimonials & Google Reviews
│   └── Footer & Branch Directory
├── Products (/products)
│   ├── Gaming PCs Catalog
│   ├── Premium Used Laptops
│   ├── Enterprise Servers & Workstations
│   └── Hardware Compare Modal
├── Services (/services)
│   ├── Laptop & Desktop Repairs
│   ├── Networking & Office WiFi
│   └── AMC Maintenance Quote Trigger
├── Training & Internship (/training, /internship)
│   ├── Course Syllabus & Batch Schedules
│   ├── IEEE Project Domain Finder
│   └── Enrollment & Document Upload Modal
├── Verify & Track (/verify, /track)
│   ├── Certificate Registration Lookup
│   └── Live Booking Status & 2-Way Chat
└── Portals (/customer, /admin/login)
    ├── Customer Dashboard (/customer)
    └── Admin Console (/admin/*)
```

***

## 3. User Journeys & Flowcharts

### 3.1 Customer Booking Journey
```
Homepage (/) -> View Product (/products) -> Click "Book Now" -> Fill Unified Modal -> Submit 
  -> Receive Ref ID (NB-2026-XXXXXX) -> Redirect to Live Track (/track) -> Realtime Status Step Updates
```

### 3.2 Certificate Issuance & Verification Journey
```
Student Enrolls (/training) -> Admin Review -> Issue Certificate -> System Generates PDF & QR Code 
  -> Upload to Supabase Storage -> Realtime Notif -> Download PDF -> Verification via /verify Scan
```

***

## 4. Complete Frontend UI Page Specifications

### 4.1 Homepage (`/`)
- **Purpose:** Primary digital storefront capturing sales leads and repair inquiries.
- **Layout:** Full-width hero section, glassmorphic floating cards, sticky header navbar.
- **Component Hierarchy:** Navbar -> Hero -> Trust Badges Strip -> Product Showcase -> Service Cards -> Why Choose Us -> FAQ Accordion -> Footer.

### 4.2 Products Catalog (`/products`)
- **Purpose:** Interactive hardware catalog with category filtering and instant booking modals.
- **Layout:** Sticky category filter sidebar, 3-column responsive grid, search bar.
- **Components:** Category Pills (`gaming_pcs`, `business_laptops`, `cctv`), Hardware Cards, Spec Detail Badges, Compare Drawer.

***

## 5. Customer Panel & Dashboard UI Design

- **Path:** `/customer` and `/track`
- **Sidebar Navigation:** Overview, My Bookings, Active Services, Certificates, Messages, Settings.
- **Realtime Track Component:** Progress timeline bar showing order stages: `Submitted` -> `Contacted` -> `In Repair` -> `Completed`.
- **Live Chat Drawer:** Embedded 2-way chat box between Customer and Nex LapTech Support Desk.

***

## 6. Admin Panel Module Architecture (21 Modules)

All 21 Admin Modules (`/admin/*`) use a unified dashboard shell with sidebar:
1. **Overview Dashboard:** Revenue cards, active lead statistics, real-time booking feed.
2. **Bookings Logs Kanban:** Animated Kanban board columns with status badges.
3. **Products Catalog:** Add, edit, pricing controls, trash, and restore.
4. **Inventory Manager:** Low stock alerts (threshold <= 5) and quantity controls.
5. **Certificates Manager:** Create new certificates, view QR verification link, and preview PDF.
6. **Analytics & Reports:** Graphical revenue metrics and downloadable CSV system reports.

***

## 7. Design System & UI Token Specification

```css
:root {
  /* Color Palette Tokens */
  --bg-dark: #0B1120;
  --bg-panel: #0E1626;
  --primary-blue: #1E5EFF;
  --accent-cyan: #00D8F6;
  --text-main: #F8FAFC;
  --text-muted: #94A3B8;
  --border-glass: rgba(255, 255, 255, 0.1);
  --shadow-glow: 0 0 25px rgba(30, 94, 255, 0.25);

  /* Spacing & Border Radius System */
  --radius-lg: 16px;
  --radius-md: 12px;
  --spacing-section: 80px 0;
}
```

***

## 8. Reusable Component Library Architecture

- **Navbar (`Navbar.tsx`):** Glassmorphic blur header with logo, navigation links, call button, and theme toggle.
- **Unified Booking Modal (`UnifiedBookingModal.tsx`):** Step-by-step form capturing hardware selections, customer contact info, and budget preferences.
- **Notification Provider (`NotificationProvider.tsx`):** Global floating glass toast listener playing chime audio on real-time events.

***

## 9. Low-Fidelity & High-Fidelity Wireframe Blueprint

```
+------------------------------------------------------------------------+
|  [NEX LAPTECH LOGO]  Home  Products  Services  Training  [Book Service]    |
+------------------------------------------------------------------------+
|                                                                        |
|    ENGINEERING TOMORROW'S TECHNOLOGY, TODAY.                          |
|    Bengaluru's Trusted Destination for Gaming PCs & Repairs            |
|                                                                        |
|    [ Explore Products ]      [ Book Repair Service ]                       |
|                                                                        |
+------------------------------------------------------------------------+
|  [ 100% Genuine ]  [ Warranty Support ]  [ Doorstep Diagnostics ]     |
+------------------------------------------------------------------------+
```

***

## 10. Responsive Layout & Breakpoint Strategy

| Device Target | Screen Width | Grid Columns | Navigation Layout |
| :--- | :--- | :--- | :--- |
| **Mobile** | 375px – 639px | 1 Column Grid | Hamburger Slide Drawer |
| **Tablet** | 640px – 1023px | 2 Column Grid | Compressed Header Navbar |
| **Desktop** | 1024px – 1439px | 3 Column Grid | Sticky Header Navbar |
| **Ultra-Wide** | 1440px+ | 4 Column Grid | Expanded Header Navbar |

***

## 11. Visual Screenshot & Layout Matrix

- **[Figure 1.0] Public Storefront Homepage & Hero Component**
- **[Figure 2.0] Hardware Products Catalog & Spec Filters**
- **[Figure 3.0] Admin Realtime Kanban Board & Lead Drawer**
- **[Figure 4.0] Verified Certificate PDF Render with QR Code**

***

## 12. Complete Navigation Flow Map

```
Public User:  Home (/) -> Products -> Booking Modal -> Submission -> Live Track (/track)
Customer:     Login (/customer/login) -> Dashboard -> Active Bookings -> Chat -> Certificates
Admin User:   Login (/admin/login) -> Overview Dashboard -> Kanban -> Catalog -> Reports -> Settings
```

***

## 13. Realtime Bi-Directional Synchronization Flows

```
[Customer Form Submit] -> API Route -> Database Event -> SSE Broadcast (42ms) -> Admin Kanban Updates & Bell Rings
[Admin Status Update]  -> Database Mutate -> Realtime Stream -> Customer Track Step Advances
```

***

## 14. Certificate Lifecycle & Verification Engine

1. Student Enrolls in Training / Internship.
2. Admin approves application and generates custom Certificate ID (`NBT-TR-2026-XXXX`).
3. Embedded QR code links directly to `https://www.nexbyte.com/verify?id=NBT-TR-2026-XXXX`.
4. Rendered PDF stored in Supabase Storage (`nexbyte-assets` bucket) for instant download.

***

## 15. Final Product Overview & Future Roadmap

```yaml
Current Production Capabilities:
  - 64 Responsive Pages & 21 Admin Modules
  - Decoupled Express API Backend (Port 3001)
  - Bi-Directional Realtime Sync (42ms Average Latency)
  - Subdomain Architecture (www.nexbyte.com & api.nexbyte.com)

Future Scalability Roadmap:
  - Phase 1: Custom Online PC Builder with Live Compatibility Inspector
  - Phase 2: Integrated Payment Gateway (Razorpay / UPI Integration)
  - Phase 3: Mobile App (React Native) for Technicians & Doorstep Service Tracking
```
