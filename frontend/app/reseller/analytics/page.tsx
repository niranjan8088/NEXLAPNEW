"use client";

import { useEffect, useState } from "react";
import { TrendingUp, ShoppingBag, Package, DollarSign } from "lucide-react";

export default function ResellerAnalyticsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, o] = await Promise.all([
          fetch("/api/reseller/products").then(r => r.ok ? r.json() : { products: [] }),
          fetch("/api/reseller/orders").then(r => r.ok ? r.json() : { orders: [] }),
        ]);
        setProducts(p.products || []);
        setOrders(o.orders || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const revenue = orders.filter(o => ["delivered", "confirmed"].includes(o.status))
    .reduce((s, o) => s + (o.total || 0), 0);

  const stats = [
    { label: "Total Products", value: products.length, icon: ShoppingBag, color: "text-nex-blueLight" },
    { label: "Total Orders", value: orders.length, icon: Package, color: "text-purple-400" },
    { label: "Confirmed Revenue", value: `₹${revenue.toLocaleString("en-IN")}`, icon: DollarSign, color: "text-green-400" },
    { label: "Pending Orders", value: orders.filter(o => o.status === "pending").length, icon: TrendingUp, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Analytics</h1>
        <p className="text-xs text-nex-mist mt-0.5">Performance overview of your reseller business.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="glass-panel p-5 rounded-2xl bg-nex-ink border border-white/5">
            <s.icon className={`h-5 w-5 mb-3 ${s.color}`} />
            <div className="font-display text-2xl font-bold text-white">{loading ? "—" : s.value}</div>
            <div className="text-[10px] text-nex-mist font-semibold uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="text-center py-16 glass-panel rounded-2xl border border-white/5">
        <TrendingUp className="h-10 w-10 text-nex-mist mx-auto mb-3" />
        <p className="text-xs text-white">Detailed charts and reports coming soon.</p>
      </div>
    </div>
  );
}
