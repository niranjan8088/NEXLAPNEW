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
        url: "/assets/nexlaptech-logo.svg",
        width: 768,
        height: 768,
        alt: "Nex LapTech",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nex LapTech | Laptops, PC Components & Accessories",
    description: business.description,
    images: ["/assets/nexlaptech-logo.svg"],
  },
  icons: {
    icon: [
      { url: "/assets/nexlaptech-logo.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/assets/nexlaptech-logo.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/assets/nexlaptech-logo.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    shortcut: "/assets/nexlaptech-logo.svg",
    apple: "/assets/nexlaptech-logo.svg",
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
  themeColor: "#F8FAFC",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ElectronicsStore",
  name: business.name,
  image: `${SITE_URL}/assets/nexlaptech-logo.svg`,
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
          :root { --loader-bg: #f8fafc; --brand-blue: #2563eb; --brand-cyan: #0891b2; --loader-duration: 1.6s; }
          #nexlap-entry-loader { position: fixed; inset: 0; z-index: 2147483000; display: none; align-items: center; justify-content: center; overflow: hidden; background: radial-gradient(ellipse at 50% 40%, rgba(14,165,233,.12), transparent 58%), var(--loader-bg); color: #0f172a; }
          html.nexlap-entry-active #nexlap-entry-loader { display: flex; }
          html.nexlap-entry-active, html.nexlap-entry-active body { overflow: hidden; }
          @media (prefers-reduced-motion: reduce) { html.nexlap-entry-active #nexlap-entry-loader { background: var(--loader-bg); } }
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
