"use client";

import { Suspense } from "react";
import ProductsPage from "@/app/products/page";

export default function CustomerShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400 font-semibold">Loading Customer Shop...</div>}>
      <ProductsPage />
    </Suspense>
  );
}
