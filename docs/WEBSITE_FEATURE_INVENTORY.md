# WEBSITE FEATURE INVENTORY & ROUTE CATALOG

**Document Revision Date:** October 9, 2026  
**Project:** Nex LapTech

---

## 🧭 Master Route Catalog

### 1. Customer Portal & Public Storefront

| Route URL | Page Name | User Access | Primary Components & Data | Implementation Status |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Main Gateway | Public | HeroParallax, Category Grid, Featured Products, AI Chat Widget | **Implemented & Verified** |
| `/customer` | Customer Dashboard | Customer | KPI Cards (Orders, Bookings, Messages), Recent Activity Table | **Implemented & Verified** |
| `/products` | Shop Catalog | Public | Dynamic Filter Drawer, Sorting, Product Grid, Pagination | **Implemented & Verified** |
| `/products/[id]` | Product Details | Public | Image Gallery, Specs Table, Add to Cart/Wishlist, Verified Reviews | **Implemented & Verified** |
| `/offers` | Promotional Offers | Public | Active Deals, Discount Codes, Expiry Countdown | **Implemented & Verified** |
| `/cart` / `/customer/cart` | Shopping Cart | Public / Customer | Items List, Quantity Controls, Promo Input, Subtotal Breakdown | **Implemented & Verified** |
| `/checkout` | Checkout Page | Customer | Shipping Address Form, Payment Selection (UPI/Card/COD), Price Validation | **Implemented & Verified** |
| `/orders` / `/customer/orders` | Orders History | Customer | Order Status Tracker, Item Cards, Invoice Download Button | **Implemented & Verified** |
| `/bookings` / `/customer/bookings` | IT Service Bookings | Customer | Service Request Form, Slot Selector, Booking Status Table | **Implemented & Verified** |
| `/customer/laptop-enquiry` | Laptop Enquiries | Customer | Custom Laptop Enquiry Form, Admin Reply Messages | **Implemented & Verified** |
| `/customer/messages` | Customer Support Threads | Customer | Interactive Chat Thread with Admin/Reseller | **Implemented & Verified** |
| `/customer/notifications` | Customer Notifications | Customer | Real-time Alert List, Mark All Read Controls | **Implemented & Verified** |
| `/customer/favorites` | Wishlist | Customer | Saved Products Grid, Quick Move to Cart | **Implemented & Verified** |
| `/training` | Training Programs | Public / Customer | Course List, Enrollment Form, Training Syllabus | **Implemented & Verified** |
| `/internship` | Internship Portal | Public / Customer | Internship Tracks, Application Modal, Status Tracker | **Implemented & Verified** |
| `/verify` | Certificate & Warranty Check | Public | Certificate ID Input, Verification Result Badge, PDF Download | **Implemented & Verified** |
| `/customer/profile` | Customer Profile | Customer | Profile Details, Address Management, Account Settings | **Implemented & Verified** |
| `/track` | Public Order Tracking | Public | Tracking Number Input, Delivery Milestone Timeline | **Implemented & Verified** |

---

### 2. Admin Panel Routes (`/admin/*`)

| Route URL | Page Name | User Access | Primary Components & Data | Implementation Status |
| :--- | :--- | :--- | :--- | :--- |
| `/admin` | Admin Dashboard | Admin | System Metrics, Revenue Summary, Pending Approvals Alert | **Implemented & Verified** |
| `/admin/products` | Product Management | Admin | Product CRUD Table, Stock Editor, Reseller Product Approval | **Implemented & Verified** |
| `/admin/billing` | Billing & Invoices | Admin | Invoices List, Manual Invoice Creator, Tax Breakdown Table | **Implemented & Verified** |
| `/admin/contacts` | CRM & Customer Leads | Admin | Inquiry Management, Customer Reply Interface | **Implemented & Verified** |
| `/admin/laptop-enquiries` | Laptop Enquiries CRM | Admin | Custom Laptop Quote Requests, Reseller Assignment Tool | **Implemented & Verified** |
| `/admin/notifications` | Admin Alert Center | Admin | System Alerts, Pipeline Event Notifications | **Implemented & Verified** |
| `/admin/product-filters` | Filter Management | Admin | Dynamic Category Filter Definitions Manager | **Implemented & Verified** |
| `/admin/settings` | System Settings | Admin | Store Config, Branding Variables, Admin Email Whitelist | **Implemented & Verified** |

---

### 3. Reseller Hub Routes (`/reseller/*`)

| Route URL | Page Name | User Access | Primary Components & Data | Implementation Status |
| :--- | :--- | :--- | :--- | :--- |
| `/reseller` | Reseller Dashboard | Reseller | Total Revenue, Pending Orders, Recent Products Table | **Implemented & Verified** |
| `/reseller/products` | My Product Listings | Reseller | Listing Status (Approved/Pending), Stock Controls, Add Product Link | **Implemented & Verified** |
| `/reseller/inventory` | Stock Management | Reseller | Inventory Restock Table, Audit Log | **Implemented & Verified** |
| `/reseller/earnings` | Earnings & Payouts | Reseller | Gross Sales, Platform Commission Split, Net Earnings, Payout Requests | **Implemented & Verified** |
| `/reseller/orders` | Reseller Orders | Reseller | Assigned Customer Orders, Shipping Status | **Implemented & Verified** |
| `/reseller/messages` | Inquiry Messaging | Reseller | Customer Support Threads assigned by Admin | **Implemented & Verified** |
| `/reseller/analytics` | Sales Performance | Reseller | Monthly Revenue Charts, Top Selling Products | **Implemented & Verified** |
