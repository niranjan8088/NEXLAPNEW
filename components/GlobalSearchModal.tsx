"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ShoppingBag,
  Wrench,
  GraduationCap,
  Briefcase,
  Tag,
  HelpCircle,
  ArrowRight,
  Laptop,
  Wifi,
  Video,
  HardDrive,
  Cpu,
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";
import { Product } from "@/lib/data";
import { safeJsonFetch } from "@/lib/apiHelper";

interface SearchResultItem {
  id: string;
  title: string;
  category: "product" | "service" | "training" | "internship" | "offer" | "support";
  subtitle: string;
  href: string;
  badge?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    // Load products and active offers for live search
    let mounted = true;
    dbHelper.products.list().then((list) => {
      if (mounted) setProducts(list);
    }).catch(() => {});

    safeJsonFetch("/api/offers").then((res) => {
      if (mounted && res.ok && res.data?.offers) {
        setOffers(res.data.offers.filter((o: any) => o.status === "active"));
      }
    }).catch(() => {});

    return () => { mounted = false; };
  }, [isOpen]);

  // Static services, training, internships & support items for instant lookup
  const staticServices = [
    { id: "s1", title: "Laptop Repair & Problem Diagnosis", desc: "Fix screen, keyboard, battery, liquid damage, power issues", href: "/services?category=repair" },
    { id: "s2", title: "Desktop & PC Repair", desc: "Component replacement, motherboard fix, power supply replacement", href: "/services?category=desktop" },
    { id: "s3", title: "SSD & RAM Computer Upgrade", desc: "Speed up slow computers with 1TB SSD & RAM upgrades", href: "/services?category=upgrade" },
    { id: "s4", title: "WiFi & Internet Setup", desc: "Fix router issues, LAN wiring, office networking setup", href: "/services?category=wifi" },
    { id: "s5", title: "CCTV Security Camera Setup", desc: "HD & IP camera installation, DVR configuration, mobile streaming", href: "/services?category=cctv" },
    { id: "s6", title: "Regular Business Computer Support (AMC)", desc: "Annual maintenance contracts & IT support for offices", href: "/services?category=amc" },
    { id: "s7", title: "Data Recovery & Backup", desc: "Recover lost files, photos, hard disk failure recovery", href: "/services?category=data" },
  ];

  const staticTraining = [
    { id: "t1", title: "Practical Hardware & Laptop Repair Course", desc: "4-week hands-on training on motherboard diagnosis & chip repair", href: "/training" },
    { id: "t2", title: "CCTV & Security Systems Course", desc: "Learn IP camera setup, networking & DVR setup", href: "/training" },
  ];

  const staticInternships = [
    { id: "i1", title: "Hardware Systems & Embedded Internship", desc: "IEEE mini & major projects, hands-on hardware engineering", href: "/internship" },
    { id: "i2", title: "Network & Systems Administration Internship", desc: "Practical IT infrastructure, cloud & server setup", href: "/internship" },
  ];

  const staticSupport = [
    { id: "sup1", title: "Track My Order or Repair Request", desc: "Enter Request ID (REQ-2026-...) to see real-time progress", href: "/customer/requests" },
    { id: "sup2", title: "Contact Customer Expert Support", desc: "Phone lines: 8088979706 / 8904760125 or WhatsApp support", href: "/contact" },
    { id: "sup3", title: "Verify Training Certificate", desc: "Enter Certificate Registration ID to verify official Nex LapTech credentials", href: "/verify" },
  ];

  // Smart Intent Resolution
  const intentPills = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const intents = [];
    if (q.includes("laptop") || q.includes("macbook") || q.includes("notebook")) {
      intents.push({ label: "Buy Laptops", href: "/products?category=business_laptops", icon: Laptop });
      intents.push({ label: "Laptop Repair", href: "/services?category=repair", icon: Wrench });
    }
    if (q.includes("slow") || q.includes("hang") || q.includes("boost") || q.includes("ssd") || q.includes("ram")) {
      intents.push({ label: "Computer Upgrade & Speedup", href: "/services?category=upgrade", icon: Cpu });
      intents.push({ label: "Shop Fast SSDs", href: "/products?category=storage", icon: HardDrive });
    }
    if (q.includes("camera") || q.includes("cctv") || q.includes("security") || q.includes("dvr")) {
      intents.push({ label: "CCTV Products", href: "/products?category=cctv", icon: Video });
      intents.push({ label: "CCTV Setup Service", href: "/services?category=cctv", icon: Wrench });
    }
    if (q.includes("wifi") || q.includes("internet") || q.includes("network") || q.includes("router")) {
      intents.push({ label: "Fix WiFi Setup", href: "/services?category=wifi", icon: Wifi });
      intents.push({ label: "Networking Gear", href: "/products?category=networking", icon: HardDrive });
    }
    return intents;
  }, [query]);

  // Unified Search Results
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const list: SearchResultItem[] = [];

    // Search Products
    products.forEach((p) => {
      if (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      ) {
        list.push({
          id: `prod-${p.id}`,
          title: p.title,
          category: "product",
          subtitle: `₹${(p.price || 0).toLocaleString("en-IN")} • ${p.warranty || "Warranty included"}`,
          href: `/products?search=${encodeURIComponent(p.title)}`,
          badge: "Shop Product",
        });
      }
    });

    // Search Services
    staticServices.forEach((s) => {
      if (s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)) {
        list.push({
          id: `serv-${s.id}`,
          title: s.title,
          category: "service",
          subtitle: s.desc,
          href: s.href,
          badge: "Service",
        });
      }
    });

    // Search Training
    staticTraining.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)) {
        list.push({
          id: `train-${t.id}`,
          title: t.title,
          category: "training",
          subtitle: t.desc,
          href: t.href,
          badge: "Training",
        });
      }
    });

    // Search Internships
    staticInternships.forEach((i) => {
      if (i.title.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)) {
        list.push({
          id: `intern-${i.id}`,
          title: i.title,
          category: "internship",
          subtitle: i.desc,
          href: i.href,
          badge: "Internship",
        });
      }
    });

    // Search Offers
    offers.forEach((o) => {
      if (
        o.code.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        (o.description && o.description.toLowerCase().includes(q))
      ) {
        list.push({
          id: `offer-${o.id}`,
          title: `${o.code} — ${o.title}`,
          category: "offer",
          subtitle: o.description || `Get ${o.discount_value}${o.discount_type === "percentage" ? "% OFF" : " Flat Discount"}`,
          href: "/offers",
          badge: "Active Coupon",
        });
      }
    });

    // Search Support
    staticSupport.forEach((sup) => {
      if (sup.title.toLowerCase().includes(q) || sup.desc.toLowerCase().includes(q)) {
        list.push({
          id: `sup-${sup.id}`,
          title: sup.title,
          category: "support",
          subtitle: sup.desc,
          href: sup.href,
          badge: "Get Help",
        });
      }
    });

    return list.slice(0, 12);
  }, [query, products, offers]);

  if (!isOpen) return null;

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4 sm:px-6">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl z-10 transition-all">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-200 dark:border-white/10 px-4 py-3.5">
          <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for? (e.g. laptop, slow computer, wifi, camera...)"
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white mr-1">
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 dark:bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20"
          >
            ESC
          </button>
        </div>

        {/* Smart Intent Suggestions */}
        {intentPills.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mr-1">
              Quick Intent:
            </span>
            {intentPills.map((pill, i) => {
              const IconComp = pill.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(pill.href)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-nex-blue/10 hover:bg-nex-blue/20 text-nex-blue dark:text-nex-blueLight border border-nex-blue/20 px-3 py-1 text-xs font-semibold transition-all"
                >
                  <IconComp className="h-3.5 w-3.5" />
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
          {query.trim() === "" ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Try searching for simple customer topics:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: "🛒 Buy a Laptop", q: "laptop" },
                  { label: "⚡ Slow Computer Upgrade", q: "slow computer" },
                  { label: "📹 CCTV Camera", q: "camera" },
                  { label: "🌐 Fix WiFi Setup", q: "wifi problem" },
                  { label: "🏷️ Active Offers", q: "offer" },
                  { label: "📦 Track Request", q: "track" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(item.q)}
                    className="rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium transition-all"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              <HelpCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-800 dark:text-white">No exact matches found for &quot;{query}&quot;</p>
              <p className="mt-1">Try searching for &quot;laptop&quot;, &quot;repair&quot;, &quot;cctv&quot; or talk directly to our expert support.</p>
              <button
                onClick={() => handleSelect("/contact")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-nex-blue text-white px-4 py-2 font-bold text-xs shadow-md"
              >
                Talk to an Expert Support →
              </button>
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.href)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-left group border border-transparent hover:border-slate-200 dark:hover:border-white/10"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 text-nex-blue dark:text-nex-blueLight">
                    {item.category === "product" && <ShoppingBag className="h-4 w-4" />}
                    {item.category === "service" && <Wrench className="h-4 w-4" />}
                    {item.category === "training" && <GraduationCap className="h-4 w-4" />}
                    {item.category === "internship" && <Briefcase className="h-4 w-4" />}
                    {item.category === "offer" && <Tag className="h-4 w-4" />}
                    {item.category === "support" && <HelpCircle className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2.5 py-0.5 uppercase">
                    {item.badge}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-nex-blue dark:group-hover:text-nex-blueLight group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-200 dark:border-white/10 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Search across Products, Services, Training, Offers &amp; Tracking</span>
          <span className="font-semibold text-nex-blue dark:text-nex-blueLight">Nex LapTech Smart Search</span>
        </div>
      </div>
    </div>
  );
}
