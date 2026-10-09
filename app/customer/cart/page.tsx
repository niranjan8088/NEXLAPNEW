"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CustomerHeader from "@/components/CustomerHeader";
import { useCartStore } from "@/lib/cartStore";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Building,
  AlertCircle
} from "lucide-react";

export default function CustomerCartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const [appliedOffer, setAppliedOffer] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isGstEnabled, setIsGstEnabled] = useState(false);

  // Subtotal calculations
  const subtotal = getTotal();
  const discountAmount = appliedOffer ? appliedOffer.discountAmount : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  
  // Tax & Shipping
  const gstRate = 0.18;
  const gstAmount = isGstEnabled ? Math.round(taxableAmount * gstRate) : 0;
  const cgstAmount = Math.round(gstAmount / 2);
  const sgstAmount = gstAmount - cgstAmount;
  const shippingFee = subtotal >= 1000 || subtotal === 0 ? 0 : 99;
  const grandTotal = taxableAmount + gstAmount + shippingFee;

  // Single promotional discount validation
  const handleApplyOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await fetch("/api/offers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerCode: couponCode.trim(),
          cartItems: items,
          subtotalAmount: subtotal,
        }),
      });

      const data = await res.json();
      if (data.valid) {
        setAppliedOffer({
          code: couponCode.trim().toUpperCase(),
          discountAmount: data.discountAmount || 500,
        });
        setCouponMessage({
          type: "success",
          text: `🎉 Code ${couponCode.trim().toUpperCase()} applied! Savings: ₹${(data.discountAmount || 500).toLocaleString("en-IN")}`,
        });
      } else {
        setAppliedOffer(null);
        setCouponMessage({
          type: "error",
          text: data.error || "Invalid or expired code.",
        });
      }
    } catch (err) {
      setCouponMessage({ type: "error", text: "Failed to validate code." });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
        <CustomerHeader />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-[#2563EB]">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You have no items in your shopping cart. Explore our hardware catalog for laptops, components, and accessories.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              href="/products"
              className="px-6 py-3 bg-[#2563EB] text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pb-20">
      <CustomerHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Shopping Cart</h1>
            <p className="text-xs text-slate-500 mt-1">{items.length} hardware items selected</p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-red-500 hover:text-red-700 transition"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CART ITEMS LIST */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 p-1 flex-shrink-0">
                      <Image
                        src={item.image || "/images/poster-products.png"}
                        alt={item.title || "Cart item"}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 truncate max-w-xs">{item.title}</h3>
                      <p className="text-[11px] text-slate-500 capitalize">{item.category || "Hardware"}</p>
                      <span className="text-xs font-extrabold text-[#2563EB] block mt-1">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls & Remove */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                    <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        className="p-1 rounded-lg bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-xs text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-lg bg-white text-slate-600 hover:bg-slate-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-sm font-extrabold text-slate-900 w-24 text-right">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/products"
                className="text-xs font-bold text-[#2563EB] hover:underline flex items-center space-x-1"
              >
                <span>← Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* SUMMARY & PROMO */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5 sticky top-24">
            <h2 className="text-base font-bold text-slate-900">Order Summary</h2>

            {/* Promotional Code Input (Single Offer Enforced) */}
            <form onSubmit={handleApplyOffer} className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Referral or Coupon Code</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter Code (e.g. NEX10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs uppercase font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
                >
                  Apply
                </button>
              </div>
              <p className="text-[10px] text-slate-400">Note: Only one promotional discount can be applied per order.</p>
              {couponMessage && (
                <p className={`text-xs font-medium ${couponMessage.type === "success" ? "text-emerald-600" : "text-red-500"}`}>
                  {couponMessage.text}
                </p>
              )}
            </form>

            {/* GST B2B Invoice Toggle */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-slate-800">Add 18% GST B2B Invoice Tax</span>
              </div>
              <input
                type="checkbox"
                checked={isGstEnabled}
                onChange={(e) => setIsGstEnabled(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] rounded border-slate-300"
              />
            </div>

            {/* Financial Breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              {appliedOffer && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({appliedOffer.code})</span>
                  <span>- ₹{appliedOffer.discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal</span>
                <span>₹{taxableAmount.toLocaleString("en-IN")}</span>
              </div>

              {isGstEnabled && (
                <>
                  <div className="flex justify-between text-slate-500 text-[11px] pl-2">
                    <span>CGST (9%)</span>
                    <span>₹{cgstAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px] pl-2">
                    <span>SGST (9%)</span>
                    <span>₹{sgstAmount.toLocaleString("en-IN")}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Grand Total</span>
                <span className="text-2xl font-extrabold text-[#2563EB]">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full py-3.5 bg-[#2563EB] text-white font-extrabold text-sm rounded-xl hover:bg-blue-700 transition flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
