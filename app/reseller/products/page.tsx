"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, PlusCircle, Edit, Trash2, Eye, EyeOff, Loader2, Search, Clock, CheckCircle, XCircle } from "lucide-react";
import { getSafeImageSrc } from "@/lib/utils";

export default function ResellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reseller/products");
      if (res.ok) {
        const d = await res.json();
        setProducts(d.products || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const { dbHelper } = await import("@/lib/dbHelper");
      await dbHelper.products.delete(id);
      await load();
    } catch {}
    setDeletingId(null);
  };

  const filtered = products.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const approvalBadge = (p: any) => {
    const s = p.approval_status || (p.status === "show" ? "approved" : "pending");
    if (s === "approved") return { cls: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle, label: "Approved" };
    if (s === "rejected") return { cls: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle, label: "Rejected" };
    return { cls: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock, label: "Pending" };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">My Products</h1>
          <p className="text-xs text-nex-mist mt-0.5">Manage your product catalog. All new products require admin approval.</p>
        </div>
        <Link href="/reseller/products/add"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shrink-0">
          <PlusCircle className="h-4 w-4" /> Add New Product
        </Link>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-nex-ink">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-nex-mist" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl bg-nex-black border border-white/[0.08] pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none" />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-nex-blueLight mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-white/5">
          <ShoppingBag className="h-10 w-10 text-nex-mist mx-auto mb-3" />
          <p className="text-xs text-white mb-2">No products yet.</p>
          <Link href="/reseller/products/add" className="text-nex-blueLight text-xs underline">Add your first product</Link>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 bg-nex-ink overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01] text-nex-mist font-semibold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-5">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Approval</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const badge = approvalBadge(p);
                  const BadgeIcon = badge.icon;
                  return (
                    <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center p-1">
                            <Image src={getSafeImageSrc(p.image)} alt={p.title || p.name || "Product"} width={32} height={32} className="object-contain" />
                          </div>
                          <div>
                            <div className="font-semibold text-white truncate max-w-[180px]">{p.title}</div>
                            <div className="text-[10px] text-nex-mist capitalize">{p.condition?.replace("_", " ")}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/80 capitalize">{p.category?.replace(/_/g, " ")}</td>
                      <td className="py-4 px-4 font-bold text-white">₹{(p.price ?? 0).toLocaleString("en-IN")}</td>
                      <td className="py-4 px-4 text-white/80">{p.stock ?? "—"}</td>
                      <td className="py-4 px-4">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${badge.cls}`}>
                          <BadgeIcon className="h-3 w-3" /> {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <Link href={`/reseller/products/${p.id}/edit`}
                            className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                            title="Edit">
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                          <button onClick={() => handleDelete(p.id, p.title)}
                            disabled={deletingId === p.id}
                            className="h-8 w-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors"
                            title="Delete">
                            {deletingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
