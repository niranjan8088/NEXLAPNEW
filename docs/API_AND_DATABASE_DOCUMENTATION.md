# API & DATABASE ARCHITECTURE DOCUMENTATION

**Document Revision Date:** October 9, 2026  
**Project:** NexByte Technologies

---

## 🔌 API Endpoint Reference

### 1. Catalog & Public APIs

* **`GET /api/public/products`**
  * **Description:** Retrieves catalog items with filtering, search query, sorting, and pagination.
  * **Permissions:** Public.
  * **QueryParams:** `search`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`.

* **`GET /api/public/products/[id]`**
  * **Description:** Returns detailed product specifications, images, verified customer reviews, and stock.
  * **Permissions:** Public.

* **`GET /api/public/filters`**
  * **Description:** Dynamic category attribute definitions for sidebars.
  * **Permissions:** Public.

---

### 2. Customer APIs

* **`POST /api/checkout`**
  * **Description:** Places an order with server-side price validation, stock decrement, and invoice generation.
  * **Permissions:** Customer Session.

* **`GET /api/customer/orders`**
  * **Description:** Returns orders belonging strictly to the logged-in customer ID.
  * **Permissions:** Customer Session.

* **`POST /api/bookings`**
  * **Description:** Submits a doorstep service or repair booking.
  * **Permissions:** Public / Customer.

---

### 3. Reseller Hub APIs

* **`GET /api/reseller/products`**
  * **Description:** Lists product listings created by the authenticated reseller.
  * **Permissions:** Reseller Session.

* **`POST /api/reseller/products`**
  * **Description:** Submits a product listing for Admin approval (`approval_status: "pending"`).
  * **Permissions:** Reseller Session.

* **`GET /api/reseller/earnings`**
  * **Description:** Computes gross sales, platform commission split, and payout status.
  * **Permissions:** Reseller Session.

---

### 4. Admin APIs

* **`GET /api/admin/invoices`**
  * **Description:** Audits generated invoices and tax summaries.
  * **Permissions:** Admin Session.

* **`POST /api/admin/resellers/[id]`**
  * **Description:** Approves, rejects, or suspends reseller accounts.
  * **Permissions:** Admin Session.

---

## 🗄️ Database Tables & Schema Specification

The database utilizes 15 core tables defined in `lib/dbHelper.ts` and `docs/supabase_schema.sql`:

1. `users` / `customers`: Store profile metadata and role identifiers.
2. `products`: Master product catalog records.
3. `resellers`: Reseller business registration, approval status, and credentials.
4. `reseller_listings`: Reseller inventory bindings and custom pricing.
5. `orders`: Customer purchase transactions.
6. `invoices`: Sequential tax invoice numbers (`NEX-YYYY-XXXX`).
7. `reseller_payouts`: Commission release tracking.
8. `bookings`: Service and repair appointments.
9. `laptop_enquiries`: Custom desktop/laptop quotation requests.
10. `contacts`: General customer CRM enquiries.
11. `notifications`: Persistent notification bell alerts.
12. `reviews`: Customer ratings and purchase reviews.
13. `certificates`: Training/internship completion verification codes.
14. `activity_logs`: Auditable system actions.
15. `inventory_transactions`: Restock and deduction records.
