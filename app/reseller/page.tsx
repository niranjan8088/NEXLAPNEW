"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag, Package, MessageSquare, TrendingUp, PlusCircle,
  BarChart3, AlertCircle, CheckCircle, Clock, Eye, ArrowRight,
  Zap, Star
} from "lucide-react";

export default function ResellerDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [resellerName, setResellerName] = useState("Reseller");
  const [resellerId, setResellerId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read session info from cookies
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split(";").reduce((acc: Record<string, string>, c) => {
        const [k, v] = c.trim().split("=");
        if (k) acc[k] = decodeURIComponent(v || "");
        return acc;
      }, {});
      const name = cookies["nexbyte_reseller_name"] || "Reseller";
      setResellerName(name);
      // Extract reseller ID from session cookie (format: mock-reseller:{id}:{email})
      // Since session is httpOnly, we rely on the reseller_name cookie
    }

    const load = async () => {
      try {
        const [prodRes, ordRes] = await Promise.all([
          fetch("/api/reseller/products"),
          fetch("/api/reseller/orders"),
        ]);
        if (prodRes.ok) {
          const d = await prodRes.json();
          setProducts(d.products || []);
        }
        if (ordRes.ok) {
          const d = await ordRes.json();
          setOrders(d.orders || []);
        }
      } catch {}
      setLoading(false);
    };
    load();

    const handler = () => load();
    window.addEventListener("nexbyte-realtime", handler);
    return () => window.removeEventListener("nexbyte-realtime", handler);
  }, []);

  const activeProducts = products.filter(p => p.status === "active" || p.approval_status === "approved");
  const pendingProducts = products.filter(p => p.approval_status === "pending" || p.status === "pending");
  const pendingOrders = orders.filter(o => o.status === "pending");
  const totalRevenue = orders
    .filter(o => o.status === "delivered" || o.status === "confirmed")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const stats = [
    {
      label: "Total Products", value: products.length, icon: ShoppingBag,
      color: "text-nex-blueLight", bg: "bg-nex-blue/10 border-nex-blue/20",
      href: "/reseller/products"
    },
    {
      label: "Active Products", value: activeProducts.length, icon: CheckCircle,
      color: "text-green-400", bg: "bg-green-500/10 border-green-500/20",
      href: "/reseller/products"
    },
    {
      label: "Pending Approval", value: pendingProducts.length, icon: Clock,
      color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20",
      href: "/reseller/products"
    },
    {
      label: "Total Orders", value: orders.length, icon: Package,
      color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20",
      href: "/reseller/orders"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 to-nex-blue/20 border border-purple-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-anim opacity-10 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-purple-300 font-semibold uppercase tracking-widest mb-1">Reseller Dashboard</p>
            <h1 className="font-display text-2xl font-bold text-white">
              Welcome back, {resellerName}!
            </h1>
            <p className="text-xs text-nex-mist mt-1">
              Manage your products, track orders, and grow your business with Nex LapTech.
            </p>
          </div>
          <Link href="/reseller/products/add"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-[0_0_20px_rgba(147,51,234,0.3)]">
            <PlusCircle className="h-4 w-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="glass-panel p-5 rounded-2xl bg-nex-ink border border-white/5 hover:border-white/10 transition-all group">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center border mb-3 ${s.bg}`}>
              <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
            </div>
            <div className="font-display text-2xl font-bold text-white group-hover:text-nex-blueLight transition-colors">
              {loading ? "—" : s.value}
            </div>
            <div className="text-[10px] text-nex-mist font-semibold uppercase tracking-wider mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Revenue + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue */}
        <div className="glass-panel p-6 rounded-2xl bg-nex-ink border border-white/5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <h3 className="font-display text-sm font-bold text-white">Revenue Summary</h3>
          </div>
          <div>
            <span className="text-[10px] text-nex-mist block uppercase">Confirmed Revenue</span>
            <span className="font-display text-3xl font-bold text-white mt-1 block">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-nex-mist block">Pending Orders</span>
              <span className="font-bold text-amber-400">{pendingOrders.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-nex-mist block">Total Orders</span>
              <span className="font-bold text-white">{orders.length}</span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass-panel p-6 rounded-2xl bg-nex-ink border border-white/5 lg:col-span-2">
          <h3 className="font-display text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-nex-blueLight" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Add Product", href: "/reseller/products/add", icon: PlusCircle, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
              { label: "View Orders", href: "/reseller/orders", icon: Package, color: "text-nex-blueLight", bg: "bg-nex-blue/10 border-nex-blue/20" },
              { label: "Messages", href: "/reseller/messages", icon: MessageSquare, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
              { label: "Analytics", href: "/reseller/analytics", icon: BarChart3, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
              { label: "My Products", href: "/reseller/products", icon: ShoppingBag, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
              { label: "Profile", href: "/reseller/profile", icon: Star, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
            ].map(action => (
              <Link key={action.label} href={action.href}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center hover:scale-[1.02] transition-all group ${action.bg}`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <span className="text-[11px] font-semibold text-white">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="glass-panel rounded-2xl bg-nex-ink border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-purple-400" /> Recent Products
          </h3>
          <Link href="/reseller/products" className="text-[11px] text-nex-blueLight hover:underline font-semibold flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {loading ? (
          <div className="py-12 text-center text-xs text-nex-mist">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingBag className="h-10 w-10 text-nex-mist mx-auto mb-3" />
            <p className="text-xs text-white">No products yet.</p>
            <Link href="/reseller/products/add" className="text-nex-blueLight text-xs underline mt-2 inline-block">
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/5 text-nex-mist font-semibold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-5">Product</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map(p => (
                  <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                    <td className="py-3 px-5 font-semibold text-white truncate max-w-[200px]">{p.title}</td>
                    <td className="py-3 px-4 text-white">₹{(p.price ?? 0).toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4 text-white/80">{p.stock ?? "—"}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        p.approval_status === "approved" || p.status === "active"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : p.approval_status === "pending"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        {p.approval_status || p.status || "pending"}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Link href={`/reseller/products/${p.id}/edit`}
                        className="text-nex-blueLight text-[10px] hover:underline font-semibold flex items-center gap-1 justify-end">
                        <Eye className="h-3 w-3" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alerts */}
      {pendingProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-white">
              {pendingProducts.length} product{pendingProducts.length > 1 ? "s" : ""} pending admin approval
            </p>
            <p className="text-[11px] text-nex-mist mt-0.5">
              Products must be approved by Nex LapTech admin before appearing in the public catalog.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
