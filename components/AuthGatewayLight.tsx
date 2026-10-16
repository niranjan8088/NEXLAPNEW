"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  ChevronRight,
  Headphones,
  Laptop,
  PackageSearch,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  Wrench,
} from "lucide-react";

interface AuthGatewayLightProps {
  hasAdminSession?: boolean;
  hasResellerSession?: boolean;
  hasUserSession?: boolean;
}

const portals = [
  {
    name: "Customer",
    eyebrow: "SHOP & SERVICES",
    description: "Find technology, manage orders, book repairs, and get support.",
    href: "/customer/signin",
    activeHref: "/customer",
    features: ["Product marketplace", "Orders and service bookings", "Support and warranty"],
    Icon: ShoppingBag,
    tone: "blue",
  },
  {
    name: "Reseller",
    eyebrow: "PARTNER PORTAL",
    description: "Manage your catalog, inventory, orders, and business profile.",
    href: "/reseller/login",
    activeHref: "/reseller",
    features: ["Product and stock management", "Orders and earnings", "Business profile"],
    Icon: Building2,
    tone: "teal",
  },
  {
    name: "Administrator",
    eyebrow: "OPERATIONS CONSOLE",
    description: "Oversee customers, reseller partners, catalog, orders, and service.",
    href: "/admin/login",
    activeHref: "/admin",
    features: ["Customer and reseller access", "Catalog, orders, and bookings", "Reviews and reporting"],
    Icon: ShieldCheck,
    tone: "slate",
  },
];

export default function AuthGatewayLight({
  hasAdminSession = false,
  hasResellerSession = false,
  hasUserSession = false,
}: AuthGatewayLightProps) {
  const activePortals = [
    hasUserSession && { label: "Customer", href: "/customer", Icon: UserRound },
    hasResellerSession && { label: "Reseller", href: "/reseller", Icon: Building2 },
    hasAdminSession && { label: "Admin", href: "/admin", Icon: ShieldCheck },
  ].filter(Boolean) as { label: string; href: string; Icon: typeof UserRound }[];

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Nex LapTech home">
            <BrandLogo width={80} height={80} sizes="40px" priority className="h-10 w-10" />
            <span className="font-display text-lg font-extrabold tracking-tight">
              NEX LAPTECH
            </span>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
          >
            <Headphones className="h-4 w-4" />
            <span className="hidden sm:inline">Contact support</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-8 sm:pt-12">
        <section className="mb-8 flex flex-col justify-between gap-6 sm:mb-10 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
              <BadgeCheck className="h-3.5 w-3.5" /> Nex LapTech
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              Your technology, <span className="text-blue-700">all in one place.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Shop trusted hardware, coordinate service, or manage your Nex LapTech business account.
            </p>
          </div>
          <Link
            href="/customer/shop"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Explore the store <ArrowUpRight className="h-4 w-4" />
          </Link>
        </section>

        {activePortals.length > 0 && (
          <section aria-label="Active sessions" className="mb-6 flex flex-wrap gap-2">
            {activePortals.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={href}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                <Icon className="h-4 w-4" /> {label} session active <ChevronRight className="h-4 w-4" />
              </Link>
            ))}
          </section>
        )}

        <section aria-label="Choose a portal" className="grid gap-4 lg:grid-cols-3">
          {portals.map(({ name, eyebrow, description, href, activeHref, features, Icon, tone }, index) => {
            const hasSession =
              (name === "Customer" && hasUserSession) ||
              (name === "Reseller" && hasResellerSession) ||
              (name === "Administrator" && hasAdminSession);
            const destination = hasSession ? activeHref : href;
            const toneClasses = tone === "blue"
              ? { icon: "bg-blue-50 text-blue-700", eyebrow: "text-blue-700" }
              : tone === "teal"
                ? { icon: "bg-teal-50 text-teal-700", eyebrow: "text-teal-700" }
                : { icon: "bg-slate-100 text-slate-700", eyebrow: "text-slate-600" };

            return (
              <article
                key={name}
                className="group flex min-h-[310px] flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_12px_28px_rgba(15,23,42,0.09)] sm:p-6"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="mb-5 flex items-start justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClasses.icon}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  {hasSession && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Signed in</span>
                  )}
                </div>
                <p className={`text-[11px] font-bold tracking-[0.12em] ${toneClasses.eyebrow}`}>{eyebrow}</p>
                <h2 className="mt-1 font-display text-xl font-bold text-slate-950">{name}</h2>
                <p className="mt-2 min-h-12 text-sm leading-5 text-slate-600">{description}</p>
                <ul className="my-5 space-y-2.5 border-t border-slate-100 pt-4 text-sm text-slate-700">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={destination}
                  className="mt-auto inline-flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 transition group-hover:border-blue-700 group-hover:bg-blue-700 group-hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  {hasSession ? `Open ${name} portal` : `Continue as ${name.toLowerCase()}`}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </article>
            );
          })}
        </section>

        <section className="mt-8 grid gap-3 border-y border-slate-200 py-5 sm:grid-cols-3">
          <div className="flex items-center gap-3 px-1">
            <Laptop className="h-5 w-5 text-blue-700" />
            <span className="text-sm font-medium text-slate-700">Computers and accessories</span>
          </div>
          <div className="flex items-center gap-3 px-1">
            <Wrench className="h-5 w-5 text-teal-700" />
            <span className="text-sm font-medium text-slate-700">Repair and IT services</span>
          </div>
          <div className="flex items-center gap-3 px-1">
            <PackageSearch className="h-5 w-5 text-amber-700" />
            <span className="text-sm font-medium text-slate-700">Order and booking support</span>
          </div>
        </section>

        <footer className="flex flex-col justify-between gap-2 pt-5 text-xs text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} Nex LapTech</span>
          <span>Secure access for customers, partners, and administrators</span>
        </footer>
      </div>
    </main>
  );
}