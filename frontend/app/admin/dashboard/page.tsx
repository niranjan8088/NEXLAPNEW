"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-screen bg-nex-black flex items-center justify-center text-white/50 text-xs font-mono">
      Redirecting to Admin Console...
    </div>
  );
}
