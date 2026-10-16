# API & DATABASE ARCHITECTURE DOCUMENTATION

**Document Revision Date:** October 9, 2026  
**Project:** Nex LapTech

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
  * **Description:** Places an order with server-side price and offer validation, records the applied offer code and discount, increments redemption usage, and generates an invoice.
  * **Permissions:** Customer Session.

* **`GET /api/offers`**
  * **Description:** Returns active, currently valid customer offers without exposing redemption/customer history.
  * **Permissions:** Public.

* **`GET /api/protection-plans`**
  * **Description:** Lists visible care and protection plan descriptions displayed on product pages. These plans are informational and are not added to cart or checkout.
  * **Permissions:** Public.

* **`POST /api/offers/validate`**
  * **Description:** Validates an offer code and calculates its discount for the provided cart. Checkout revalidates authoritatively before saving the order.
  * **Permissions:** Public.

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
* **`POST /api/admin/invoices`**
  * **Description:** Creates an invoice and records optional UPI transaction IDs, NEFT/RTGS UTRs and bank names, or debit/credit card transaction IDs and issuers.
  * **Permissions:** Admin Session. Apply `supabase/migrations/20261016_add_invoice_payment_references.sql` to persist these payment references.

* **`POST /api/admin/resellers/[id]`**
  * **Description:** Approves, rejects, or suspends reseller accounts.
  * **Permissions:** Admin Session.

* **`GET /api/admin/offers` and `POST /api/admin/offers`**
  * **Description:** Lists offers for administrators and creates customer promo codes with discount, eligibility, usage, and validity rules.
  * **Permissions:** Admin Session.

* **`GET /api/admin/protection-plans`, `POST /api/admin/protection-plans`, `PUT /api/admin/protection-plans/[id]`, and `DELETE /api/admin/protection-plans/[id]`**
  * **Description:** Administrators can create, edit, reorder, show/hide, and delete product care plan display content.
  * **Permissions:** Admin Session.

* **`POST /api/admin/catalog-import`**
  * **Permissions:** Admin Session only.
  * **Preview:** Send a multipart `file` field containing a CSV or XLSX file (10 MB maximum, 100 non-empty rows maximum). The server validates the first worksheet and returns proposed per-row actions without writing to the database.
  * **Commit:** Send the previewed source rows and explicit row choices as JSON with `mode: "commit"`. The server rechecks current SKUs and product matches before applying each selected change. Results identify imported, updated, skipped, and failed rows; failures can be partial if a later write fails.
  * **Template:** The admin catalog-import dialog downloads CSV/XLSX templates. The first 12 column names remain `sku, title, description, category, brand, price, compareAtPrice, costPrice, stock, imageUrl, condition, specs`; the appended columns are `parentSku, variantGroup, variantType, variantValue, variantSku, variantPrice, variantStock, variantImageUrl, variantSpecs`.
  * **Variant mapping:** Variants are stored in the product's existing JSON `variants` field as `{ id, sku, name, price, stock, image, attributes, active }`. `variantValue` maps to `name`, while `variantType`, `variantSpecs`, and optional `variantGroup` map to `attributes`. `parentSku` resolves the containing product and is not duplicated on the variant object. Parent prices and inventory are never copied into variants.
  * **Safety:** Existing SKU updates require explicit field selection; blank values are preserved. Similar product names and unverified parent relationships require review. The importer does not verify market prices or invent product data.

---

## 🗄️ Database Tables & Schema Specification

The database utilizes core tables defined in `lib/dbHelper.ts` and `docs/supabase_schema.sql`:

1. `users` / `customers`: Store profile metadata and role identifiers.
2. `products`: Master product catalog records. Catalog SKUs and the existing app's brand/cost-price fields are provisioned by `supabase/migrations/20261015_add_catalog_import_fields.sql`; compare-at price maps to the existing `original_price` database column. SKUs are protected by a normalized unique index; per-configuration data remains in the existing JSONB `variants` column.
3. `resellers`: Reseller business registration, approval status, and credentials.
4. `reseller_listings`: Reseller inventory bindings and custom pricing.
5. `orders`: Customer purchase transactions.
6. `invoices`: Sequential tax invoice numbers (`NEX-YYYY-XXXX`) and optional payment references, bank names, bank-transfer types, and card types. Provision the payment detail columns with `supabase/migrations/20261016_add_invoice_payment_references.sql`.
7. `reseller_payouts`: Commission release tracking.
8. `bookings`: Service and repair appointments.
9. `laptop_enquiries`: Custom desktop/laptop quotation requests.
10. `contacts`: General customer CRM enquiries.
11. `notifications`: Persistent notification bell alerts.
12. `reviews`: Customer ratings and purchase reviews.
13. `certificates`: Training/internship completion verification codes.
14. `activity_logs`: Auditable system actions.
15. `inventory_transactions`: Restock and deduction records.
16. `product_protection_plans`: Admin-managed display-only plan titles, descriptions, prices, periods, colors, visibility, and ordering. Provision it with `supabase/migrations/20261016_protection_plans.sql`.
17. `offers`: Admin-managed promo codes, rules, redemption limits, and usage history. Provision it with `supabase/migrations/20261016_offer_codes.sql`.

Apply `supabase/migrations/20261016_offer_redemption_tracking.sql` to add `orders.applied_offer_code` and `orders.discount_amount`; the administrator Orders page uses those fields to identify the code and savings for each purchase. The Admin Offers page creates and manages codes, which are listed to customers while active and within their validity dates.

Provision the offer-code table and default `NEX10` campaign with `supabase/migrations/20261016_offer_codes.sql`. Protection plan content is managed separately and remains display-only; applying or purchasing a protection plan is not part of checkout.
