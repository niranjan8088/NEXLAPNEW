"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tag, Copy, Check, ShoppingBag, Wrench, ShieldCheck, Sparkles, Filter, ExternalLink } from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";
import { cn } from "@/lib/utils";

export default function CustomerOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "products" | "services">("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const list = await dbHelper.offers.list();
      const todayStr = new Date().toISOString().split("T")[0];

      // Filter only active, non-expired offers for customer display (Req #4)
      const valid = list.filter((o: any) => {
        const isActive = (o.status || "ACTIVE") === "ACTIVE";
        const expiry = o.expiryDate || o.expiry_date || "2099-12-31";
        const notExpired = todayStr <= expiry;
        return isActive && notExpired;
      });

      setOffers(valid);
    } catch (err) {
      console.error("Failed to load offers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredOffers = offers.filter((o) => {
    const isService = o.offerName?.toLowerCase().includes("repair") || o.offerCode?.toLowerCase().includes("repair") || o.offerName?.toLowerCase().includes("service");
    if (filterTab === "products") return !isService;
    if (filterTab === "services") return isService;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E6EAF0] dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
          <Tag className="h-3.5 w-3.5 text-amber-500" /> Offers for You
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Save More on Your NexByte Purchase
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Copy promo codes and apply them during checkout or service booking to unlock instant savings on laptops, parts, and technician services.
        </p>

        {/* Tab Filters (Req #4) */}
        <div className="pt-2 flex items-center gap-2">
          {(["all", "products", "services"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-bold capitalize transition-all border shadow-sm",
                filterTab === tab
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100"
              )}
            >
              {tab === "all" ? "All Offers" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Offers List Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-semibold">Loading active offers...</div>
      ) : filteredOffers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-500 space-y-1">
          <Tag className="h-8 w-8 mx-auto text-slate-300" />
          <p className="font-bold text-slate-700 dark:text-slate-300">No active offers currently available in this category.</p>
          <p>Check back soon for upcoming seasonal discounts &amp; promo codes!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOffers.map((offer) => {
            const code = offer.offerCode || offer.offer_code;
            const title = offer.offerName || offer.offer_name;
            const desc = offer.description || "Valid on eligible hardware & services.";
            const discountLabel = offer.discountType === "percentage" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`;
            const isCopied = copiedCode === code;
            const isService = title?.toLowerCase().includes("repair") || code?.toLowerCase().includes("repair");
            const targetUrl = isService ? "/customer/services" : `/customer/shop?offer=${code}`;

            return (
              <div
                key={offer.id}
                className="rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                      {isService ? <Wrench className="h-6 w-6" /> : <ShoppingBag className="h-6 w-6" />}
                    </div>
                    <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 px-3 py-1 text-xs font-extrabold">
                      {discountLabel}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {desc}
                  </p>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1">
                    {offer.minimumPurchase > 0 && <div>Min. purchase: ₹{(offer.minimumPurchase).toLocaleString("en-IN")}</div>}
                    {offer.maximumDiscount > 0 && <div>Max. discount: ₹{(offer.maximumDiscount).toLocaleString("en-IN")}</div>}
                  </div>
                </div>

                {/* Coupon Box & Action */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800">
                    <span className="font-mono text-xs font-extrabold tracking-widest text-indigo-700 dark:text-indigo-300 pl-2">
                      {code}
                    </span>
                    <button
                      onClick={() => handleCopy(code)}
                      className="flex items-center gap-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-400" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Valid until: {offer.expiryDate || offer.expiry_date || "2026-12-31"}</span>
                    <Link
                      href={targetUrl}
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>{isService ? "Book Service" : "View Eligible Products"} →</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
