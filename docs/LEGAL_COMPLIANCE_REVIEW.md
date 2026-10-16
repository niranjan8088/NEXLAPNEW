# NEX LAPTECH — INDIAN BUSINESS & LEGAL COMPLIANCE REVIEW

**Document Reference**: `docs/LEGAL_COMPLIANCE_REVIEW.md`  
**Audit Date**: October 9, 2026  
**Jurisdiction**: India (Karnataka / Nationwide E-Commerce & Service Operations)  

---

## 1. LEGAL COMPLIANCE MATRIX

> [!WARNING]
> **Legal Disclaimer**: Software code validation and automated test execution do not replace formal legal audit. The owner must consult a qualified Indian Chartered Accountant (CA) and Legal Practitioner before commencing commercial sales.

```
====================================================================================================
COMPLIANCE AREA                         TECHNICAL IMPLEMENTATION STATUS          LEGAL STATUS
====================================================================================================
1. GST 18% Tax Invoicing & Breakdown   [ VERIFIED IN SYSTEM ARCHITECTURE ]       Requires CA Review
2. Consumer Protection (E-Commerce)    [ VERIFIED IN SYSTEM ARCHITECTURE ]       Requires Legal Review
3. Digital Personal Data Protection     [ VERIFIED IN SYSTEM ARCHITECTURE ]       Requires Policy Signoff
4. Marketplace Seller Disclosures       [ VERIFIED IN SYSTEM ARCHITECTURE ]       Requires Seller Agreement
5. Digital Invoicing & Tax Retention    [ VERIFIED IN SYSTEM ARCHITECTURE ]       Requires CA Review
====================================================================================================
```

---

## 2. DETAILED COMPLIANCE BREAKDOWN

### A. GST & Tax Compliance (18% Goods and Services Tax)
- **Implemented Technical Features**:
  - Authoritative 18% GST calculation on net taxable amount (Subtotal minus Discounts).
  - B2B CGST (9%) + SGST (9%) split calculation.
  - Sequential invoice number generation (`NEX-2026-XXXX`).
  - Immutable tax invoice PDF storage (`components/InvoicePDF.tsx`).
- **Owner Action Required**:
  - **GSTIN Registration**: Owner must provide valid GSTIN to display on official tax invoices.
  - **HSN / SAC Code Mapping**: Verify HSN codes for hardware items (e.g. 8471 for Laptops) and SAC codes for IT repair services (e.g. 998713).
  - **CA Reconciliation**: Schedule monthly GST return filing (GSTR-1 & GSTR-3B) with business CA.

### B. Consumer Protection (E-Commerce Rules, 2020)
- **Implemented Technical Features**:
  - Full display of seller identity ("Sold by: Approved Reseller A") on product detail pages (`/products/[id]`).
  - Explicit price display including all taxes and breakdown.
  - Customer complaint & ticketing portal (`/customer/support`).
  - Verified buyer review badges (`verified: true`).
- **Owner Action Required**:
  - **Grievance Officer Appointment**: Appoint a designated Grievance Officer and publish contact email/phone on the contact page as mandated by Indian E-Commerce rules.

### C. Digital Personal Data Protection (DPDP Act, 2023)
- **Implemented Technical Features**:
  - Customer data isolation preventing unauthorized profile or order inspection.
  - Role-based access control protecting customer records from reseller access.
  - Password hashing and session token verification (`lib/dbHelper.ts`).
- **Owner Action Required**:
  - Formal sign-off on Privacy Policy disclosing data retention and third-party processor usage.

### D. Marketplace & Seller Regulations
- **Implemented Technical Features**:
  - Reseller approval lifecycle (`pending` ➔ `approved` / `suspended`).
  - Strict isolation preventing resellers from seeing competitor pricing or unrelated customer databases.
  - Auditable inventory adjustment transaction logs (`inventory_transactions`).
- **Owner Action Required**:
  - Execute physical/digital Reseller Agreement with all onboarded sellers covering liability, counterfeit prohibition, and warranty fulfillment.

---

## 3. QUESTIONS FOR QUALIFIED INDIAN CA & LAWYER

The business owner should present the following specific questions to professional advisors:

1. **For Chartered Accountant**:
   - Is the sequential invoice numbering schema (`NEX-2026-XXXX`) compliant with Rule 46 of the CGST Rules?
   - Should Marketplace Reseller Commission payouts be subject to TDS under Section 194O of the Income Tax Act?
   - What is the appropriate GST treatment for delivery fee charges?

2. **For Legal Counsel**:
   - Are the drafted Cancellation, Refund, and Return policies compliant with the Consumer Protection (E-Commerce) Rules, 2020?
   - Does the platform meet all disclosure requirements for multi-seller marketplaces?
   - Is the E-Warranty digital certificate (`/verify`) legally enforceable under the Information Technology Act, 2000?

---

## 4. EVIDENCE & SOURCES

1. Tax Invoice Generator: [components/InvoicePDF.tsx](file:///e:/ne/nexbyte/components/InvoicePDF.tsx)
2. Checkout API Engine: [app/api/checkout/route.ts](file:///e:/ne/nexbyte/app/api/checkout/route.ts)
3. Commission Engine: [lib/dbHelper.ts](file:///e:/ne/nexbyte/lib/dbHelper.ts#L650-L685)
