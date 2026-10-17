# NEXLAPTECH
## Master UI/UX Design Bible & Enterprise Product Design Document (PDD)
### Section 5: Admin Panel Module Specifications (21 Modules)

***

## 1. Overview Dashboard (`/admin/dashboard`)

### 1. Purpose
Central executive dashboard displaying real-time revenue cards, incoming lead notifications, recent bookings, and system health status.

### 2. UI Layout & Widgets
- Top Stat Cards: Total Revenue, Total Bookings, Active Customers, Serviced Devices.
- Realtime Booking Stream: Incoming lead cards with highlight animations and chime alerts.
- Quick Actions Bar: Add Product, Issue Certificate, Export System Report, Broadcast Notification.

---

## 2. Bookings Logs Kanban (`/admin/bookings`)

### 1. Purpose
Drag-and-drop Kanban lead management interface for processing customer bookings.

### 2. Status Columns
1. `Submitted` (New leads)
2. `Contacted` (Customer phone confirmed)
3. `In Service` (Technician working on hardware)
4. `Completed` (Finished and invoiced)

---

## 3. Products Catalog Manager (`/admin/products`)

### 1. Purpose
Manage PC & Laptop hardware catalog, set prices, edit specs, update stock, trash, and restore items.

### 2. Features
Search bar, category filter, Add Product modal, image upload to Supabase Storage, stock status tags.

---

## 4. Certificates Manager (`/admin/certificates`)

### 1. Purpose
Issue new student certificates, upload rendered PDF files, generate QR codes pointing to `/verify`, and manage certificate records.

---

## 5. Inventory & Low Stock Alerts (`/admin/inventory`)

### 1. Purpose
Monitor stock quantities for PC parts and accessories. Trigger low-stock alerts when quantity <= 5.

---

## 6. Complete Inventory of All 21 Admin Modules

| Module ID | Module Name | Route | Key Function | Realtime Sync |
| :--- | :--- | :--- | :--- | :--- |
| `AD-01` | Overview Dashboard | `/admin/dashboard` | Executive KPIs & recent leads | ✅ YES |
| `AD-02` | Bookings Logs | `/admin/bookings` | Kanban drag-and-drop workflow | ✅ YES |
| `AD-03` | Products Catalog | `/admin/products` | Add, edit, delete, pricing control | ✅ YES |
| `AD-04` | IT Services | `/admin/services` | Service menu & pricing edits | ✅ YES |
| `AD-05` | Reviews Feed | `/admin/reviews` | Moderate & approve customer reviews | ✅ YES |
| `AD-06` | Customers Directory| `/admin/customers` | Customer profiles & order history | ✅ YES |
| `AD-07` | Internships | `/admin/internships` | IEEE student application review | ✅ YES |
| `AD-08` | Training | `/admin/training` | Course batch assignments | ✅ YES |
| `AD-09` | Contacts | `/admin/contacts` | Contact form inbox & WhatsApp | ✅ YES |
| `AD-10` | Laptop Enquiries | `/admin/laptop-enquiries` | Custom laptop request notes | ✅ YES |
| `AD-11` | Inventory Alerts | `/admin/inventory` | Low stock alerts (<=5) | ✅ YES |
| `AD-12` | Analytics | `/admin/analytics` | Revenue graphs & service popularity | N/A |
| `AD-13` | System Reports | `/admin/reports` | Export CSV reporting data | N/A |
| `AD-14` | Notifications | `/admin/notifications` | Toast alert feed & unread count | ✅ YES |
| `AD-15` | Gallery Manager | `/admin/gallery` | Upload & toggle storefront photos | ✅ YES |
| `AD-16` | Certificates | `/admin/certificates` | Issue PDF certificate & QR link | ✅ YES |
| `AD-17` | QR Generator | `/admin/qr-generator` | Generate WhatsApp & URL QR codes | N/A |
| `AD-18` | Admin Users | `/admin/users` | Manage admin roles & allowlist | ✅ YES |
| `AD-19` | Branch Settings | `/admin/branches` | Update branch locations & hours | ✅ YES |
| `AD-20` | Website CMS | `/admin/website-cms` | Update homepage text & SEO meta | ✅ YES |
| `AD-21` | Settings | `/admin/settings` | System auto-logout & session policies| N/A |
