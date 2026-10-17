"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";

export default function CustomerFavoritesPage() {
  const cartAddItem = useCartStore((s) => s.addItem);
  const cartOpen = useCartStore((s) => s.openCart);

  const [favorites, setFavorites] = useState([
    {
      id: "fav-1",
      name: "NexLapTech ROG Slayer R15 Gaming PC",
      category: "Gaming PC",
      price: 98500,
      image: "/images/product-gaming-desktops.png",
    },
    {
      id: "fav-2",
      name: "MacBook Pro 16\" M1 Pro (Pre-Owned)",
      category: "Laptops",
      price: 115000,
      image: "/images/product-second-hand-laptops.png",
    },
  ]);

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E6EAF0] dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-300">
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> Saved Hardware
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Favorites
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Quickly access your saved computers, laptops, and custom builds.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-12 text-center space-y-3 shadow-sm">
          <Heart className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
            No saved items
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven&apos;t saved any hardware items yet. Browse products and tap the heart icon to save items.
          </p>
          <Link
            href="/customer/shop"
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs px-4 py-2 shadow-sm hover:bg-sky-700 transition-colors"
          >
            <span>Browse Products</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">{item.category}</span>
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">{item.name}</h3>
                <p className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                  ₹{item.price.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 gap-2">
                <button
                  onClick={() => removeFavorite(item.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
                <button
                  onClick={() => {
                    cartAddItem({
                      id: item.id,
                      title: item.name,
                      price: item.price,
                      image: item.image,
                      category: item.category,
                    });
                    cartOpen();
                  }}
                  className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
