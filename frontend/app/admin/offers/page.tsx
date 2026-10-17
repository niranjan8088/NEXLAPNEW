"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Tag,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Power,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  Calendar,
  X,
  Copy,
  TrendingUp,
  Percent,
  DollarSign
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";
import { formatRupees } from "@/lib/billingUtils";

interface OfferItem {
  id: string;
  offerName: string;
  offerCode: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  eligibleProducts: string[];
  minimumPurchase: number;
  maximumDiscount: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  perCustomerLimit: number;
  usageCount: number;
  status: "ACTIVE" | "INACTIVE";
  archived?: boolean;
  createdAt: string;
}

export default function AdminOffersPage() {
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [productsCatalog, setProductsCatalog] = useState<any[]>([]);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [viewingOffer, setViewingOffer] = useState<OfferItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formType, setFormType] = useState<"percentage" | "fixed">("percentage");
  const [formValue, setFormValue] = useState<number | string>(10);
  const [formEligible, setFormEligible] = useState<string[]>(["all"]);
  const [formMinPurchase, setFormMinPurchase] = useState<number | string>(1000);
  const [formMaxDiscount, setFormMaxDiscount] = useState<number | string>(2000);
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [formExpiryDate, setFormExpiryDate] = useState("2026-12-31");
  const [formUsageLimit, setFormUsageLimit] = useState<number | string>(100);
  const [formPerCustomer, setFormPerCustomer] = useState<number | string>(1);
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  useEffect(() => {
    loadOffersData();
  }, []);

  const loadOffersData = async () => {
    setLoading(true);
    try {
      const [offerResponse, pList] = await Promise.all([
        fetch("/api/admin/offers"),
        dbHelper.products.list()
      ]);
      const offerData = await offerResponse.json();
      if (!offerResponse.ok) throw new Error(offerData.error || "Failed to load offers.");
      setOffers(offerData.offers || []);
      setProductsCatalog(pList);
    } catch (e) {
      console.error("Failed to load offers:", e);
    } finally {
      setLoading(false);
    }
  };

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingOffer(null);
    setFormName("");
    setFormCode("");
    setFormDesc("");
    setFormType("percentage");
    setFormValue(10);
    setFormEligible(["all"]);
    setFormMinPurchase(1000);
    setFormMaxDiscount(2000);
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormExpiryDate("2026-12-31");
    setFormUsageLimit(100);
    setFormPerCustomer(1);
    setFormStatus("ACTIVE");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (offer: OfferItem) => {
    setEditingOffer(offer);
    setFormName(offer.offerName || (offer as any).offer_name || "");
    setFormCode(offer.offerCode || (offer as any).offer_code || "");
    setFormDesc(offer.description || "");
    setFormType(offer.discountType || (offer as any).discount_type || "percentage");
    setFormValue(offer.discountValue ?? (offer as any).discount_value ?? 10);
    setFormEligible(offer.eligibleProducts || (offer as any).eligible_products || ["all"]);
    setFormMinPurchase(offer.minimumPurchase ?? (offer as any).minimum_purchase ?? 0);
    setFormMaxDiscount(offer.maximumDiscount ?? (offer as any).maximum_discount ?? 0);
    setFormStartDate(offer.startDate || (offer as any).start_date || new Date().toISOString().split("T")[0]);
    setFormExpiryDate(offer.expiryDate || (offer as any).expiry_date || "2026-12-31");
    setFormUsageLimit(offer.usageLimit ?? (offer as any).usage_limit ?? 100);
    setFormPerCustomer(offer.perCustomerLimit ?? (offer as any).per_customer_limit ?? 1);
    setFormStatus(offer.status || "ACTIVE");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  // Save / Submit Offer
  const handleSaveOffer = async () => {
    setErrorMsg("");

    if (!formName.trim()) {
      setErrorMsg("Offer Name is required.");
      return;
    }

    if (!formCode.trim()) {
      setErrorMsg("Offer Code is required.");
      return;
    }

    if (Number(formValue) <= 0) {
      setErrorMsg("Discount Value must be greater than zero.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        offerName: formName,
        offerCode: formCode,
        description: formDesc,
        discountType: formType,
        discountValue: Number(formValue),
        eligibleProducts: formEligible,
        minimumPurchase: Number(formMinPurchase) || 0,
        maximumDiscount: Number(formMaxDiscount) || 0,
        startDate: formStartDate,
        expiryDate: formExpiryDate,
        usageLimit: Number(formUsageLimit) || 100,
        perCustomerLimit: Number(formPerCustomer) || 1,
        status: formStatus
      };

      if (editingOffer) {
        const res = await fetch(`/api/admin/offers/${editingOffer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update offer.");
        setSuccessMsg(`Offer "${formCode.toUpperCase()}" updated successfully.`);
      } else {
        const res = await fetch("/api/admin/offers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create offer.");
        setSuccessMsg(`Offer "${formCode.toUpperCase()}" created successfully.`);
      }

      setIsModalOpen(false);
      loadOffersData();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active / Inactive Status
  const handleToggleStatus = async (offer: OfferItem) => {
    try {
      const res = await fetch(`/api/admin/offers/${offer.id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to toggle status.");
      setSuccessMsg(`Offer "${offer.offerCode}" status updated.`);
      loadOffersData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete or Archive Offer
  const handleDeleteOrArchive = async (offer: OfferItem) => {
    const usage = Number(offer.usageCount ?? (offer as any).usage_count) || 0;
    const confirmMsg =
      usage > 0
        ? `Offer "${offer.offerCode}" has been redeemed ${usage} times. It will be ARCHIVED (deactivated) to preserve historical billing records.`
        : `Are you sure you want to delete offer "${offer.offerCode}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/offers/${offer.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete offer.");

      setSuccessMsg(data.message || "Operation successful.");
      loadOffersData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Real Stats Calculations
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    let activeCount = 0;
    let inactiveCount = 0;
    let expiredCount = 0;
    let totalRedemptions = 0;

    offers.forEach((o) => {
      const status = o.status || "ACTIVE";
      const expiry = o.expiryDate || (o as any).expiry_date || "2099-12-31";
      const usage = Number(o.usageCount ?? (o as any).usage_count) || 0;
      totalRedemptions += usage;

      if (todayStr > expiry) {
        expiredCount++;
      } else if (status === "ACTIVE") {
        activeCount++;
      } else {
        inactiveCount++;
      }
    });

    return { activeCount, inactiveCount, expiredCount, totalRedemptions };
  }, [offers]);

  // Search, Filter & Sort Filtering
  const filteredOffers = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    let result = offers.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      const code = (o.offerCode || (o as any).offer_code || "").toLowerCase();
      const name = (o.offerName || (o as any).offer_name || "").toLowerCase();
      const matchesSearch = !q || code.includes(q) || name.includes(q);

      const status = o.status || "ACTIVE";
      const expiry = o.expiryDate || (o as any).expiry_date || "2099-12-31";
      const isExpired = todayStr > expiry;

      let matchesStatus = true;
      if (statusFilter === "active") {
        matchesStatus = status === "ACTIVE" && !isExpired;
      } else if (statusFilter === "inactive") {
        matchesStatus = status === "INACTIVE";
      } else if (statusFilter === "expired") {
        matchesStatus = isExpired;
      }

      const discType = o.discountType || (o as any).discount_type || "percentage";
      let matchesType = true;
      if (typeFilter === "percentage") matchesType = discType === "percentage";
      if (typeFilter === "fixed") matchesType = discType === "fixed";

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt || (b as any).created_at).getTime() - new Date(a.createdAt || (a as any).created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt || (a as any).created_at).getTime() - new Date(b.createdAt || (b as any).created_at).getTime();
      }
      if (sortBy === "most_used") {
        return (Number(b.usageCount ?? (b as any).usage_count) || 0) - (Number(a.usageCount ?? (a as any).usage_count) || 0);
      }
      if (sortBy === "highest_discount") {
        return (Number(b.discountValue ?? (b as any).discount_value) || 0) - (Number(a.discountValue ?? (a as any).discount_value) || 0);
      }
      if (sortBy === "expiring_soon") {
        const expA = a.expiryDate || (a as any).expiry_date || "2099";
        const expB = b.expiryDate || (b as any).expiry_date || "2099";
        return expA.localeCompare(expB);
      }
      return 0;
    });

    return result;
  }, [offers, searchQuery, statusFilter, typeFilter, sortBy]);

  return (
    <div className="admin-offers space-y-6">
      
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-nex-blue/15 border border-nex-blue/30 text-nex-blueLight flex items-center justify-center">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Admin Offers &amp; Referral Control
            </h1>
            <p className="text-xs text-nex-mist">
              Create, configure, toggle ON/OFF, and manage customer promotional codes.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="btn-primary !py-2.5 !px-5 text-xs font-bold flex items-center gap-2 shadow-glow-blue"
        >
          <Plus className="h-4 w-4" /> Create New Offer
        </button>
      </div>

      {/* ── REALTIME STATS BAR ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl bg-nex-ink border border-white/5">
          <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider block">Active Offers</span>
          <span className="font-display text-xl font-bold text-green-400 mt-1 block">{stats.activeCount}</span>
        </div>
        <div className="glass-panel p-4 rounded-xl bg-nex-ink border border-white/5">
          <span className="text-[10px] font-bold text-nex-mist uppercase tracking-wider block">Inactive Offers</span>
          <span className="font-display text-xl font-bold text-white mt-1 block">{stats.inactiveCount}</span>
        </div>
        <div className="glass-panel p-4 rounded-xl bg-nex-ink border border-white/5">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Expired Offers</span>
          <span className="font-display text-xl font-bold text-red-400 mt-1 block">{stats.expiredCount}</span>
        </div>
        <div className="glass-panel p-4 rounded-xl bg-nex-ink border border-white/5">
          <span className="text-[10px] font-bold text-nex-blueLight uppercase tracking-wider block">Total Redemptions</span>
          <span className="font-display text-xl font-bold text-gradient-blue mt-1 block">{stats.totalRedemptions}</span>
        </div>
      </div>

      {/* ── NOTIFICATION MESSAGES ────────────────────────────────────────────── */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-white/60 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── SEARCH & FILTERS TOOLBAR ─────────────────────────────────────────── */}
      <div className="glass-panel p-4 rounded-2xl bg-nex-ink border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-nex-mist" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Offer Code, Name..."
            className="w-full rounded-xl bg-nex-black border border-white/10 pl-10 pr-4 py-2 text-white text-xs placeholder:text-white/30 focus:border-nex-blue focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-nex-mist" />
            <span className="text-nex-mist text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-nex-black text-white text-xs px-2.5 py-1.5 rounded-lg border border-white/10 focus:outline-none"
            >
              <option value="all">All Offers</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="expired">Expired Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-nex-mist text-[11px]">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-nex-black text-white text-xs px-2.5 py-1.5 rounded-lg border border-white/10 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-nex-mist text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-nex-black text-white text-xs px-2.5 py-1.5 rounded-lg border border-white/10 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_used">Most Used</option>
              <option value="highest_discount">Highest Discount</option>
              <option value="expiring_soon">Expiring Soon</option>
            </select>
          </div>
        </div>

      </div>

      {/* ── OFFERS DATA TABLE ────────────────────────────────────────────────── */}
      <div className="glass-panel rounded-2xl bg-nex-ink border border-white/5 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 space-y-3">
            <RefreshCw className="h-8 w-8 text-nex-blueLight animate-spin mx-auto" />
            <p className="text-xs text-nex-mist">Loading offers repository...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Tag className="h-10 w-10 text-nex-mist mx-auto" />
            <p className="text-xs text-nex-mist">No promotional offers match your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/[0.02] border-b border-white/10 text-nex-mist uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Offer Code</th>
                  <th className="py-3.5 px-4">Offer Name</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Eligible Products</th>
                  <th className="py-3.5 px-4">Min. Purchase</th>
                  <th className="py-3.5 px-4">Max. Discount</th>
                  <th className="py-3.5 px-4">Validity Range</th>
                  <th className="py-3.5 px-4 text-center">Usage</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOffers.map((offer) => {
                  const code = offer.offerCode || (offer as any).offer_code;
                  const name = offer.offerName || (offer as any).offer_name;
                  const discType = offer.discountType || (offer as any).discount_type;
                  const discVal = offer.discountValue ?? (offer as any).discount_value;
                  const minPur = offer.minimumPurchase ?? (offer as any).minimum_purchase;
                  const maxDisc = offer.maximumDiscount ?? (offer as any).maximum_discount;
                  const startDate = offer.startDate || (offer as any).start_date;
                  const expiryDate = offer.expiryDate || (offer as any).expiry_date;
                  const usageCount = Number(offer.usageCount ?? (offer as any).usage_count) || 0;
                  const usageLimit = Number(offer.usageLimit ?? (offer as any).usage_limit) || 100;
                  const status = offer.status || "ACTIVE";

                  const todayStr = new Date().toISOString().split("T")[0];
                  const isExpired = todayStr > expiryDate;
                  const isNotStarted = todayStr < startDate;

                  const eligibleProds: string[] = offer.eligibleProducts || (offer as any).eligible_products || ["all"];

                  return (
                    <tr key={offer.id} className="hover:bg-white/[0.01] transition-all">
                      
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold bg-nex-blue/15 border border-nex-blue/30 text-nex-blueLight px-2.5 py-1 rounded-md">
                          {code}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{name}</div>
                        {offer.description && (
                          <div className="text-[10px] text-nex-mist line-clamp-1">{offer.description}</div>
                        )}
                      </td>

                      {/* Discount */}
                      <td className="py-3.5 px-4 font-bold text-white">
                        {discType === "percentage" ? (
                          <span className="text-cyan-400">{discVal}% OFF</span>
                        ) : (
                          <span className="text-emerald-400">{formatRupees(discVal)} OFF</span>
                        )}
                      </td>

                      {/* Eligible Products */}
                      <td className="py-3.5 px-4 text-nex-mist text-[11px]">
                        {eligibleProds.includes("all") ? (
                          <span className="text-white/80 font-medium">All Products</span>
                        ) : (
                          <span>{eligibleProds.length} Products</span>
                        )}
                      </td>

                      {/* Min Purchase */}
                      <td className="py-3.5 px-4 text-white/80">
                        {minPur > 0 ? formatRupees(minPur) : "₹0 (No Min)"}
                      </td>

                      {/* Max Discount */}
                      <td className="py-3.5 px-4 text-white/80">
                        {maxDisc > 0 ? formatRupees(maxDisc) : "Uncapped"}
                      </td>

                      {/* Validity */}
                      <td className="py-3.5 px-4 text-[10px] text-nex-mist">
                        <div>From: {startDate}</div>
                        <div>To: {expiryDate}</div>
                      </td>

                      {/* Usage */}
                      <td className="py-3.5 px-4 text-center font-semibold text-white">
                        {usageCount} / {usageLimit}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isExpired ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            EXPIRED
                          </span>
                        ) : isNotStarted ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            UPCOMING
                          </span>
                        ) : status === "ACTIVE" ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-white/50 border border-white/10">
                            INACTIVE
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Toggle ON/OFF */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(offer)}
                            title={status === "ACTIVE" ? "Deactivate Offer" : "Activate Offer"}
                            className={`p-1.5 rounded-lg border transition-all ${
                              status === "ACTIVE"
                                ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                                : "bg-white/5 text-white/50 border-white/10 hover:text-white"
                            }`}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>

                          {/* Inspect Modal */}
                          <button
                            type="button"
                            onClick={() => setViewingOffer(offer)}
                            title="View Details"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {/* Edit Modal */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(offer)}
                            title="Edit Offer"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-nex-blueLight"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete/Archive */}
                          <button
                            type="button"
                            onClick={() => handleDeleteOrArchive(offer)}
                            title={usageCount > 0 ? "Archive Offer" : "Delete Offer"}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT OFFER MODAL ────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative glass-panel bg-nex-ink border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 my-8 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-nex-blueLight" />
                <h3 className="font-display text-base font-bold text-white">
                  {editingOffer ? `Edit Offer — ${editingOffer.offerCode}` : "Create New Offer / Referral Code"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-nex-mist hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Modal Form */}
            <div className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-nex-mist mb-1">
                    Offer Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Welcome Festival Offer"
                    className="w-full rounded-xl bg-nex-black border border-white/10 px-3.5 py-2.5 text-white text-xs placeholder:text-white/30 focus:border-nex-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-nex-mist mb-1">
                    Offer Code <span className="text-red-400">*</span>
                    {editingOffer && (Number(editingOffer.usageCount ?? (editingOffer as any).usage_count) > 0) && (
                      <span className="text-amber-400 text-[10px] ml-1">(Immutable after use)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    disabled={!!editingOffer && (Number(editingOffer.usageCount ?? (editingOffer as any).usage_count) > 0)}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. NEX10"
                    className="w-full rounded-xl bg-nex-black border border-white/10 px-3.5 py-2.5 text-white font-mono uppercase text-xs placeholder:text-white/30 focus:border-nex-blue focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-nex-mist mb-1">Description / Terms</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Terms, usage rules, and offer conditions..."
                  className="w-full rounded-xl bg-nex-black border border-white/10 px-3.5 py-2.5 text-white text-xs placeholder:text-white/30 focus:border-nex-blue focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-nex-mist mb-1">Discount Type</label>
                  <select
                    value={formType}
                    onChange={(e: any) => setFormType(e.target.value)}
                    className="w-full rounded-xl bg-nex-black border border-white/10 px-3.5 py-2.5 text-white text-xs focus:border-nex-blue focus:outline-none"
                  >
                    <option value="percentage">Percentage (%) Discount</option>
                    <option value="fixed">Fixed Amount (₹) Discount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-nex-mist mb-1">
                    Discount Value {formType === "percentage" ? "(%)" : "(₹)"} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className="w-full rounded-xl bg-nex-black border border-white/10 px-3.5 py-2.5 text-white text-xs focus:border-nex-blue focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-nex-mist mb-1">Minimum Purchase (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formMinPurchase}
                    onChange={(e) => setFormMinPurchase(e.target.value)}
                    className="w-full rounded-xl bg-nex-black border border-white/10 px-3.5 py-2.5 text-white text-xs focus:border-nex-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-nex-mist mb-1">Maximum Discount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formMaxDiscount}
                    onChange={(e) => setFormMaxDiscount(e.target.value)}
                    placeholder="0 for uncapped"
                    className="w-full rounded-xl bg-nex-black border border-white/10 px-3.5 py-2.5 text-white text-xs focus:border-nex-blue focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-nex-mist mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full rounded-xl bg-nex-black border border-white/10 px-3.5 py-2.5 text-white text-xs focus:border-nex-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-nex-mist mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full rounded-xl bg-nex-black border border-white/10 px-3.5 py-2.5 text-white text-xs focus:border-nex-blue focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-nex-mist mb-1">Usage Limit (Global)</label>
                  <input
                    type="number"
                    min={1}
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(e.target.value)}
                    className="w-full rounded-xl bg-nex-black border border-white/10 px-3.5 py-2.5 text-white text-xs focus:border-nex-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-nex-mist mb-1">Per-Customer Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={formPerCustomer}
                    onChange={(e) => setFormPerCustomer(e.target.value)}
                    className="w-full rounded-xl bg-nex-black border border-white/10 px-3.5 py-2.5 text-white text-xs focus:border-nex-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-nex-mist mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="w-full rounded-xl bg-nex-black border border-white/10 px-3.5 py-2.5 text-white text-xs focus:border-nex-blue focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary !py-2 !px-4 text-xs text-nex-mist hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOffer}
                disabled={saving}
                className="btn-primary !py-2 !px-6 text-xs font-bold flex items-center gap-2 shadow-glow-blue"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" /> {editingOffer ? "Update Offer" : "Create Offer"}
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── VIEW OFFER DETAILS MODAL ─────────────────────────────────────────── */}
      {viewingOffer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setViewingOffer(null)}
          />

          <div className="relative glass-panel bg-nex-ink border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-nex-blueLight" />
                <h3 className="font-display text-sm font-bold text-white">
                  Offer Inspection — {viewingOffer.offerCode || (viewingOffer as any).offer_code}
                </h3>
              </div>
              <button
                onClick={() => setViewingOffer(null)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-nex-mist hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-white/5 p-4 rounded-xl space-y-2 border border-white/5">
                <div className="font-bold text-white text-sm">
                  {viewingOffer.offerName || (viewingOffer as any).offer_name}
                </div>
                <div className="font-mono text-xs text-nex-blueLight font-bold">
                  CODE: {viewingOffer.offerCode || (viewingOffer as any).offer_code}
                </div>
                <p className="text-[11px] text-nex-mist">{viewingOffer.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5 text-[11px]">
                <div>
                  <span className="text-[10px] text-nex-mist block">Discount Value:</span>
                  <span className="font-bold text-white">
                    {(viewingOffer.discountType || (viewingOffer as any).discount_type) === "percentage"
                      ? `${viewingOffer.discountValue ?? (viewingOffer as any).discount_value}% OFF`
                      : `${formatRupees(viewingOffer.discountValue ?? (viewingOffer as any).discount_value)} OFF`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-nex-mist block">Status:</span>
                  <span className="font-bold text-green-400">
                    {viewingOffer.status || "ACTIVE"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-nex-mist block">Min. Purchase:</span>
                  <span className="font-medium text-white">
                    {formatRupees(viewingOffer.minimumPurchase ?? (viewingOffer as any).minimum_purchase)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-nex-mist block">Max. Discount:</span>
                  <span className="font-medium text-white">
                    {formatRupees(viewingOffer.maximumDiscount ?? (viewingOffer as any).maximum_discount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-nex-mist block">Total Usage:</span>
                  <span className="font-semibold text-white">
                    {viewingOffer.usageCount ?? (viewingOffer as any).usage_count} / {viewingOffer.usageLimit ?? (viewingOffer as any).usage_limit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-nex-mist block">Per-Customer Limit:</span>
                  <span className="font-semibold text-white">
                    {viewingOffer.perCustomerLimit ?? (viewingOffer as any).per_customer_limit}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-nex-mist space-y-1">
                <div>Start Date: {viewingOffer.startDate || (viewingOffer as any).start_date}</div>
                <div>Expiry Date: {viewingOffer.expiryDate || (viewingOffer as any).expiry_date}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setViewingOffer(null)}
                className="btn-primary !py-1.5 !px-5 text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
