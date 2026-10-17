"use client";

import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Wrench,
  Cpu,
  Video,
  Wifi,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Laptop,
  CheckCircle2,
  Search,
} from "lucide-react";

export default function Hero() {
  const router = useRouter();

  // 6 Primary Customer Action Cards
  const primaryActionCards = [
    {
      title: "Buy a Computer",
      desc: "Laptops, Gaming PCs, Monitors & Accessories with warranty",
      icon: ShoppingBag,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      borderColor: "border-blue-200 dark:border-blue-800/40",
      textColor: "text-blue-700 dark:text-blue-300",
      href: "/products",
    },
    {
      title: "Repair My Device",
      desc: "Laptop repair, screen replacement, power & liquid damage diagnosis",
      icon: Wrench,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      borderColor: "border-amber-200 dark:border-amber-800/40",
      textColor: "text-amber-700 dark:text-amber-300",
      href: "/services?category=repair",
    },
    {
      title: "Upgrade My Computer",
      desc: "Speed up slow PCs with 1TB SSD & RAM upgrades in minutes",
      icon: Cpu,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      borderColor: "border-emerald-200 dark:border-emerald-800/40",
      textColor: "text-emerald-700 dark:text-emerald-300",
      href: "/services?category=upgrade",
    },
    {
      title: "Install CCTV",
      desc: "Security camera setup for home, office & shop protection",
      icon: Video,
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      borderColor: "border-purple-200 dark:border-purple-800/40",
      textColor: "text-purple-700 dark:text-purple-300",
      href: "/products?category=cctv",
    },
    {
      title: "Fix My WiFi",
      desc: "WiFi router setup, office networking & internet troubleshooting",
      icon: Wifi,
      color: "from-cyan-500 to-blue-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/40",
      borderColor: "border-cyan-200 dark:border-cyan-800/40",
      textColor: "text-cyan-700 dark:text-cyan-300",
      href: "/services?category=wifi",
    },
    {
      title: "Talk to an Expert",
      desc: "Get free technical advice, quotes & doorstep support",
      icon: MessageSquare,
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
      borderColor: "border-rose-200 dark:border-rose-800/40",
      textColor: "text-rose-700 dark:text-rose-300",
      href: "/contact",
    },
  ];

  // Popular Things Customers Do
  const popularActions = [
    { label: "Buy a Laptop", href: "/products?category=business_laptops" },
    { label: "Repair a Laptop", href: "/services?category=repair" },
    { label: "Upgrade RAM / SSD", href: "/services?category=upgrade" },
    { label: "Build a Gaming PC", href: "/products?category=gaming_pcs" },
    { label: "Install CCTV", href: "/products?category=cctv" },
    { label: "Fix WiFi", href: "/services?category=wifi" },
    { label: "Book a Service", href: "/services" },
  ];

  return (
    <section className="relative w-full pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Soft Ambient Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-96 w-full max-w-7xl bg-gradient-to-b from-blue-100/60 dark:from-blue-950/30 to-transparent blur-3xl opacity-70" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Customer Headline & Subtext */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-nex-blue/10 border border-nex-blue/20 px-3.5 py-1 text-xs font-bold text-nex-blue dark:text-nex-blueLight mb-4 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>NEXLAPTECH Services</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            How Can We Help You Today?
          </h1>

          <p className="mt-3.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Buy computers, repair your device, upgrade your system, or book a service — NexLapTech makes it simple.
          </p>

          {/* Quick Search Input */}
          <div className="mt-6 max-w-xl mx-auto">
            <button
              onClick={() => {
                const searchBtn = document.querySelector('button[aria-label="Smart Search"]') as HTMLButtonElement;
                if (searchBtn) searchBtn.click();
              }}
              className="w-full flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-3 text-xs sm:text-sm text-slate-400 dark:text-slate-500 shadow-lg hover:border-nex-blue transition-all"
            >
              <div className="flex items-center gap-3">
                <Search className="h-4.5 w-4.5 text-nex-blue" />
                <span>What are you looking for? (e.g. laptop, slow computer, wifi...)</span>
              </div>
              <span className="rounded-lg bg-slate-100 dark:bg-white/10 px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                Search
              </span>
            </button>
          </div>
        </div>

        {/* 6 Primary Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-12">
          {primaryActionCards.map((card, idx) => {
            const IconComp = card.icon;
            return (
              <div
                key={idx}
                onClick={() => router.push(card.href)}
                className={`group cursor-pointer rounded-2xl p-5 border ${card.bgColor} ${card.borderColor} transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between relative overflow-hidden`}
              >
                <div>
                  <div className={`h-12 w-12 rounded-xl bg-white dark:bg-slate-900 border ${card.borderColor} flex items-center justify-center mb-3.5 ${card.textColor} shadow-sm group-hover:scale-105 transition-transform`}>
                    <IconComp className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                  <span className={`text-xs font-bold ${card.textColor}`}>Start Workflow</span>
                  <ArrowRight className={`h-4 w-4 ${card.textColor} group-hover:translate-x-1 transition-transform`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Popular Things Customers Do */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-md text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Popular Things Customers Do
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {popularActions.map((act, i) => (
              <button
                key={i}
                onClick={() => router.push(act.href)}
                className="rounded-full bg-slate-100 hover:bg-nex-blue hover:text-white dark:bg-white/5 dark:hover:bg-nex-blue border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-sm"
              >
                {act.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Doorstep &amp; On-Site Support
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Verified Warranty Included
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Simple &amp; Fast Booking
          </span>
        </div>
      </div>
    </section>
  );
}
