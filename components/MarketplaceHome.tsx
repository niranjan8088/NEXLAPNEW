"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Camera,
  Cpu,
  HardDrive,
  Keyboard,
  Laptop,
  Monitor,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Product } from "@/lib/data";
import { getSafeImageSrc } from "@/lib/utils";
import { useCartStore } from "@/lib/cartStore";

interface MarketplaceHomeProps {
  hasAdminSession?: boolean;
  hasResellerSession?: boolean;
  hasUserSession?: boolean;
}

const categories = [
  { label: "Laptops", query: "business_laptops", Icon: Laptop, tone: "blue" },
  { label: "Gaming PCs", query: "gaming_pcs", Icon: Cpu, tone: "violet" },
  { label: "Storage", query: "storage", Icon: HardDrive, tone: "cyan" },
  { label: "Peripherals", query: "peripherals", Icon: Keyboard, tone: "amber" },
  { label: "Monitors", query: "monitors", Icon: Monitor, tone: "emerald" },
  { label: "CCTV & security", query: "cctv", Icon: Camera, tone: "rose" },
];

export default function MarketplaceHome({
  hasAdminSession = false,
  hasResellerSession = false,
  hasUserSession = false,
}: MarketplaceHomeProps) {
  const router = useRouter();
  const addToCart = useCartStore((store) => store.addItem);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/public/products?sortBy=newest")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load products");
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        const available = (data.products || []).filter(
          (product: Product) => product.status !== "hide" && product.status !== "deleted" && product.status !== "pending"
        );
        setProducts(available.sort((left: Product, right: Product) => Number(right.featured) - Number(left.featured)));
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
  };

  const activePortals = [
    hasUserSession && { label: "Customer account", href: "/customer" },
    hasResellerSession && { label: "Reseller portal", href: "/reseller" },
    hasAdminSession && { label: "Admin console", href: "/admin" },
  ].filter(Boolean) as { label: string; href: string }[];

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#f6f9fd] text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-[0_12px_40px_rgba(30,64,175,0.07)]">
          <div className="grid items-center gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-14">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800">
                <Sparkles className="h-3.5 w-3.5" /> Technology, thoughtfully sourced
              </div>
              <h1 className="max-w-2xl font-display text-3xl font-extrabold leading-tight text-slate-950 sm:text-5xl">
                Find the right tech. Make it yours.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Shop laptops, components, gaming systems, and trusted accessories with local support from Nex LapTech.
              </p>
              <form onSubmit={submitSearch} className="mt-6 flex max-w-2xl gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                <Search className="ml-2 mt-2.5 h-5 w-5 shrink-0 text-blue-700" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search laptops, SSDs, RAM, brands..."
                  aria-label="Search products"
                  className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button type="submit" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800">
                  Search <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              {activePortals.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activePortals.map((portal) => (
                    <Link key={portal.href} href={portal.href} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100">
                      Open {portal.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="relative min-h-56 overflow-hidden rounded-2xl bg-[linear-gradient(120deg,#eff6ff,#ecfeff)] p-6 sm:min-h-72 sm:p-8">
              <div className="relative z-10 max-w-[58%]">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Shop with confidence</p>
                <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">Your next setup starts here.</h2>
                <Link href="/products" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-800 hover:text-blue-950">
                  Browse all products <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {products[0]?.image ? (
                <img src={getSafeImageSrc(products[0].image)} alt={products[0].title} className="absolute -bottom-2 -right-3 h-[82%] w-[54%] object-contain drop-shadow-xl" />
              ) : (
                <Laptop aria-hidden="true" className="absolute -bottom-7 -right-5 h-48 w-48 text-blue-300/70 sm:h-64 sm:w-64" strokeWidth={0.8} />
              )}
            </div>
          </div>
        </section>

        <section className="mt-9" aria-labelledby="shop-categories-title">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Browse by department</p>
              <h2 id="shop-categories-title" className="mt-1 font-display text-xl font-extrabold text-slate-950 sm:text-2xl">Shop categories</h2>
            </div>
            <Link href="/products" className="hidden items-center gap-1 text-sm font-bold text-blue-800 hover:text-blue-950 sm:inline-flex">
              All categories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map(({ label, query, Icon, tone }) => {
              const toneStyles: Record<string, string> = {
                blue: "bg-blue-50 text-blue-700 group-hover:bg-blue-100",
                violet: "bg-violet-50 text-violet-700 group-hover:bg-violet-100",
                cyan: "bg-cyan-50 text-cyan-700 group-hover:bg-cyan-100",
                amber: "bg-amber-50 text-amber-700 group-hover:bg-amber-100",
                emerald: "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100",
                rose: "bg-rose-50 text-rose-700 group-hover:bg-rose-100",
              };
              return (
                <Link key={query} href={`/products?category=${query}`} className="group flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${toneStyles[tone]}`}><Icon className="h-5 w-5" /></span>
                  <span className="text-xs font-bold text-slate-800">{label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="featured-products-title">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Picked for your setup</p>
              <h2 id="featured-products-title" className="mt-1 font-display text-xl font-extrabold text-slate-950 sm:text-2xl">Featured products</h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-1 text-sm font-bold text-blue-800 hover:text-blue-950">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />)}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <ShoppingBag className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-semibold text-slate-800">Products are being prepared.</p>
              <Link href="/products" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-blue-700">Explore the catalog <ArrowRight className="h-4 w-4" /></Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product) => {
                const comparePrice = Number(product.compareAtPrice || 0);
                const price = Number(product.price || 0);
                const discount = comparePrice > price && comparePrice > 0 ? Math.round((1 - price / comparePrice) * 100) : Number(product.discount || 0);
                return (
                  <article key={product.id} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
                    <Link href={`/products/${product.id}`} className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-50 p-4">
                      {discount > 0 && <span className="absolute left-3 top-3 z-10 rounded-full bg-blue-700 px-2.5 py-1 text-[10px] font-bold text-white">{discount}% OFF</span>}
                      <img src={getSafeImageSrc(product.image)} alt={product.title} loading="lazy" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
                    </Link>
                    <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="truncate text-[10px] font-bold uppercase tracking-wider text-blue-700">{product.brand || product.category.replaceAll("_", " ")}</span>
                        <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-emerald-700"><ShieldCheck className="h-3 w-3" /> Verified</span>
                      </div>
                      <Link href={`/products/${product.id}`} className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-900 hover:text-blue-800">{product.title}</Link>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="font-display text-lg font-extrabold text-slate-950">₹{price.toLocaleString("en-IN")}</span>
                        {comparePrice > price && <span className="text-xs text-slate-500 line-through">₹{comparePrice.toLocaleString("en-IN")}</span>}
                      </div>
                      <button onClick={() => addToCart({ id: product.id, title: product.title, price, image: product.image, category: product.category })} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-blue-800">
                        <ShoppingBag className="h-3.5 w-3.5" /> Add to cart
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-3 border-y border-slate-200 py-5 sm:grid-cols-3">
          <div className="flex items-center gap-3 px-1"><Truck className="h-5 w-5 text-blue-700" /><span className="text-sm font-semibold text-slate-700">Delivery estimates shown at checkout</span></div>
          <div className="flex items-center gap-3 px-1"><ShieldCheck className="h-5 w-5 text-emerald-700" /><span className="text-sm font-semibold text-slate-700">Warranty-backed product options</span></div>
          <div className="flex items-center gap-3 px-1"><Wrench className="h-5 w-5 text-cyan-800" /><span className="text-sm font-semibold text-slate-700">Local setup and repair support</span></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
