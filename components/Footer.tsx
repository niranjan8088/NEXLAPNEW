"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { Mail, MapPin, Phone, Instagram } from "lucide-react";
import { business } from "@/lib/data";

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="relative border-t border-slate-200/80 dark:border-white/[0.06] bg-slate-100/60 dark:bg-white/[0.01] pt-14 pb-10 text-slate-700 dark:text-slate-300">
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9">
                <BrandLogo width={72} height={72} sizes="36px" className="h-full w-full" />
              </div>
              <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
                NEX LAPTECH
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {business.tagline} Simple, fast computer sales, repair &amp; IT services for everyone.
            </p>
            <a
              href={business.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-nex-blue dark:hover:text-nex-blueLight"
            >
              <Instagram className="h-4 w-4" />
              {business.instagramHandle}
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Quick Links
            </h4>
            <ul className="mt-3.5 flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/" className="hover:text-nex-blue dark:hover:text-nex-blueLight">Home</Link></li>
              <li><Link href="/products" className="hover:text-nex-blue dark:hover:text-nex-blueLight">Shop Computers</Link></li>
              <li><Link href="/services" className="hover:text-nex-blue dark:hover:text-nex-blueLight">Services &amp; Repairs</Link></li>
              <li><Link href="/customer/requests" className="hover:text-nex-blue dark:hover:text-nex-blueLight">My Requests / Track</Link></li>
              <li><Link href="/offers" className="hover:text-nex-blue dark:hover:text-nex-blueLight">Active Offers</Link></li>
            </ul>
          </div>

          {/* Customer Links */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Customer Support
            </h4>
            <ul className="mt-3.5 flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/contact" className="hover:text-nex-blue dark:hover:text-nex-blueLight">Get Help &amp; Contact</Link></li>
              <li><Link href="/training" className="hover:text-nex-blue dark:hover:text-nex-blueLight">Training Programs</Link></li>
              <li><Link href="/internship" className="hover:text-nex-blue dark:hover:text-nex-blueLight">Internships</Link></li>
              <li><Link href="/reviews" className="hover:text-nex-blue dark:hover:text-nex-blueLight">Customer Reviews</Link></li>
              <li><Link href="/verify" className="hover:text-nex-blue dark:hover:text-nex-blueLight">Verify Certificate</Link></li>
            </ul>
          </div>

          {/* Contact & Service Areas */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Contact &amp; Service Areas
            </h4>
            <ul className="mt-3.5 flex flex-col gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              {business.phones.map((phone, i) => (
                <li key={phone}>
                  <a
                    href={`tel:${business.phoneLinks[i]}`}
                    className="inline-flex items-center gap-2 font-medium hover:text-nex-blue dark:hover:text-nex-blueLight"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0 text-nex-blue" /> {phone}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="inline-flex items-center gap-2 font-medium hover:text-nex-blue dark:hover:text-nex-blueLight"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-nex-blue" /> {business.email}
                </a>
              </li>
              <li className="pt-2 border-t border-slate-200 dark:border-white/10">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-nex-blue" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Service Areas:</span>
                    <span className="font-medium text-nex-blue dark:text-nex-blueLight">
                      Bengaluru | Tumkur | Hiriyur — Coming Soon
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 dark:border-white/[0.06] pt-6 text-xs text-slate-500 dark:text-slate-400 sm:flex-row">
          <p>© {year || 2026} Nex LapTech. All rights reserved.</p>
          <p className="font-medium">Service Areas: Bengaluru | Tumkur | Hiriyur — Coming Soon</p>
        </div>
      </div>
    </footer>
  );
}

