"use client";

import { useEffect, useState } from "react";
import {
  Building2, Search, CheckCircle, XCircle, Ban, RefreshCw,
  Eye, Loader2, Filter, Plus
} from "lucide-react";

type Status = "all" | "pending" | "active" | "suspended" | "rejected";

export default function AdminResellersPage() {
  const [resellers, setResellers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status>("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/resellers");
      if (res.ok) {
        const data = await res.json();
        if (data.resellers && Array.isArray(data.resellers)) {
          setResellers(data.resellers);
        }
      }
    } catch (err) {
      console.error("Failed to load resellers:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();

    const handleDataChange = (e: any) => {
      if (e.detail?.table === "resellers") {
        load();
      }
    };
    window.addEventListener("nexbyte-data-changed", handleDataChange);
    return () => window.removeEventListener("nexbyte-data-changed", handleDataChange);
  }, []);

  const handleAction = async (id: string, newStatus: string) => {
    setActionLoading(id + newStatus);
    try {
      const res = await fetch("/api/admin/resellers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        await load();
      }
    } catch (err) {
      console.error("Failed to update reseller status:", err);
    }
    setActionLoading(null);
  };

  const filtered = resellers.filter(r => {
    const matchSearch = !search ||
      r.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.city?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      active: "bg-green-500/10 text-green-400 border-green-500/20",
      pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      suspended: "bg-red-500/10 text-red-400 border-red-500/20",
      rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return map[s] || "bg-white/5 text-white/60 border-white/10";
  };

  const counts = {
    all: resellers.length,
    pending: resellers.filter(r => r.status === "pending").length,
    active: resellers.filter(r => r.status === "active").length,
    suspended: resellers.filter(r => r.status === "suspended").length,
    rejected: resellers.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Reseller Management</h1>
          <p className="text-xs text-nex-mist mt-0.5">Approve, suspend, and manage NexLapTech partner resellers.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-nex-mist">
          <span className="bg-nex-blue/10 text-nex-blueLight border border-nex-blue/20 px-3 py-1.5 rounded-full">
            {counts.pending} Pending
          </span>
          <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full">
            {counts.active} Active
          </span>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-nex-ink flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-nex-mist" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, city..."
            className="w-full rounded-xl bg-nex-black border border-white/[0.08] pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 bg-nex-black p-1 rounded-xl border border-white/10 text-xs">
          {(["all", "pending", "active", "suspended", "rejected"] as Status[]).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${statusFilter === s ? "bg-nex-blue text-white shadow-glow-blue" : "text-nex-mist hover:text-white hover:bg-white/5"}`}>
              {s} {counts[s] > 0 && <span className="ml-1 text-[9px]">({counts[s]})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-nex-blueLight mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <Building2 className="h-10 w-10 text-nex-mist mx-auto mb-3" />
          <p className="text-xs text-white">No resellers found.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 bg-nex-ink overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01] text-nex-mist font-semibold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-5">Business</th>
                  <th className="py-3 px-4">Owner / Contact</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-5">
                      <div>
                        <div className="font-bold text-white">{r.business_name}</div>
                        {r.gstin && <div className="text-[10px] text-nex-mist font-mono mt-0.5">GST: {r.gstin}</div>}
                        <div className="text-[10px] text-nex-mist mt-0.5">
                          {new Date(r.created_at).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white/90">{r.owner_name}</div>
                      <div className="text-[10px] text-nex-mist mt-0.5">{r.email}</div>
                      <div className="text-[10px] text-nex-mist">{r.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-white/80">{r.city}{r.state ? `, ${r.state}` : ""}</td>
                    <td className="py-4 px-4 text-white/70 capitalize">{r.business_type?.replace("_", " ")}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${statusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        {/* View details */}
                        <button onClick={() => setSelected(r)}
                          className="h-8 w-8 rounded-full bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
                          title="View Details">
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Approve */}
                        {(r.status === "pending" || r.status === "suspended" || r.status === "rejected") && (
                          <button onClick={() => handleAction(r.id, "active")}
                            disabled={actionLoading === r.id + "active"}
                            className="h-8 px-3 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-400 text-[10px] font-semibold inline-flex items-center gap-1"
                            title="Approve">
                            {actionLoading === r.id + "active" ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                            Approve
                          </button>
                        )}

                        {/* Reject */}
                        {r.status === "pending" && (
                          <button onClick={() => handleAction(r.id, "rejected")}
                            disabled={actionLoading === r.id + "rejected"}
                            className="h-8 px-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-[10px] font-semibold inline-flex items-center gap-1"
                            title="Reject">
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        )}

                        {/* Suspend */}
                        {r.status === "active" && (
                          <button onClick={() => handleAction(r.id, "suspended")}
                            disabled={actionLoading === r.id + "suspended"}
                            className="h-8 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 text-[10px] font-semibold inline-flex items-center gap-1"
                            title="Suspend">
                            <Ban className="h-3.5 w-3.5" /> Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative glass-panel w-full max-w-lg rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue">
            <button onClick={() => setSelected(null)} className="absolute right-4 top-4 text-white/50 hover:text-white">
              <XCircle className="h-5 w-5" />
            </button>
            <h3 className="font-display text-base font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="h-4.5 w-4.5 text-purple-400" /> {selected.business_name}
            </h3>
            <div className="space-y-3 text-xs">
              {[
                ["Owner", selected.owner_name],
                ["Email", selected.email],
                ["Phone", selected.phone],
                ["City", `${selected.city}${selected.state ? ", " + selected.state : ""}`],
                ["Business Type", selected.business_type?.replace("_", " ")],
                ["GSTIN", selected.gstin || "N/A"],
                ["Status", selected.status],
                ["Joined", new Date(selected.created_at).toLocaleDateString("en-IN")],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-nex-mist font-semibold">{k}</span>
                  <span className="text-white font-medium capitalize">{v}</span>
                </div>
              ))}
              {selected.description && (
                <div>
                  <span className="text-nex-mist font-semibold block mb-1">Business Description</span>
                  <p className="text-white/80 text-[11px] leading-relaxed bg-white/[0.02] p-3 rounded-xl">{selected.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
