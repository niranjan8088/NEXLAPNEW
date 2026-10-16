# DEPLOYMENT AND ENVIRONMENT GUIDE

**Document Revision Date:** October 9, 2026  
**Project:** Nex LapTech

---

## 💻 Local Development Setup

### 1. Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher

### 2. Installation & Server Launch
```bash
# 1. Clone repository
git clone https://github.com/nirajan252006/NEX LAPTECH.git
cd nexbyte

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Server will run at [http://localhost:3000](http://localhost:3000).

---

## ⚙️ Environment Variables Reference

Create a `.env.local` file in the root directory:

```env
# ── SUPABASE CONFIGURATION ──────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ── ADMIN SECURITY WHITELIST ──────────────────────────────────────────
ADMIN_EMAILS=admin@nexbyte.com,nirajan@nexbyte.com

# ── APP CONFIG ──────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Production Build & Deployment Commands

```bash
# Typecheck
npx tsc --noEmit

# Linting
npm run lint

# Production Build
npm run build

# Start Production Server
npm run start
```

Target Hosting Platforms: **Vercel**, **AWS Amplify**, or **Netlify**.
