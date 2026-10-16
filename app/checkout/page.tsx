"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerHeader from "@/components/CustomerHeader";
import { useCartStore } from "@/lib/cartStore";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle2,
  Tag,
  ArrowRight,
  AlertCircle,
  FileText,
  Lock,
  ChevronRight,
  Check,
  Package
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, getTotal, appliedOfferCode, setAppliedOfferCode } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState<any | null>(null);

  // Customer Contact State
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Address State
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("Tumkur");
  const [state, setState] = useState("Karnataka");
  const [pincode, setPincode] = useState("572101");

  // Delivery Option State
  const [deliveryOption, setDeliveryOption] = useState<"standard" | "express">("standard");

  // B2B GST Invoice State
  const [isGstInvoice, setIsGstInvoice] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");

  // Coupon & Offer State
  const [couponCode, setCouponCode] = useState(appliedOfferCode);
  const [appliedOffer, setAppliedOffer] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI" | "BANK">("COD");

  // Load customer profile if logged in
  useEffect(() => {
    async function loadCustomerProfile() {
      try {
        const res = await fetch("/api/customer/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCustomerName(data.user.full_name || data.user.name || "");
            setCustomerEmail(data.user.email || "");
            setCustomerPhone(data.user.phone || "");
            if (data.user.address) setAddressLine1(data.user.address);
            if (data.user.city) setCity(data.user.city);
            if (data.user.pincode) setPincode(data.user.pincode);
          }
        }
      } catch (e) {
        // Guest mode fallback
      }
    }

    loadCustomerProfile();
  }, []);

  // Calculate Subtotals
  const cartSubtotal = getTotal();
  const discountAmount = appliedOffer ? appliedOffer.discountAmount : 0;
  const taxableSubtotal = Math.max(0, cartSubtotal - discountAmount);
  const shippingFee = deliveryOption === "express" ? 199 : (cartSubtotal < 1000 ? 99 : 0);
  const gstAmount = Math.round(taxableSubtotal * 0.18);
  const grandTotal = taxableSubtotal + gstAmount + shippingFee;

  // Apply Coupon
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await fetch("/api/offers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerCode: couponCode.trim(),
          cartItems: items,
          subtotalAmount: cartSubtotal,
        }),
      });

      const data = await res.json();
      if (data.valid) {
        const discountAmount = Number(data.discountAmount) || 0;
        setAppliedOffer({
          code: data.offer?.code || couponCode.trim().toUpperCase(),
          discountAmount,
        });
        setAppliedOfferCode(data.offer?.code || couponCode.trim().toUpperCase());
        setCouponMessage({
          type: "success",
          text: `Code ${data.offer?.code || couponCode.trim().toUpperCase()} applied! You save ₹${discountAmount.toLocaleString("en-IN")}`,
        });
      } else {
        setAppliedOffer(null);
        setAppliedOfferCode("");
        setCouponMessage({
          type: "error",
          text: data.error || "Invalid or expired offer code.",
        });
      }
    } catch (err) {
      setAppliedOfferCode("");
      setCouponMessage({ type: "error", text: "Failed to validate coupon code." });
    }
  };

  // Submit Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Your cart is empty. Please add products before checking out.");
      return;
    }

    if (!customerName || !customerEmail || !customerPhone) {
      setError("Please complete your contact details (Name, Email, Phone).");
      return;
    }

    if (!addressLine1 || !city || !pincode) {
      setError("Please complete your shipping address.");
      return;
    }

    if (isGstInvoice && !gstin.trim()) {
      setError("Please enter your 15-character GSTIN number.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
          },
          shippingAddress: {
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
          },
          deliveryOption,
          gstDetails: {
            isGstInvoice,
            companyName,
            gstin,
          },
          paymentMethod,
          offerCode: appliedOffer?.code || "",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to place order.");
        setLoading(false);
        return;
      }

      setOrderPlaced({ ...data.order, warning: data.warning });
      clearCart();
    } catch (err: any) {
      setError("Network error. Please try placing your order again.");
    } finally {
      setLoading(false);
    }
  };

  // ORDER SUCCESS SCREEN
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] text-slate-900">
        <CustomerHeader />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase rounded-full border border-emerald-200">
              Order Confirmed &amp; Invoiced
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900">Thank You For Your Order!</h1>
            <p className="text-sm text-slate-600">
              Order <code className="font-mono font-bold text-slate-900">#{orderPlaced.order_number || orderPlaced.order_id}</code> has been successfully received.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-left space-y-4 shadow-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 text-xs">
              <span className="text-slate-500 font-semibold">Grand Total Paid / Due</span>
              <span className="text-lg font-extrabold text-[#2563EB]">
                ₹{(orderPlaced.total_amount || grandTotal).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="text-xs space-y-1 text-slate-600">
              <p><strong className="text-slate-900">Deliver to:</strong> {customerName}, {addressLine1}, {city} - {pincode}</p>
              <p><strong className="text-slate-900">Delivery Status:</strong> {orderPlaced.status || "Confirmed"} via {orderPlaced.courier}</p>
              <p><strong className="text-slate-900">Tracking Number:</strong> <span className="font-mono">{orderPlaced.tracking_number}</span></p>
              {orderPlaced.applied_offer_code && (
                <p><strong className="text-slate-900">Offer Applied:</strong> {orderPlaced.applied_offer_code} (₹{Number(orderPlaced.discount_amount || 0).toLocaleString("en-IN")} saved)</p>
              )}
            </div>
            {orderPlaced.warning && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">{orderPlaced.warning}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/customer/orders"
              className="px-6 py-3 bg-[#2563EB] text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20"
            >
              <Package className="w-4 h-4" />
              <span>View In Orders &amp; Track Live</span>
            </Link>
            <Link
              href={`/invoice/view/${orderPlaced.id}`}
              target="_blank"
              className="px-6 py-3 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition flex items-center justify-center space-x-2 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Download Tax Invoice</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART SCREEN
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] text-slate-900">
        <CustomerHeader />
        <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h1>
          <p className="text-xs text-slate-500">Please add products to your cart before proceeding to checkout.</p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-[#2563EB] text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-900 pb-20">
      <CustomerHeader />

      {/* Breadcrumb Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Link href="/customer" className="hover:text-[#2563EB]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/products" className="hover:text-[#2563EB]">Products</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Secure Checkout</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">Complete Your Hardware Order</h1>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: CUSTOMER DETAILS, ADDRESS & OPTIONS */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Customer Contact Details */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#2563EB] text-xs font-extrabold flex items-center justify-center">1</span>
                <span>Customer Information</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit Mobile Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="customer@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#2563EB] text-xs font-extrabold flex items-center justify-center">2</span>
                <span>Shipping Address</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    placeholder="House/Flat No., Building, Street Name"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    placeholder="Landmark, Area, Colony"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Delivery Options */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#2563EB] text-xs font-extrabold flex items-center justify-center">3</span>
                <span>Select Delivery Option</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setDeliveryOption("standard")}
                  className={`p-4 rounded-xl border text-left transition flex items-start space-x-3 ${
                    deliveryOption === "standard"
                      ? "border-[#2563EB] bg-blue-50/50 ring-2 ring-blue-500/20"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <Truck className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900">Standard Delivery</h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">3–5 Business Days</p>
                    <span className="font-bold text-emerald-600 block mt-1">
                      {cartSubtotal >= 1000 ? "FREE" : "₹99"}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryOption("express")}
                  className={`p-4 rounded-xl border text-left transition flex items-start space-x-3 ${
                    deliveryOption === "express"
                      ? "border-[#2563EB] bg-blue-50/50 ring-2 ring-blue-500/20"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <Truck className="w-5 h-5 text-[#7C3AED] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900">Priority Express</h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">1–2 Days Doorstep</p>
                    <span className="font-bold text-[#7C3AED] block mt-1">₹199</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 4. GST B2B Invoice Option */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-[#2563EB]" />
                  <h2 className="text-base font-bold text-slate-900">Need a GST B2B Invoice?</h2>
                </div>
                <input
                  type="checkbox"
                  checked={isGstInvoice}
                  onChange={(e) => setIsGstInvoice(e.target.checked)}
                  className="w-4 h-4 text-[#2563EB] rounded border-slate-300"
                />
              </div>

              {isGstInvoice && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Company Registered Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Nex LapTech Private Limited"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">GSTIN Number *</label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="15-character GST Number"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 5. Payment Methods */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#2563EB] text-xs font-extrabold flex items-center justify-center">4</span>
                <span>Payment Method</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-4 rounded-xl border text-left transition ${
                    paymentMethod === "COD"
                      ? "border-[#2563EB] bg-blue-50/50 ring-2 ring-blue-500/20 font-bold"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="block text-slate-900">Cash on Delivery</span>
                  <span className="text-[11px] text-slate-500 font-normal">Pay upon receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`p-4 rounded-xl border text-left transition ${
                    paymentMethod === "UPI"
                      ? "border-[#2563EB] bg-blue-50/50 ring-2 ring-blue-500/20 font-bold"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="block text-slate-900">UPI / QR Code</span>
                  <span className="text-[11px] text-slate-500 font-normal">Google Pay, PhonePe, Paytm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("BANK")}
                  className={`p-4 rounded-xl border text-left transition ${
                    paymentMethod === "BANK"
                      ? "border-[#2563EB] bg-blue-50/50 ring-2 ring-blue-500/20 font-bold"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="block text-slate-900">Direct Bank Transfer</span>
                  <span className="text-[11px] text-slate-500 font-normal">NEFT / RTGS</span>
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT: ORDER SUMMARY & FINAL BILL */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">

            {/* Cart Items List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Order Summary ({items.length} Items)</span>
                <Link href="/products" className="text-xs text-[#2563EB] hover:underline font-normal">
                  Edit Cart
                </Link>
              </h2>

              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 truncate max-w-[200px]">{item.title}</p>
                      <p className="text-slate-500">Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</p>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Input */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Promo / Referral Code</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. NEX10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs uppercase font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3.5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-xs font-medium ${
                    couponMessage.type === "success" ? "text-emerald-600" : "text-red-500"
                  }`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Price Calculation Matrix */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal</span>
                  <span>₹{cartSubtotal.toLocaleString("en-IN")}</span>
                </div>

                {appliedOffer && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({appliedOffer.code})</span>
                    <span>- ₹{appliedOffer.discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Estimated Shipping</span>
                  <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>GST (18% Tax Breakdown)</span>
                  <span>₹{gstAmount.toLocaleString("en-IN")}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Grand Total</span>
                  <span className="text-2xl font-extrabold text-[#2563EB]">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#2563EB] text-white font-extrabold text-sm rounded-xl hover:bg-blue-700 transition flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {loading ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Place Order &amp; Generate Invoice</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-slate-400 text-center space-y-1 pt-1">
                <p>🔒 256-Bit SSL Encrypted &amp; Server-Verified Transaction</p>
                <p>Official Nex LapTech Tax Invoice generated automatically upon placement.</p>
              </div>
            </div>

          </div>

        </form>
      </main>
    </div>
  );
}
