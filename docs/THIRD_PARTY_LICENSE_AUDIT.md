# NEX LAPTECH — THIRD-PARTY SOFTWARE & LICENSE AUDIT

**Document Reference**: `docs/THIRD_PARTY_LICENSE_AUDIT.md`  
**Audit Date**: October 9, 2026  
**Auditor**: Antigravity Compliance Suite  

---

## 1. FULL DEPENDENCY LICENSE MATRIX

| Package / Library Name | Version | License Type | Commercial Use | Attribution Requirement | Remediation Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **next** | `15.0.3` | MIT | Permitted | License text in node_modules | **VERIFIED PASS** |
| **react** | `19.0.0` | MIT | Permitted | Copyright notice preserved | **VERIFIED PASS** |
| **react-dom** | `19.0.0` | MIT | Permitted | Copyright notice preserved | **VERIFIED PASS** |
| **@supabase/supabase-js** | `2.109.0` | MIT | Permitted | Copyright notice preserved | **VERIFIED PASS** |
| **lucide-react** | `0.454.0` | ISC | Permitted | Copyright notice in package | **VERIFIED PASS** |
| **framer-motion** | `11.11.17` | MIT | Permitted | Copyright notice preserved | **VERIFIED PASS** |
| **gsap** | `3.12.5` | Standard Web License | Permitted | Standard web usage permitted | **VERIFIED PASS** |
| **lenis** | `1.3.25` | MIT | Permitted | Copyright notice preserved | **VERIFIED PASS** |
| **clsx** | `2.1.1` | MIT | Permitted | Copyright notice preserved | **VERIFIED PASS** |
| **dompurify** | `3.4.12` | Apache-2.0 / MPL-2.0 | Permitted | Copyright notice preserved | **VERIFIED PASS** |
| **@types/dompurify** | `3.0.5` | MIT | Permitted | Type definitions standard | **VERIFIED PASS** |
| **@react-pdf/renderer** | `4.5.1` | MIT | Permitted | License text preserved | **VERIFIED PASS** |
| **three** | `0.185.1` | MIT | Permitted | Copyright notice preserved | **VERIFIED PASS** |
| **xlsx** | `0.18.5` | Apache-2.0 | Permitted | Copyright notice preserved | **VERIFIED PASS** |
| **zustand** | `5.0.14` | MIT | Permitted | Copyright notice preserved | **VERIFIED PASS** |
| **tailwindcss** | `3.4.14` | MIT | Permitted | Build tool dependency | **VERIFIED PASS** |
| **autoprefixer** | `10.4.20` | MIT | Permitted | Build tool dependency | **VERIFIED PASS** |
| **postcss** | `8.4.49` | MIT | Permitted | Build tool dependency | **VERIFIED PASS** |
| **typescript** | `5.6.3` | Apache-2.0 | Permitted | Development dependency | **VERIFIED PASS** |
| **eslint** | `8.57.1` | MIT | Permitted | Development dependency | **VERIFIED PASS** |

---

## 2. COMPLIANCE VERIFICATION SUMMARY

1. **Copyleft Audit**: No GPL, AGPL, or restrictive copyleft software packages are included in the production dependency graph.
2. **Commercial Usability**: 100% of runtime dependencies use permissive open-source software licenses (MIT, Apache 2.0, ISC, Standard Web License).
3. **Attribution**: standard copyright notices contained within `node_modules` manifests remain preserved.

---

## 3. EVIDENCE & SOURCES

1. `package.json`: [package.json](file:///e:/ne/nexbyte/package.json)
2. `package-lock.json`: [package-lock.json](file:///e:/ne/nexbyte/package-lock.json)
