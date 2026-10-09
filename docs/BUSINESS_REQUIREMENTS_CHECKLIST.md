# NEXBYTE TECHNOLOGIES — BUSINESS REQUIREMENTS & ACCOUNT OWNERSHIP CHECKLIST

**Document Reference**: `docs/BUSINESS_REQUIREMENTS_CHECKLIST.md`  
**Audit Date**: October 9, 2026  
**Status**: Ready for Owner Review  

---

## 1. CRITICAL ACCOUNT CONTROL CHECKLIST FOR BUSINESS OWNER

The business owner must ensure direct access and administrative ownership over the following accounts prior to public launch:

| Account / Service | Purpose | Recommended Owner Control Action | Status |
| :--- | :--- | :--- | :---: |
| **Domain Registrar** | Primary domain registration (`nexbytetechnologies.com`) | Transfer ownership to corporate email; enable 2FA & auto-renew. | **OWNER DECISION REQUIRED** |
| **GitHub Repository** | Source code & deployment pipelines | Grant admin access to owner; require signed commits. | **OWNER DECISION REQUIRED** |
| **Supabase Cloud Project** | PostgreSQL database, storage buckets, & Auth | Set owner as primary organization billing admin. | **OWNER DECISION REQUIRED** |
| **Vercel / Hosting** | Production web hosting & SSL management | Bind organization payment profile under owner account. | **OWNER DECISION REQUIRED** |
| **Corporate Email / Workspace**| Business communication (`info@nexbytetechnologies.com`) | Setup Google Workspace / Microsoft 365 admin account. | **OWNER DECISION REQUIRED** |
| **Payment Gateway** | Razorpay / Cashfree / UPI Merchant Account | Complete business KYC & bank account verification. | **OWNER DECISION REQUIRED** |
| **SMS / WhatsApp API** | Transactional SMS & OTP notifications (e.g. Twilio / Gupshup) | Register DLT entity with telecom providers for Indian SMS templates. | **OWNER DECISION REQUIRED** |

> [!CAUTION]
> **Security Notice**: Never store administrative credentials or API secret keys in repository files or public commits. Always utilize environment secret vaults (e.g. Vercel Environment Variables).

---

## 2. PRIVACY & CUSTOMER DATA RETENTION ARCHITECTURE

### Data Types Collected & Purpose
1. **Customer Identity**: Full Name, Email, Phone Number (for order delivery, billing, & notifications).
2. **Delivery Addresses**: Shipping Address, City, State, Pincode (for order fulfillment).
3. **Financial Snapshots**: Order Subtotals, GST breakdown, Applied Offers, Payment References (stored for 7 years as required by Indian Income Tax Act for audit).
4. **Communications**: Support tickets, Ask Seller messages, Product Reviews (retained to resolve disputes and verify buyer ratings).
5. **Certificates & Training**: Student Name, Course, Issue Date, Registration ID (retained permanently for verification at `/verify`).

### Customer Data Access & Deletion Procedures
- **Data Export**: Customers can request a copy of their order and invoice history via Customer Dashboard (`/customer/account`).
- **Account Deletion / Privacy Requests**: Account deletion requests trigger masking of personal profile details while preserving required accounting tax records.

---

## 3. DRAFT BUSINESS POLICIES STATUS MATRIX

| Policy Name | Description & Operational Alignment | Owner Action Required |
| :--- | :--- | :---: |
| **1. Privacy Policy** | Explains collection of phone, address, and billing data under Indian DPDP Act guidelines. | **OWNER DECISION REQUIRED** |
| **2. Terms & Conditions** | Governs customer use of shop, cart, checkout, and customer portal. | **OWNER DECISION REQUIRED** |
| **3. Website Use Policy** | Prohibits web scraping, fake reviews, and automated spam. | **OWNER DECISION REQUIRED** |
| **4. Shipping & Delivery Policy** | Documents 3–5 business day delivery timelines and pincode verification. | **OWNER DECISION REQUIRED** |
| **5. Cancellation & Refund Policy** | Specifies 24-hour order cancellation window prior to dispatch. | **OWNER DECISION REQUIRED** |
| **6. Return & Replacement Policy** | 7-day replacement for defective hardware with unboxing video verification. | **OWNER DECISION REQUIRED** |
| **7. Warranty & E-Warranty Policy** | Covers 1–2 year hardware warranties managed through E-Warranty Vault. | **OWNER DECISION REQUIRED** |
| **8. Repair & Service Terms** | Details diagnostic fees, technician booking, and turn-around times. | **OWNER DECISION REQUIRED** |
| **9. Reseller Terms & Conditions** | Governs seller onboarding, listing rules, stock safety, and seller conduct. | **OWNER DECISION REQUIRED** |
| **10. Commission & Payout Policy** | Outlines server commission calculation, 14-day hold, and weekly payout payouts. | **OWNER DECISION REQUIRED** |
| **11. Offer & Referral Terms** | Restricts single offer code per checkout; prevents referral self-usage. | **OWNER DECISION REQUIRED** |
| **12. Training & Internship Terms** | Governs course completion, attendance, and project submissions. | **OWNER DECISION REQUIRED** |
| **13. Certificate Policy** | Defines QR code verification at `/verify` and revocation procedures for misconduct. | **OWNER DECISION REQUIRED** |
| **14. Customer Support Policy** | Guarantees 24–48 hour response time for customer support tickets. | **OWNER DECISION REQUIRED** |
| **15. Cookie Policy** | Explains functional cookies used for cart persistence and theme selection. | **OWNER DECISION REQUIRED** |

---

## 4. EVIDENCE & SOURCES

1. Account Setup Manifest: [docs/PRODUCTION_DEPLOYMENT.md](file:///e:/ne/nexbyte/docs/PRODUCTION_DEPLOYMENT.md)
2. Database Models: [lib/dbHelper.ts](file:///e:/ne/nexbyte/lib/dbHelper.ts)
