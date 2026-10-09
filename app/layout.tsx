import type { Metadata, Viewport } from "next";
import "./globals.css";
import { business } from "@/lib/data";
import FloatingButtons from "@/components/FloatingButtons";
import NotificationProvider from "@/components/NotificationProvider";
import ClientModals from "@/components/ClientModals";

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
    default: "NexByte Technologies | Premium Computers, Laptops & IT Services in Bengaluru",
    template: "%s | NexByte Technologies",
  },
  description: business.description,
  keywords: [
    "NexByte Technologies",
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
  authors: [{ name: "NexByte Technologies" }],
  creator: "NexByte Technologies",
  applicationName: "NexByte Technologies",
  formatDetection: { telephone: true, email: true, address: true },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "NexByte Technologies",
    title: "NexByte Technologies | Premium Computers, Laptops & IT Services",
    description: business.description,
    images: [
      {
        url: "/images/logo-horizontal.png",
        width: 1956,
        height: 804,
        alt: "NexByte Technologies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexByte Technologies | Premium Computers, Laptops & IT Services",
    description: business.description,
    images: ["/images/logo-horizontal.png"],
  },
  icons: {
    icon: "/images/logo-icon.png",
    shortcut: "/images/logo-icon.png",
    apple: "/images/logo-icon.png",
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
  themeColor: "#05070C",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ElectronicsStore",
  name: business.name,
  image: `${SITE_URL}/images/logo-horizontal.png`,
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
                  var saved = localStorage.getItem('nexbyte_theme') || localStorage.getItem('nexbyte-theme') || localStorage.getItem('theme');
                  var isNight = saved === 'night' || saved === 'dark' || (saved && (saved.indexOf('dark') !== -1 || saved.indexOf('midnight') !== -1 || saved.indexOf('black') !== -1));
                  var target = isNight ? 'night' : 'day';
                  document.documentElement.setAttribute('data-theme', target);
                  if (isNight) {
                    document.documentElement.classList.add('dark', 'night');
                    document.documentElement.classList.remove('light', 'day');
                  } else {
                    document.documentElement.classList.add('light', 'day');
                    document.documentElement.classList.remove('dark', 'night');
                  }
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
            {children}
            <FloatingButtons />
            <ClientModals />
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
