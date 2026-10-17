"use client";

import { useEffect, useState } from "react";
import { Package, Clock, CheckCircle, Truck, XCircle, Loader2, Search } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  confirmed: { label: "Confirmed", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  processing: { label: "Processing", cls: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  shipped: { label: "Shipped", cls: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  delivered: { label: "Delivered", cls: "bg-green-500/10 text-green-400 border-green-500/20" },
  cancelled: { label: "Cancelled", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export default function ResellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reseller/orders");
      if (res.ok) {
        const d = await res.json();
        setOrders(d.orders || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { dbHelper } = await import("@/lib/dbHelper");
      await dbHelper.orders.update(orderId, { status: newStatus });
      await load();
    } catch {}
    setUpdatingId(null);
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      (o.order_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const nextStatus: Record<string, string> = {
    pending: "confirmed",
    confirmed: "processing",
    processing: "shipped",
    shipped: "delivered",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">My Orders</h1>
        <p className="text-xs text-nex-mist mt-0.5">Track and manage customer orders for your products.</p>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-nex-ink flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-nex-mist" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by order ID or customer..."
            className="w-full rounded-xl bg-nex-black border border-white/[0.08] pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none" />
        </div>
        <div className="flex flex-wrap gap-1.5 bg-nex-black p-1 rounded-xl border border-white/10 text-xs">
          {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${statusFilter === s ? "bg-nex-blue text-white" : "text-nex-mist hover:text-white hover:bg-white/5"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-nex-blueLight mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <Package className="h-10 w-10 text-nex-mist mx-auto mb-3" />
          <p className="text-xs text-white">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(o => (
            <div key={o.id} className="glass-panel p-5 rounded-2xl border border-white/5 bg-nex-ink space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-xs font-bold text-nex-blueLight">{o.order_id}</span>
                  <span className="text-[10px] text-nex-mist ml-3">
                    {o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN") : ""}
                  </span>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${STATUS_CONFIG[o.status]?.cls || "bg-white/5 text-white/60 border-white/10"}`}>
                  {STATUS_CONFIG[o.status]?.label || o.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-nex-mist block font-semibold uppercase">Customer</span>
                  <span className="text-white font-medium">{o.customer_name || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-nex-mist block font-semibold uppercase">Product</span>
                  <span className="text-white font-medium truncate">{o.product_title || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-nex-mist block font-semibold uppercase">Amount</span>
                  <span className="text-white font-bold">₹{(o.total || 0).toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-[10px] text-nex-mist block font-semibold uppercase">Qty</span>
                  <span className="text-white font-medium">{o.quantity || 1}</span>
                </div>
              </div>

              {/* Progress to next status */}
              {nextStatus[o.status] && (
                <div className="flex justify-end pt-2 border-t border-white/5">
                  <button onClick={() => handleStatusUpdate(o.id, nextStatus[o.status])}
                    disabled={updatingId === o.id}
                    className="btn-primary !py-1.5 !px-4 text-[10px] flex items-center gap-1.5">
                    {updatingId === o.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                    Mark as {nextStatus[o.status]}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
