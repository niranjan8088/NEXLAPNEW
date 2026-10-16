import type { Metadata, Viewport } from "next";
import "./globals.css";
import { business } from "@/lib/data";
import FloatingButtons from "@/components/FloatingButtons";
import NotificationProvider from "@/components/NotificationProvider";
import ClientModals from "@/components/ClientModals";
import AppExperience from "@/components/AppExperience";

import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

const SITE_URL = "https://nexbytetechnologies.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nex LapTech | Laptops, PC Components & Accessories",
    template: "%s | Nex LapTech",
  },
  description: business.description,
  keywords: [
    "Nex LapTech",
    "computer store Bengaluru",
    "laptop repair Bengaluru",
    "gaming desktops",
    "business laptops",
    "CCTV installation Bengaluru",
    "custom PC assembly",
    "bulk laptop supply",
    "IT services Padmanabhanagar",
    "second hand laptops Bengaluru",
  ],
  authors: [{ name: "Nex LapTech" }],
  creator: "Nex LapTech",
  applicationName: "Nex LapTech",
  formatDetection: { telephone: true, email: true, address: true },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Nex LapTech",
    title: "Nex LapTech | Laptops, PC Components & Accessories",
    description: business.description,
    images: [
      {
        url: "/assets/nexlaptech-logo.png",
        width: 512,
        height: 512,
        alt: "Nex LapTech",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nex LapTech | Laptops, PC Components & Accessories",
    description: business.description,
    images: ["/assets/nexlaptech-logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/android-chrome-192x192.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#020b1f",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ElectronicsStore",
  name: business.name,
  image: `${SITE_URL}/assets/nexlaptech-logo.png`,
  "@id": SITE_URL,
  url: SITE_URL,
  telephone: business.phones[0],
  email: business.email,
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Padmanabhanagar",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    postalCode: "560070",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 12.9086,
    longitude: 77.5442,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:30",
      closes: "20:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday"],
      opens: "10:00",
      closes: "17:00",
    },
  ],
  sameAs: [business.instagram, business.whatsappChannel],
  areaServed: [
    { "@type": "City", name: "Bengaluru" },
    { "@type": "City", name: "Tumkur" },
    { "@type": "City", name: "Hiriyur" },
  ],
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`} data-theme="day" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --loader-bg: #020b1f; --brand-blue: #1e6bff; --brand-cyan: #19d3ff; --loader-duration: 1.6s; }
          #nexlap-entry-loader { position: fixed; inset: 0; z-index: 2147483000; display: none; align-items: center; justify-content: center; overflow: hidden; padding: 20px 16px; background: radial-gradient(ellipse at 50% 36%, rgba(30,107,255,.2), transparent 58%), var(--loader-bg); color: #fff; }
          html.nexlap-entry-active #nexlap-entry-loader { display: flex; }
          html.nexlap-entry-active, html.nexlap-entry-active body { overflow: hidden; }
          .nexlap-loader-content { display: flex; width: min(880px,100%); flex-direction: column; align-items: center; gap: clamp(12px,2.4vh,22px); }
          .nexlap-logo-wrap { display: flex; width: 124px; height: 124px; align-items: center; justify-content: center; border-radius: 50%; filter: drop-shadow(0 0 22px rgba(25,211,255,.24)); }
          .nexlap-hardware { display: grid; width: min(760px,100%); grid-template-columns: repeat(5,minmax(0,1fr)); gap: 10px 8px; }
          .nexlap-progress-row { display: flex; width: min(360px,88vw); align-items: center; gap: 10px; }
          .nexlap-progress-track { height: 4px; flex: 1; overflow: hidden; border-radius: 99px; background: rgba(255,255,255,.18); }
          .nexlap-progress-value { width: 100%; height: 100%; transform: scaleX(0); transform-origin: left center; background: linear-gradient(90deg,var(--brand-cyan),var(--brand-blue)); }
          @media (min-width: 640px) { .nexlap-logo-wrap { width: 160px; height: 160px; } .nexlap-hardware { grid-template-columns: repeat(10,minmax(0,1fr)); } }
          @media (prefers-reduced-motion: reduce) { html.nexlap-entry-active #nexlap-entry-loader { background: var(--loader-bg); } html.nexlap-entry-active .nexlap-hardware { display: none; } }
          .nexlap-logo-wrap > span, .nexlap-logo-wrap img { width: 100%; height: 100%; object-fit: contain; }
        ` }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (!sessionStorage.getItem('nexlap-entry-seen')) {
                    document.documentElement.classList.add('nexlap-entry-active');
                    window.setTimeout(function() {
                      var root = document.documentElement;
                      if (root.classList.contains('nexlap-entry-active')) {
                        root.classList.remove('nexlap-entry-active');
                        try { sessionStorage.setItem('nexlap-entry-seen', '1'); } catch (e) {}
                      }
                    }, 2500);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var root = document.documentElement;
                  root.setAttribute('data-theme', 'day');
                  root.classList.add('light', 'day');
                  root.classList.remove('dark', 'night');
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (let r of registrations) r.unregister();
                });
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (let name of names) caches.delete(name);
                  });
                }
                navigator.serviceWorker.register('/sw.js');
              }
            `,
          }}
        />
      </head>
      <body className="font-body antialiased bg-nex-bg text-nex-text min-h-screen">
        <ThemeProvider>
          <NotificationProvider>
            <AppExperience>{children}</AppExperience>
            <FloatingButtons />
            <ClientModals />
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
