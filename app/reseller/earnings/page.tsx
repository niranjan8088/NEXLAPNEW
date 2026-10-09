"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Percent, CreditCard, RefreshCw, AlertCircle, ArrowDown, Package, Clock } from "lucide-react";

export default function ResellerEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<any>({
    grossSales: 0,
    totalCommission: 0,
    netEarnings: 0,
    paidPayoutsTotal: 0,
    pendingPayoutTotal: 0,
    totalOrdersCount: 0,
  });
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    async function loadEarnings() {
      try {
        setLoading(true);
        const res = await fetch("/api/reseller/earnings");
        const data = await res.json();

        if (res.ok && data.success) {
          setSummary(data.summary);
          setPayouts(data.payouts || []);
        } else {
          setError(data.error || "Failed to load earnings.");
        }
      } catch (err) {
        setError("Failed to connect to server.");
      } finally {
        setLoading(false);
      }
    }

    loadEarnings();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#2563EB]" />
        <p className="text-xs text-slate-500">Loading reseller financial reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Earnings &amp; Payouts</h1>
        <p className="text-xs text-slate-500">Real-time breakdown of gross sales, platform commission, net earnings, and payout history.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Gross Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{(summary.grossSales || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-slate-400">Total value of all items sold</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Platform Commission</span>
            <Percent className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-700">
            - ₹{(summary.totalCommission || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-slate-400">Server-calculated platform fee</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Net Earnings</span>
            <TrendingUp className="w-4 h-4 text-[#2563EB]" />
          </div>
          <p className="text-2xl font-extrabold text-[#2563EB]">
            ₹{(summary.netEarnings || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-slate-400">Net seller revenue after commission</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Pending Payout</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">
            ₹{(summary.pendingPayoutTotal || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-slate-400">Awaiting Admin release</span>
        </div>
      </div>

      {/* PAYOUT HISTORY */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Payout History &amp; Settlements</h2>

        {payouts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 italic">
            No payout settlement records generated yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Payout ID</th>
                  <th className="pb-3">Period</th>
                  <th className="pb-3">Gross Sales</th>
                  <th className="pb-3">Net Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Ref ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {payouts.map((pay: any) => (
                  <tr key={pay.id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono font-bold text-slate-900">{pay.id}</td>
                    <td className="py-3 text-slate-600">{pay.period_start} to {pay.period_end}</td>
                    <td className="py-3 text-slate-700">₹{(pay.amount || 0).toLocaleString("en-IN")}</td>
                    <td className="py-3 font-extrabold text-[#2563EB]">₹{(pay.amount || 0).toLocaleString("en-IN")}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pay.status === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-500">{pay.payment_reference || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
