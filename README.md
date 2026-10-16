# NEXLAPTECH — Website

Premium, modern technology storefront for **NEXLAPTECH**, built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, and GSAP.

## Stack

- **Next.js 15** (App Router, Server Components by default)
- **React 19**
- **TypeScript**
- **Tailwind CSS** — custom brand tokens (blue / black / white) with glow + glassmorphism utilities
- **Framer Motion** — scroll reveals, layout transitions, page-level animation
- **GSAP** — hero entrance sequence
- **lucide-react** — icon set

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Project structure

```
app/
  layout.tsx        — root layout, metadata, Open Graph, JSON-LD schema
  page.tsx           — homepage composing all sections
  contact/page.tsx   — contact page with map, hours, branches
  sitemap.ts         — generates /sitemap.xml
  robots.ts          — generates /robots.txt
  loading.tsx        — route-level loading skeleton
  globals.css        — Tailwind layers + glass/glow utility classes
components/
  Navbar.tsx, Hero.tsx, ProductShowcase.tsx, Services.tsx,
  WhyChooseUs.tsx, Gallery.tsx, QRSection.tsx, Testimonials.tsx,
  FAQ.tsx, Footer.tsx, FloatingButtons.tsx
  ui/SectionHeading.tsx, ui/Counter.tsx
lib/
  data.ts    — all business content (products, services, contact info, FAQs, etc.)
  utils.ts   — small class-name helper
public/
  assets/nexlaptech-logo.png, assets/nexlaptech-horizontal.png
  nexlaptech-favicon.ico, nexlaptech-favicon-16.png, nexlaptech-favicon-32.png, nexlaptech-favicon-48.png
  nexlaptech-apple-touch-icon.png, nexlaptech-android-192.png, nexlaptech-android-512.png
  assets/nexlaptech-social-share.png
  images/            — product photos and marketing images
  product-*.png        — individual product photos cropped from the product poster
  poster-products.png, poster-services.png — full posters (used in Gallery)
  qr-whatsapp.png, qr-booking.png
```

## Editing content

Nearly everything — phone numbers, address, product/service copy, testimonials, FAQs — lives in **`lib/data.ts`**. Update it there and it propagates everywhere (nav, footer, contact page, JSON-LD schema).

## SEO

- `ElectronicsStore` JSON-LD schema in `app/layout.tsx` (address, hours, geo, social links)
- Open Graph + Twitter card metadata
- Auto-generated `sitemap.xml` and `robots.txt`
- Semantic headings, alt text on every image, `next/image` for automatic AVIF/WebP + lazy loading

Before going live, update `SITE_URL` in `app/layout.tsx`, `app/sitemap.ts`, and `app/robots.ts` to your real production domain.

## Deploying to Vercel (free tier)

1. Push this project to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Next.js** (auto-detected). No environment variables required.
4. Click **Deploy** — done.

No paid services, databases, or third-party APIs are required to run this site.

## Performance notes

- Images use `next/image` with responsive `sizes` and lazy loading (hero logo is `priority`-loaded).
- Fonts load via `next/font/google` (self-hosted, zero layout shift, `display: swap`).
- Animations respect `prefers-reduced-motion`.
- No client-side state libraries; motion and counters are scoped to the components that need them, keeping most of the tree as Server Components.

## Brand and loading experience

- The NEXLAPTECH logo source is `public/assets/nexlaptech-logo.png`; horizontal, social-share, favicon, Apple touch, and Android/PWA variants are generated from the supplied logo.
- The entry and route loader colors and assembly pacing are controlled by `--loader-bg`, `--brand-blue`, `--brand-cyan`, and `--loader-duration` in `app/globals.css`. The entry loader exits after load and has a 2.5-second safety limit.
