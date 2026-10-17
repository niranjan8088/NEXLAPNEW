"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle, XCircle, Trash2, Reply, Search, Download, ShieldAlert, Check } from "lucide-react";
import StarRating from "./ui/StarRating";
import Counter from "@/components/ui/Counter";
import { cn } from "@/lib/utils";
import { dbHelper } from "@/lib/dbHelper";

type Review = {
  id: string;
  customer_name: string;
  phone: string | null;
  email: string | null;
  city: string;
  service_used: string | null;
  product_purchased: string | null;
  overall_experience: string | null;
  rating: number;
  review_message: string;
  recommend: boolean;
  image_urls: string[];
  status: "pending" | "approved" | "rejected" | "need_modification";
  rejection_reason?: string | null;
  modification_reason?: string | null;
  verified: boolean;
  created_at: string;
  admin_reply: string | null;
  admin_reply_at: string | null;
  featured?: boolean;
};

type Props = {
  initialReviews: Review[];
};

export default function AdminReviewsContainer({ initialReviews }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());
  
  // Search and Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected" | "need_modification">("all");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  // Reply inline UI state
  const [replyText, setReplyText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  // Modal States for Reject & Modify
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("Inappropriate or abusive language");
  const [customRejectNote, setCustomRejectNote] = useState("");

  const [modifyingId, setModifyingId] = useState<string | null>(null);
  const [modifyNote, setModifyNote] = useState("");
  
  // Action Feedback state
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const loadReviews = async () => {
    try {
      const list = await dbHelper.reviews.list();
      setReviews(list);
    } catch {}
  };

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  useEffect(() => {
    const handleRealtime = (e: any) => {
      const { table, eventType, new: newRecord } = e.detail || {};
      if (table === "reviews") {
        loadReviews();
        if (eventType === "INSERT" && newRecord?.id) {
          setNewlyAddedIds((prev) => new Set(prev).add(newRecord.id));
          setTimeout(() => {
            setNewlyAddedIds((prev) => {
              const next = new Set(prev);
              next.delete(newRecord.id);
              return next;
            });
          }, 5000);
        }
      }
    };
    window.addEventListener("nexbyte-realtime", handleRealtime);
    return () => window.removeEventListener("nexbyte-realtime", handleRealtime);
  }, []);

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    setLoadingId(id);
    setActionMessage("");
    setActionError("");

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentFeatured }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update review status.");

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, featured: !currentFeatured } : r))
      );
      setActionMessage(`Review successfully ${!currentFeatured ? "featured" : "unfeatured"}!`);
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err: any) {
      setActionError(err.message || "Failed to update review.");
      setTimeout(() => setActionError(""), 3000);
    } finally {
      setLoadingId(null);
    }
  };

  // Statistics calculation
  const totalCount = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;
  const rejectedCount = reviews.filter((r) => r.status === "rejected").length;
  const modificationCount = reviews.filter((r) => r.status === "need_modification").length;
  
  const averageRating = totalCount > 0 
    ? parseFloat((reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalCount).toFixed(1))
    : 0;

  const starDistribution = [0, 0, 0, 0, 0];
  let recommendCount = 0;
  
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      starDistribution[5 - r.rating]++;
    }
    if (r.recommend) recommendCount++;
  });

  const recommendPercent = totalCount > 0 ? Math.round((recommendCount / totalCount) * 100) : 0;

  // Breakdown by Service Used
  const serviceCountMap: Record<string, number> = {};
  reviews.forEach((r) => {
    if (r.service_used) {
      serviceCountMap[r.service_used] = (serviceCountMap[r.service_used] || 0) + 1;
    }
  });
  const sortedServices = Object.entries(serviceCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Handlers for Admin actions
  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected" | "need_modification", extraData?: any) => {
    setLoadingId(id);
    setActionMessage("");
    setActionError("");

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...extraData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update review status.");

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus, ...extraData } : r))
      );
      setActionMessage(`Review status updated to ${newStatus.replace("_", " ")}!`);
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err: any) {
      setActionError(err.message || "Failed to update review.");
      setTimeout(() => setActionError(""), 3000);
    } finally {
      setLoadingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingId) return;
    const finalReason = customRejectNote ? `${rejectReason} - ${customRejectNote}` : rejectReason;
    await handleUpdateStatus(rejectingId, "rejected", { rejection_reason: finalReason });
    setRejectingId(null);
    setCustomRejectNote("");
  };

  const handleConfirmModification = async () => {
    if (!modifyingId || !modifyNote.trim()) return;
    await handleUpdateStatus(modifyingId, "need_modification", { modification_reason: modifyNote.trim() });
    setModifyingId(null);
    setModifyNote("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you absolutely sure you want to permanently delete this review?")) return;
    setLoadingId(id);
    setActionMessage("");
    setActionError("");

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete review.");

      setReviews((prev) => prev.filter((r) => r.id !== id));
      setActionMessage("Review permanently deleted.");
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err: any) {
      setActionError(err.message || "Failed to delete review.");
      setTimeout(() => setActionError(""), 3000);
    } finally {
      setLoadingId(null);
    }
  };

  const handlePostReply = async (id: string) => {
    setLoadingId(id);
    setActionMessage("");
    setActionError("");

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_reply: replyText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post reply.");

      setReviews((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, admin_reply: replyText || null, admin_reply_at: replyText ? new Date().toISOString() : null }
            : r
        )
      );
      setActionMessage("Reply updated successfully.");
      setTimeout(() => setActionMessage(""), 3000);
      setReplyingToId(null);
      setReplyText("");
    } catch (err: any) {
      setActionError(err.message || "Failed to post reply.");
      setTimeout(() => setActionError(""), 3000);
    } finally {
      setLoadingId(null);
    }
  };

  // Filter & Search calculations
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase()) ||
      (r.service_used && r.service_used.toLowerCase().includes(search.toLowerCase())) ||
      (r.product_purchased && r.product_purchased.toLowerCase().includes(search.toLowerCase())) ||
      r.review_message.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" ? true : r.status === statusFilter;
    const matchesRating = ratingFilter === null ? true : r.rating === ratingFilter;

    return matchesSearch && matchesStatus && matchesRating;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      {/* Toast Feedbacks */}
      {actionMessage && (
        <div className="fixed bottom-8 right-8 z-50 rounded-xl bg-green-500 px-6 py-3 text-xs font-semibold text-white shadow-glow-blue flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{actionMessage}</span>
        </div>
      )}
      {actionError && (
        <div className="fixed bottom-8 right-8 z-50 rounded-xl bg-red-500 px-6 py-3 text-xs font-semibold text-white shadow-glow-blue flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Page Title & Exports bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Reviews Moderation
          </h1>
          <p className="text-xs text-nex-mist mt-1">
            Approve, reject, reply, and monitor customer satisfaction ratings.
          </p>
        </div>

        {/* Download Buttons */}
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/export?format=excel"
            className="btn-secondary !py-2.5 !px-4 text-xs flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Excel Export
          </a>
          <a
            href="/api/admin/export?format=csv"
            className="btn-secondary !py-2.5 !px-4 text-xs flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            CSV Export
          </a>
          <a
            href="/api/admin/export?format=pdf"
            className="btn-secondary !py-2.5 !px-4 text-xs flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            PDF Export
          </a>
        </div>
      </div>

      {/* Admin Statistics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Count */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-nex-ink">
          <p className="text-xs text-nex-mist font-semibold uppercase tracking-wider">Total Feedback</p>
          <p className="text-3xl font-display font-bold text-white mt-1.5">
            <Counter value={totalCount} />
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-nex-mist mt-2">
            <span className="text-green-400 font-bold">
              <Counter value={approvedCount} /> Approved
            </span>
            <span>·</span>
            <span className="text-yellow-400 font-bold">
              <Counter value={pendingCount} /> Pending
            </span>
          </div>
        </div>

        {/* Average rating */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-nex-ink">
          <p className="text-xs text-nex-mist font-semibold uppercase tracking-wider">Average Rating</p>
          <p className="text-3xl font-display font-bold text-white mt-1.5">{averageRating} / 5</p>
          <div className="mt-2.5">
            <StarRating rating={Math.round(averageRating)} readOnly size="sm" />
          </div>
        </div>

        {/* Recommendation rate */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-nex-ink">
          <p className="text-xs text-nex-mist font-semibold uppercase tracking-wider">Recommend Rate</p>
          <p className="text-3xl font-display font-bold text-gradient-blue mt-1.5">
            <Counter value={recommendPercent} suffix="%" />
          </p>
          <div className="relative h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden mt-3">
            <div
              className="absolute inset-y-0 left-0 bg-nex-blueLight rounded-full"
              style={{ width: `${recommendPercent}%` }}
            />
          </div>
        </div>

        {/* Most Reviewed Services */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-nex-ink flex flex-col justify-between">
          <div>
            <p className="text-xs text-nex-mist font-semibold uppercase tracking-wider">Top Reviewed Services</p>
            <div className="mt-2 space-y-1">
              {sortedServices.length === 0 ? (
                <p className="text-[10px] text-nex-mist italic">No service data</p>
              ) : (
                sortedServices.map(([name, count]) => (
                  <div key={name} className="flex justify-between items-center text-[10px]">
                    <span className="text-white/80 truncate max-w-[120px]">{name}</span>
                    <span className="text-nex-blueLight font-semibold">{count} review{count > 1 ? "s" : ""}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Moderation Controls toolbar */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-nex-ink flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "All Feedbacks", val: "all", count: totalCount },
            { label: "Pending", val: "pending", count: pendingCount },
            { label: "Approved", val: "approved", count: approvedCount },
            { label: "Need Modification", val: "need_modification", count: modificationCount },
            { label: "Rejected", val: "rejected", count: rejectedCount },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setStatusFilter(tab.val as any)}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold transition-all border",
                statusFilter === tab.val
                  ? "bg-nex-blue border-nex-blue text-white shadow-glow-blue"
                  : "glass-panel text-white/70 border-transparent hover:border-white/10"
              )}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="ml-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Rating Filter & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={ratingFilter ?? ""}
            onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
            className="rounded-xl bg-nex-black border border-white/[0.08] px-3 py-2 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-nex-mist" />
            <input
              type="text"
              placeholder="Search reviewer, city, service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl bg-nex-black border border-white/[0.08] pl-9 pr-4 py-2 text-xs text-white placeholder-white/20 focus:border-nex-blue/50 focus:outline-none min-w-[200px]"
            />
          </div>
        </div>
      </div>

      {/* Moderation Reviews Feed */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-16 rounded-2xl glass-panel">
          <Search className="h-10 w-10 text-nex-mist mx-auto mb-4" />
          <p className="text-base text-white font-medium">No reviews found matching filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const isReplying = replyingToId === review.id;
            const isNew = newlyAddedIds.has(review.id);
            
            return (
              <div
                key={review.id}
                className={cn(
                  "glass-card p-6 bg-nex-ink border transition-all relative overflow-hidden",
                  isNew
                    ? "border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.4)] animate-pulse"
                    : review.status === "pending"
                    ? "border-yellow-500/25 shadow-[0_0_15px_rgba(234,179,8,0.05)]"
                    : review.status === "approved"
                    ? "border-white/5"
                    : review.status === "need_modification"
                    ? "border-purple-500/30"
                    : "border-red-500/25 opacity-70"
                )}
              >
                {/* NEW Realtime Badge */}
                {isNew && (
                  <span className="absolute top-0 right-0 bg-cyan-500 text-black text-[9px] font-black tracking-widest px-3 py-1 rounded-bl-xl shadow-md uppercase animate-bounce">
                    NEW REALTIME
                  </span>
                )}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left Column: Author info + Review contents */}
                  <div className="space-y-3 flex-1 min-w-0">
                    {/* Header info */}
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                        {review.customer_name}
                        {review.verified && (
                          <span
                            title="Verified Booking"
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-nex-blue/15 text-nex-blueLight"
                          >
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </h3>
                      <span className="text-[10px] text-nex-mist">{review.city}</span>
                      <span className="text-[10px] text-white/40">·</span>
                      <span className="text-[10px] text-white/40">{formatDate(review.created_at)}</span>
                      
                      {/* Status pill */}
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase",
                          review.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : review.status === "approved"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : review.status === "need_modification"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        )}
                      >
                        {review.status.replace("_", " ")}
                      </span>
                    </div>

                    {/* Contact detail block */}
                    {(review.phone || review.email) && (
                      <p className="text-[10px] text-nex-mist flex flex-wrap gap-x-3">
                        {review.email && <span>Email: {review.email}</span>}
                        {review.phone && <span>Phone: {review.phone}</span>}
                      </p>
                    )}

                    {/* Rejection / Modification Reason Notes */}
                    {review.rejection_reason && (
                      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                        <strong className="font-bold">Rejection Reason:</strong> {review.rejection_reason}
                      </div>
                    )}
                    {review.modification_reason && (
                      <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-xs text-purple-300">
                        <strong className="font-bold">Requested Modification Note:</strong> {review.modification_reason}
                      </div>
                    )}

                    {/* Product & service categories */}
                    {(review.service_used || review.product_purchased || review.overall_experience) && (
                      <div className="flex flex-wrap gap-2 items-center">
                        {review.service_used && (
                          <span className="rounded bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[10px] text-nex-blueLight font-semibold">
                            Service: {review.service_used}
                          </span>
                        )}
                        {review.product_purchased && (
                          <span className="rounded bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[10px] text-white/70 font-semibold">
                            Product: {review.product_purchased}
                          </span>
                        )}
                        {review.overall_experience && (
                          <span className="text-[10px] text-white/60 font-semibold italic">
                            &ldquo;{review.overall_experience}&rdquo;
                          </span>
                        )}
                      </div>
                    )}

                    {/* Message content */}
                    <div className="text-xs text-white/80 leading-relaxed bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 whitespace-pre-line">
                      <StarRating rating={review.rating} readOnly size="sm" />
                      <p className="mt-2 font-medium">{review.review_message}</p>
                    </div>

                    {/* Image Attachments */}
                    {review.image_urls && review.image_urls.length > 0 && (
                      <div className="flex gap-2">
                        {review.image_urls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative h-12 w-12 border border-white/10 rounded-lg overflow-hidden shrink-0 hover:border-nex-blue transition-colors"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="Uploaded attachment" className="h-full w-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Render existing Admin Reply */}
                    {review.admin_reply && (
                      <div className="rounded-xl border border-nex-blue/20 bg-nex-blue/5 p-3.5 text-xs text-white/90 max-w-2xl relative">
                        <p className="font-semibold text-nex-blueLight">Response from NexLapTech:</p>
                        <p className="mt-1">{review.admin_reply}</p>
                        {review.admin_reply_at && (
                          <p className="text-[9px] text-nex-mist mt-1">Replied on {formatDate(review.admin_reply_at)}</p>
                        )}
                        <button
                          onClick={() => {
                            setReplyingToId(review.id);
                            setReplyText(review.admin_reply || "");
                          }}
                          className="absolute right-3.5 top-3.5 text-[10px] text-nex-blueLight hover:text-white font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Moderation Actions */}
                  <div className="flex flex-row flex-wrap gap-2 lg:flex-col lg:items-end lg:w-48 shrink-0 justify-end pt-2 lg:pt-0">
                    {/* Approve Toggle */}
                    {review.status !== "approved" && (
                      <button
                        onClick={() => handleUpdateStatus(review.id, "approved")}
                        disabled={loadingId === review.id}
                        className="rounded-full bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500 hover:text-white px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </button>
                    )}

                    {/* Request Modification Button */}
                    {review.status !== "need_modification" && (
                      <button
                        onClick={() => setModifyingId(review.id)}
                        disabled={loadingId === review.id}
                        className="rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        Request Edit
                      </button>
                    )}

                    {/* Reject Toggle */}
                    {review.status !== "rejected" && (
                      <button
                        onClick={() => setRejectingId(review.id)}
                        disabled={loadingId === review.id}
                        className="rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    )}

                    {/* Write/Edit Reply */}
                    <button
                      onClick={() => {
                        setReplyingToId(review.id);
                        setReplyText(review.admin_reply || "");
                      }}
                      className="rounded-full bg-white/[0.04] border border-white/[0.08] text-white hover:border-nex-blue hover:text-nex-blueLight px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      {review.admin_reply ? "Edit Reply" : "Reply"}
                    </button>

                    {/* Feature Review Toggle */}
                    <button
                      onClick={() => handleToggleFeatured(review.id, !!review.featured)}
                      disabled={loadingId === review.id}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 border",
                        review.featured
                          ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500 hover:text-white"
                          : "bg-white/[0.04] border-white/[0.08] text-white hover:border-yellow-500 hover:text-yellow-400"
                      )}
                    >
                      <Star className={cn("h-3.5 w-3.5", review.featured && "fill-current")} />
                      {review.featured ? "Featured" : "Feature"}
                    </button>

                    {/* Delete Toggle */}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={loadingId === review.id}
                      className="rounded-full bg-white/[0.04] border border-transparent text-white/40 hover:border-red-500 hover:text-red-400 px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 lg:mt-4"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Reply Form (Expandable inline) */}
                {isReplying && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write an official response to this customer review..."
                      className="w-full rounded-xl bg-nex-black border border-white/10 p-3 text-xs text-white placeholder-white/20 focus:border-nex-blue focus:outline-none min-h-[80px]"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setReplyingToId(null);
                          setReplyText("");
                        }}
                        className="btn-secondary !py-1.5 !px-4 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handlePostReply(review.id)}
                        disabled={loadingId === review.id}
                        className="btn-primary !py-1.5 !px-4 text-xs"
                      >
                        Publish Response
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 bg-nex-ink rounded-2xl max-w-md w-full border border-red-500/30 space-y-4">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-400" />
              Reject Review
            </h3>
            <p className="text-xs text-nex-mist">Select a reason for rejecting this review to notify the customer:</p>

            <div className="space-y-2">
              {[
                "Inappropriate or abusive language",
                "Spam or fake review",
                "Duplicate entry",
                "Incomplete details",
                "Other / Custom Reason"
              ].map((reason) => (
                <label key={reason} className="flex items-center gap-2 text-xs text-white cursor-pointer p-2 rounded-lg hover:bg-white/5">
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason}
                    checked={rejectReason === reason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="text-red-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <textarea
              placeholder="Additional explanation or note for customer..."
              value={customRejectNote}
              onChange={(e) => setCustomRejectNote(e.target.value)}
              className="w-full rounded-xl bg-nex-black border border-white/10 p-3 text-xs text-white focus:border-red-500/50 focus:outline-none min-h-[60px]"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setRejectingId(null)} className="btn-secondary !py-2 !px-4 text-xs">
                Cancel
              </button>
              <button onClick={handleConfirmReject} className="btn-primary !bg-red-500 hover:!bg-red-600 !py-2 !px-4 text-xs">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Modal */}
      {modifyingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 bg-nex-ink rounded-2xl max-w-md w-full border border-purple-500/30 space-y-4">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <Reply className="h-5 w-5 text-purple-400" />
              Request Review Modification
            </h3>
            <p className="text-xs text-nex-mist">Specify what the customer should update (e.g. clarify service, adjust text):</p>

            <textarea
              placeholder="E.g. Please specify which branch or laptop model you serviced..."
              value={modifyNote}
              onChange={(e) => setModifyNote(e.target.value)}
              className="w-full rounded-xl bg-nex-black border border-white/10 p-3 text-xs text-white focus:border-purple-500/50 focus:outline-none min-h-[80px]"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModifyingId(null)} className="btn-secondary !py-2 !px-4 text-xs">
                Cancel
              </button>
              <button onClick={handleConfirmModification} className="btn-primary !bg-purple-600 hover:!bg-purple-700 !py-2 !px-4 text-xs">
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
