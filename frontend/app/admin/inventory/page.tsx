"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  X,
  PlusCircle,
  Trash2,
  TrendingDown,
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

function getStatus(qty: number, threshold: number): StockStatus {
  if (qty === 0) return "out_of_stock";
  if (qty <= threshold) return "low_stock";
  return "in_stock";
}

const STATUS_CONFIG: Record<StockStatus, { label: string; color: string; icon: React.ReactNode }> = {
  in_stock: {
    label: "In Stock",
    color: "text-green-400 bg-green-500/10 border-green-500/20",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  low_stock: {
    label: "Low Stock",
    color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    icon: <TrendingDown className="h-3.5 w-3.5" />,
  },
  out_of_stock: {
    label: "Out of Stock",
    color: "text-red-400 bg-red-500/10 border-red-500/20",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

export default function AdminInventoryControl() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StockStatus>("all");
  const [threshold, setThreshold] = useState(5);

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState(0);

  // Add stock modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<any | null>(null);
  const [addQty, setAddQty] = useState(0);

  const load = async () => {
    const list = await dbHelper.products.list();
    setProducts(list);
  };

  useEffect(() => {
    load();
    window.addEventListener("nexbyte-realtime", load);
    return () => window.removeEventListener("nexbyte-realtime", load);
  }, []);

  const handleSaveQty = async (id: string) => {
    await dbHelper.products.update(id, { stock: editQty });
    setEditingId(null);
    load();
  };

  const handleOpenAdd = (p: any) => {
    setModalProduct(p);
    setAddQty(0);
    setIsModalOpen(true);
  };

  const handleAddStock = async () => {
    if (!modalProduct) return;
    const newQty = (modalProduct.stock || 0) + Number(addQty);
    await dbHelper.products.update(modalProduct.id, { stock: newQty });
    setIsModalOpen(false);
    setModalProduct(null);
    load();
  };

  const filtered = products.filter((p) => {
    const status = getStatus(p.stock ?? 0, threshold);
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary stats
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => getStatus(p.stock ?? 0, threshold) === "in_stock").length;
  const lowStockCount = products.filter((p) => getStatus(p.stock ?? 0, threshold) === "low_stock").length;
  const outStockCount = products.filter((p) => getStatus(p.stock ?? 0, threshold) === "out_of_stock").length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Inventory Control</h1>
          <p className="text-xs text-nex-mist mt-0.5">Track stock levels, trigger threshold alerts, and restock product quantities.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/80">
          <span className="text-nex-mist">Alert threshold:</span>
          <input
            type="number"
            min={1}
            max={50}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-16 rounded-xl bg-nex-black border border-white/10 px-3 py-2 text-center text-white focus:outline-none"
          />
          <span className="text-nex-mist">units</span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total SKUs", value: totalProducts, color: "text-white" },
          { label: "In Stock", value: inStockCount, color: "text-green-400" },
          { label: "Low Stock", value: lowStockCount, color: "text-yellow-400" },
          { label: "Out of Stock", value: outStockCount, color: "text-red-400" },
        ].map((card) => (
          <div
            key={card.label}
            className="glass-panel bg-nex-ink border border-white/5 rounded-2xl p-4 flex flex-col gap-1"
          >
            <span className="text-[10px] text-nex-mist font-medium uppercase tracking-wider">{card.label}</span>
            <span className={`text-3xl font-display font-bold ${card.color}`}>{card.value}</span>
          </div>
        ))}
      </div>

      {/* Filters strip */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-nex-ink flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
          <input
            type="text"
            placeholder="Search product title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-nex-black border border-white/[0.08] pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="w-full sm:w-44 rounded-xl bg-nex-black border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
        >
          <option value="all">All Stock Levels</option>
          <option value="in_stock">In Stock Only</option>
          <option value="low_stock">Low Stock Only</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Low stock alert banner */}
      {lowStockCount + outStockCount > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-3.5 text-xs text-yellow-300">
          <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-400" />
          <span>
            <strong>{lowStockCount + outStockCount} product(s)</strong> need restocking attention — {outStockCount} out of stock, {lowStockCount} below threshold.
          </span>
        </div>
      )}

      {/* Inventory Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <Package className="h-10 w-10 text-nex-mist mx-auto mb-3" />
          <p className="text-xs text-white">No inventory items match the current filter.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 bg-nex-ink overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-white border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01] text-nex-mist font-semibold">
                  <th className="py-3 px-5">Product / Category</th>
                  <th className="py-3 px-4">Stock Qty</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Price (Rs.)</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const status = getStatus(p.stock ?? 0, threshold);
                  const cfg = STATUS_CONFIG[status];
                  const isEditing = editingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.01] ${
                        status === "out_of_stock" ? "opacity-70" : ""
                      }`}
                    >
                      {/* Product */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white">{p.title}</div>
                        <div className="text-[10px] text-nex-mist mt-0.5 capitalize">{p.category?.replace(/_/g, " ")}</div>
                      </td>

                      {/* Stock Qty – inline editable */}
                      <td className="py-4 px-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              value={editQty}
                              onChange={(e) => setEditQty(Number(e.target.value))}
                              className="w-20 rounded-lg bg-white/[0.05] border border-nex-blue/40 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveQty(p.id)}
                              className="h-7 w-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center hover:bg-green-500/30"
                            >
                              <Save className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="h-7 w-7 rounded-full bg-white/5 text-white/50 flex items-center justify-center hover:bg-white/10"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <span
                            onClick={() => { setEditingId(p.id); setEditQty(p.stock ?? 0); }}
                            className="cursor-pointer font-bold text-white hover:text-nex-blueLight transition-colors underline decoration-dotted"
                            title="Click to edit quantity"
                          >
                            {p.stock ?? 0}
                          </span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-semibold text-white">
                        Rs. {(p.price ?? 0).toLocaleString("en-IN")}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleOpenAdd(p)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-nex-blue/30 bg-nex-blue/10 px-3 py-1.5 text-[10px] font-semibold text-nex-blueLight hover:bg-nex-blue/20 transition-colors"
                          title="Add stock units"
                        >
                          <PlusCircle className="h-3.5 w-3.5" /> Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {isModalOpen && modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="glass-panel relative w-full max-w-sm rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display text-base font-bold text-white mb-1">Restock Units</h3>
            <p className="text-[11px] text-nex-mist mb-5">{modalProduct.title}</p>

            <div className="space-y-4">
              <div className="flex justify-between text-xs text-white/80">
                <span>Current Stock</span>
                <span className="font-bold text-white">{modalProduct.stock ?? 0} units</span>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/80 font-semibold">Units to Add</label>
                <input
                  type="number"
                  min={1}
                  value={addQty}
                  onChange={(e) => setAddQty(Number(e.target.value))}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-between text-xs text-white/80 border-t border-white/5 pt-3">
                <span>New Total</span>
                <span className="font-bold text-green-400">{(modalProduct.stock ?? 0) + Number(addQty)} units</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 text-xs">
              <button onClick={() => setIsModalOpen(false)} className="btn-secondary !py-2 !px-4">Cancel</button>
              <button onClick={handleAddStock} className="btn-primary !py-2 !px-5">Confirm Restock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
