"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ShoppingBag } from "lucide-react";

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Customer Portal Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 text-center space-y-6 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">Unable to Load Customer Shop Page</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            We encountered a temporary rendering issue. Please retry or return to your customer dashboard.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-nex-blue hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Reload Page
          </button>
          <Link
            href="/customer"
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" /> Customer Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
