"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  PlusCircle,
  X,
  Filter,
  ShoppingBag,
  ShieldCheck
} from "lucide-react";

export interface ProductReviewItem {
  id: string;
  productId?: string;
  productTitle: string;
  productCategory: string;
  reviewerName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
}

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState<ProductReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | "all">("all");

  // Modal
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewProduct, setNewReviewProduct] = useState("Samsung 980 PRO 1TB NVMe SSD");
  const [successMsg, setSuccessMsg] = useState("");

  const loadReviews = async () => {
    setLoading(true);
    try {
      const mockReviews: ProductReviewItem[] = [
        {
          id: "rev-1",
          productTitle: "Samsung 980 PRO 1TB PCIe 4.0 NVMe SSD",
          productCategory: "Storage",
          reviewerName: "Rohan Sharma",
          rating: 5,
          title: "Mindblowing speed upgrade! Boot time reduced to 4 seconds.",
          comment: "Installed this Samsung 980 Pro SSD in my Dell workstation. Read speed reached 6,950 MB/s on benchmark tests. Highly recommended from NexByte with original brand warranty!",
          date: "2026-03-28",
          verifiedPurchase: true,
          helpfulCount: 24
        },
        {
          id: "rev-2",
          productTitle: "Lenovo ThinkPad T490 (Certified Refurbished)",
          productCategory: "Business Laptops",
          reviewerName: "Priya Nair",
          rating: 5,
          title: "Clean like brand new, battery health is great!",
          comment: "I was hesitant about buying refurbished, but NexByte delivered in mint condition. Keyboard, display, and battery backup are top-notch. Came with genuine 1-year warranty card.",
          date: "2026-03-20",
          verifiedPurchase: true,
          helpfulCount: 18
        },
        {
          id: "rev-3",
          productTitle: "NexByte ROG Slayer R15 Gaming PC",
          productCategory: "Gaming PCs",
          reviewerName: "Aditya Verma",
          rating: 5,
          title: "Beast of a gaming rig! Cable management is ultra-clean.",
          comment: "Running Cyberpunk 2077 at 144 FPS smooth. Thermal liquid cooling keeps CPU temperatures under 65°C under heavy loads. Excellent post-sales technician assistance!",
          date: "2026-03-15",
          verifiedPurchase: true,
          helpfulCount: 31
        },
        {
          id: "rev-4",
          productTitle: "EVM 512GB NVMe M.2 SSD",
          productCategory: "Storage",
          reviewerName: "Vikram R.",
          rating: 4,
          title: "Best budget SSD for laptop upgrade.",
          comment: "Great value for money. Transferred Windows OS seamlessly with NexByte technician support.",
          date: "2026-03-10",
          verifiedPurchase: true,
          helpfulCount: 12
        }
      ];

      setReviews(mockReviews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleHelpful = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );
  };

  const handleWriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewTitle.trim() || !newReviewComment.trim()) return;

    const created: ProductReviewItem = {
      id: `rev-${Date.now()}`,
      productTitle: newReviewProduct,
      productCategory: "Hardware",
      reviewerName: "Valued Customer",
      rating: newReviewRating,
      title: newReviewTitle.trim(),
      comment: newReviewComment.trim(),
      date: new Date().toISOString().split("T")[0],
      verifiedPurchase: true,
      helpfulCount: 1
    };

    setReviews((prev) => [created, ...prev]);
    setSuccessMsg("Thank you! Your verified review has been posted.");
    setTimeout(() => {
      setShowWriteModal(false);
      setNewReviewTitle("");
      setNewReviewComment("");
      setSuccessMsg("");
    }, 2000);
  };

  const filteredReviews = reviews.filter((r) => filterRating === "all" || r.rating === filterRating);

  const avgRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          
          {/* Header Banner */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" /> Verified Customer Reviews
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Customer Feedback &amp; Hardware Ratings
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Read real performance reviews from verified buyers across India.
            </p>
          </div>

          {/* Rating Summary Box */}
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center md:border-r border-slate-200 dark:border-white/10 pr-0 md:pr-6 space-y-1">
              <div className="font-display text-5xl font-extrabold text-slate-900 dark:text-white">{avgRating}</div>
              <div className="flex justify-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-5 w-5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-500 font-semibold pt-1">Based on {reviews.length} Verified Buyer Reviews</p>
            </div>

            <div className="space-y-1.5 text-xs">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter((r) => r.rating === stars).length;
                const pct = Math.round((count / (reviews.length || 1)) * 100);
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="w-12 font-bold text-slate-700 dark:text-slate-300">{stars} Stars</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-10 text-right text-slate-400 font-semibold">{pct}%</span>
                  </div>
                );
              })}
            </div>

            <div className="text-center space-y-3">
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Bought from NexByte?</h3>
              <p className="text-xs text-slate-500">Share your hardware experience with other buyers.</p>
              <button
                onClick={() => setShowWriteModal(true)}
                className="btn-primary !py-2.5 !px-6 text-xs inline-flex items-center gap-1.5 shadow-md"
              >
                <PlusCircle className="h-4 w-4" /> Write a Review
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-nex-blue" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter Ratings:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {["all", 5, 4, 3].map((val) => (
                <button
                  key={val}
                  onClick={() => setFilterRating(val as any)}
                  className={`px-3 py-1 rounded-full font-bold transition-all border ${
                    filterRating === val
                      ? "bg-nex-blue text-white border-nex-blue shadow-sm"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100"
                  }`}
                >
                  {val === "all" ? "All Reviews" : `${val} ★ Stars`}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="space-y-4">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{rev.title}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                      <span className="text-slate-700 dark:text-slate-200 font-bold">{rev.reviewerName}</span>
                      <span>•</span>
                      <span>{rev.date}</span>
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="h-3 w-3" /> Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {rev.productCategory}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  &quot;{rev.comment}&quot;
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] font-medium text-nex-blue dark:text-nex-blueLight">
                    Product: {rev.productTitle}
                  </span>

                  <button
                    onClick={() => handleHelpful(rev.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 text-slate-600 dark:text-slate-300 font-semibold text-[11px] transition-colors"
                  >
                    <ThumbsUp className="h-3.5 w-3.5 text-sky-500" />
                    <span>Helpful ({rev.helpfulCount})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* WRITE REVIEW MODAL */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowWriteModal(false)} />

          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-2xl z-10 text-slate-900 dark:text-white space-y-4">
            <button
              onClick={() => setShowWriteModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display text-base font-bold">Write a Hardware Performance Review</h3>

            {successMsg ? (
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 p-4 text-xs text-emerald-800 dark:text-emerald-300 font-bold text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                <p>{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleWriteSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Product *</label>
                  <select
                    value={newReviewProduct}
                    onChange={(e) => setNewReviewProduct(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Samsung 980 PRO 1TB NVMe SSD">Samsung 980 PRO 1TB NVMe SSD</option>
                    <option value="Lenovo ThinkPad T490 (Refurbished)">Lenovo ThinkPad T490 (Refurbished)</option>
                    <option value="NexByte ROG Slayer R15 Gaming PC">NexByte ROG Slayer R15 Gaming PC</option>
                    <option value="Dell Latitude 5440 Pro Laptop">Dell Latitude 5440 Pro Laptop</option>
                    <option value="EVM 512GB NVMe M.2 SSD">EVM 512GB NVMe M.2 SSD</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Overall Rating *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className={`p-2 rounded-xl border transition-all ${
                          newReviewRating >= star ? "bg-amber-500/10 border-amber-500 text-amber-500" : "border-slate-200 text-slate-400"
                        }`}
                      >
                        <Star className={`h-5 w-5 ${newReviewRating >= star ? "fill-amber-400" : ""}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Review Headline *</label>
                  <input
                    type="text"
                    required
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    placeholder="e.g. Blazing fast read speed and smooth performance"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Review Details *</label>
                  <textarea
                    required
                    rows={3}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Share boot time, benchmark speeds, build quality, battery life..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowWriteModal(false)} className="btn-secondary !py-2 !px-4 text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary !py-2 !px-5 text-xs flex items-center gap-1.5 shadow-md">
                    Submit Verified Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
