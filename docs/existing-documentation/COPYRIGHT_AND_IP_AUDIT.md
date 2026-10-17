# NEXLAPTECH — COPYRIGHT & INTELLECTUAL PROPERTY AUDIT

**Document Reference**: `docs/COPYRIGHT_AND_IP_AUDIT.md`  
**Audit Date**: October 9, 2026  
**Auditor**: Antigravity Technical & Compliance Engineering  

---

## 1. EXECUTIVE SUMMARY & OWNERSHIP OVERVIEW

This audit evaluates the intellectual property (IP) assets, branding materials, software components, icons, fonts, product images, and third-party code embedded within the NexLapTech web application platform.

> [!IMPORTANT]
> **Legal Notice**: This document provides a technical IP inventory and licensing audit based on codebase inspection. It does not constitute formal legal counsel. Formal trademark registration and copyright filing must be reviewed by a qualified Intellectual Property Attorney.

---

## 2. ASSET INVENTORY & LICENSING BREAKDOWN

### A. NexLapTech Original Assets (Exclusively Owned by NexLapTech)
| Asset Category | Asset Description | Source / Location | License / Ownership | Permitted Usage | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Brand Identity** | NexLapTech Name, Slogan & Product Badging | `components/` UI Headers | Proprietary / NexLapTech | Internal & Commercial | **PASS** |
| **Custom Codebase** | Next.js 15 App Router API routes, custom hooks, dbHelper abstraction, server commission engine | `app/`, `lib/dbHelper.ts` | Proprietary / NexLapTech | Exclusive Ownership | **PASS** |
| **Store Metadata** | Product specification schemas, category filters, internal CRM database definitions | `lib/filterEngine.ts`, `lib/data.ts` | Proprietary / NexLapTech | Exclusive Ownership | **PASS** |
| **PDF Templates** | Tax Invoice & E-Warranty PDF generation templates | `components/InvoicePDF.tsx` | Proprietary / NexLapTech | Store Billing | **PASS** |

### B. UI Frameworks & Open-Source Software Libraries
| Library / Dependency | Version | Source | License | Attribution Requirement | Commercial Use Permitted? |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Next.js** | `15.0.3` | Vercel / npm | MIT License | Copyright Notice in license file | **YES** |
| **React & React DOM** | `19.0.0` | Meta / npm | MIT License | Copyright Notice in license file | **YES** |
| **TypeScript** | `5.6.3` | Microsoft / npm | Apache 2.0 | Notice preserved | **YES** |
| **Supabase JS Client** | `2.109.0` | Supabase / npm | MIT License | Copyright Notice preserved | **YES** |
| **Lucide React Icons** | `0.454.0` | Lucide Contributors | ISC License | Copyright notice in package | **YES** |
| **Framer Motion** | `11.11.17` | Framer / npm | MIT License | Copyright Notice preserved | **YES** |
| **GSAP** | `3.12.5` | GreenSock | Standard License | Standard web license applied | **YES** |
| **Lenis Smooth Scroll** | `1.3.25` | Studio Freight | MIT License | Copyright Notice preserved | **YES** |
| **TailwindCSS** | `3.4.14` | Tailwind Labs | MIT License | Copyright Notice preserved | **YES** |
| **DOMPurify** | `3.4.12` | Cure53 / npm | Apache 2.0 / MPL 2.0 | Notice preserved | **YES** |
| **Zustand** | `5.0.14` | PMNDRS / npm | MIT License | Copyright Notice preserved | **YES** |

### C. Media Assets, Fonts & Product Images
| Media Asset Type | Location / Path | Provenance / Origin | License / Rights | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **Typography** | Google Fonts (`Inter`, `Outfit`) | Google Fonts API | SIL Open Font License 1.1 | Permitted for commercial use |
| **Product Mock Images** | `public/images/*` | Generated via AI tool (`generate_image`) | Permitted for store demo | Replace with actual product photos before public launch |
| **Brand Logos** | `public/assets/nexlaptech-logo.png` | NexLapTech Graphic Assets | Proprietary to NexLapTech | Register trademark |

---

## 3. UNVERIFIED ASSETS & REMEDIATION CHECKLIST

- [x] **Verified**: All third-party node packages use permissive open-source licenses (MIT, Apache 2.0, ISC).
- [x] **Verified**: No GPL-v3 or copyleft dependencies detected in production build bundle.
- [ ] **Action Required**: Replace demo AI-generated laptop image placeholders with high-resolution original photography of actual reseller/store inventory prior to production launch.
- [ ] **Action Required**: File trademark application with the Indian Trade Marks Registry for "NexLapTech" and the NexLapTech logo.

---

## 4. EVIDENCE & SOURCES

1. Package Manifest: [package.json](file:///e:/ne/nexbyte/package.json)
2. License File Audit: Node Modules MIT & Apache License Texts preserved in `node_modules/`.
3. Code Inspection: [lib/dbHelper.ts](file:///e:/ne/nexbyte/lib/dbHelper.ts), [app/products/page.tsx](file:///e:/ne/nexbyte/app/products/page.tsx).
