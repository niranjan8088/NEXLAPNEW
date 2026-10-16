# PENDING WORK AND ROADMAP

**Document Revision Date:** October 9, 2026  
**Project:** Nex LapTech

---

## 📌 Status Summary

The Nex LapTech codebase is **Production Ready (v1.0)** with fully functional customer, admin, and reseller portals. The following enhancements represent post-v1 roadmap optimizations.

---

## 🛣️ Post-v1 Optimization Roadmap

### 1. Payment Gateway Direct Integrations (P2)
* **Current State:** Payment selection records transactions with payment status (e.g. `Pending (UPI)` / `COD`).
* **Next Steps:** Integrate direct Razorpay / Cashfree webhooks for instant automated payment verification.

### 2. Automated Shipping Carrier Webhooks (P2)
* **Current State:** Shipment tracking number recorded manually by Admin/Reseller (`/track`).
* **Next Steps:** Connect Shiprocket or Delhivery APIs for live GPS tracking updates.

### 3. Advanced Multi-Factor Auth (P3)
* **Current State:** Cookie-based session validation & Supabase Auth.
* **Next Steps:** Enable optional SMS OTP two-factor authentication for Admin and Reseller logins.
