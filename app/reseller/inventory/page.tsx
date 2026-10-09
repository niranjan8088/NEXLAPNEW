"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Minus, RefreshCw, AlertCircle, CheckCircle2, History, Search } from "lucide-react";

export default function ResellerInventoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [listings, setListings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(5);
  const [reason, setReason] = useState<string>("Restock batch");
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reseller/inventory");
      const data = await res.json();

      if (res.ok && data.success) {
        setListings(data.listings || []);
        setTransactions(data.transactions || []);
      } else {
        setError(data.error || "Failed to load inventory.");
      }
    } catch (err) {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;

    try {
      setSuccessMsg("");
      setError("");

      const res = await fetch("/api/reseller/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: selectedListing.id,
          stockDelta: Number(stockDelta),
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`✓ Stock for SKU ${selectedListing.seller_sku} updated successfully.`);
        setSelectedListing(null);
        loadData();
      } else {
        setError(data.error || "Failed to update stock.");
      }
    } catch (err) {
      setError("Failed to process stock update.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#2563EB]" />
        <p className="text-xs text-slate-500">Loading reseller inventory database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reseller Inventory &amp; Stock Control</h1>
        <p className="text-xs text-slate-500">Manage real-time stock levels, SKU quantities, and auditable inventory transactions.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* LISTINGS TABLE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Active Listing Inventory</h2>

        {listings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 italic">
            No active product listings in your inventory.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">SKU</th>
                  <th className="pb-3">Product ID</th>
                  <th className="pb-3">Selling Price</th>
                  <th className="pb-3">Stock Qty</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono font-bold text-slate-900">{item.seller_sku || item.sellerSku}</td>
                    <td className="py-3 text-slate-600">{item.product_id || item.productId}</td>
                    <td className="py-3 font-bold text-[#2563EB]">₹{(item.selling_price || item.sellingPrice || 0).toLocaleString("en-IN")}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        (item.stock_quantity || item.stockQuantity || 0) > 0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}>
                        {item.stock_quantity || item.stockQuantity || 0} Units
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 capitalize">{item.status}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedListing(item)}
                        className="px-3 py-1 bg-blue-50 text-[#2563EB] font-bold rounded-lg hover:bg-blue-100 transition"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADJUST STOCK MODAL */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Adjust Stock: {selectedListing.seller_sku}
            </h3>
            <form onSubmit={handleStockUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Stock Change (+ Increase / - Decrease)</label>
                <input
                  type="number"
                  required
                  value={stockDelta}
                  onChange={(e) => setStockDelta(parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason / Note</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Restock batch or damage deduction"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedListing(null)}
                  className="w-full py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-blue-700 transition"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSACTION HISTORY */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <History className="w-4 h-4 text-slate-500" />
          <span>Audit Log &amp; Stock Transactions</span>
        </h2>

        {transactions.length === 0 ? (
          <div className="p-4 text-xs text-slate-500 italic">No stock adjustments recorded yet.</div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
            {transactions.map((tx: any) => (
              <div key={tx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 capitalize">{tx.type}</span>
                  <span className="text-slate-500 ml-2">({tx.reason})</span>
                </div>
                <span className="font-mono font-bold text-slate-700">{tx.quantity} Units</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
