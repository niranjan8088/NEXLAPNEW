"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import CustomerSidebar from "@/components/CustomerSidebar";
import CustomerHeader from "@/components/CustomerHeader";
import NotificationProvider from "@/components/NotificationProvider";
import CartDrawer from "@/components/CartDrawer";
import AiChatWidget from "@/components/AiChatWidget";
import { realtimeSync } from "@/lib/realtimeSync";
import { useEffect } from "react";
import { Home, ShoppingBag, Package, MessageSquare, User, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cartStore";

// ─── Mobile Bottom Tab Bar ────────────────────────────────────────────────────

function MobileBottomNav({ onMoreClick }: { onMoreClick: () => void }) {
  const pathname = usePathname() || "";
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const cartOpen = useCartStore((s) => s.openCart);

  const tabs = [
    { href: "/customer", label: "Home", icon: Home, exact: true },
    { href: "/customer/shop", label: "Shop", icon: ShoppingBag },
    { href: "/customer/orders", label: "Orders", icon: Package },
    { href: "/customer/messages", label: "Messages", icon: MessageSquare },
    { href: "/customer/profile", label: "Profile", icon: User },
  ];

  const isActive = (href: string, exact = false) => {
    if (exact || href === "/customer") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#080B12] border-t border-[#E2E8F0] dark:border-[#263247] flex items-center justify-around px-2 pb-safe shadow-lg">
      {tabs.map((tab) => {
        const active = isActive(tab.href, tab.exact);
        const IconComp = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center gap-1 py-3 px-3 min-w-0 flex-1 transition-colors",
              active
                ? "text-[#2563EB] dark:text-[#60A5FA]"
                : "text-[#94A3B8] dark:text-[#64748B]"
            )}
          >
            <div className="relative">
              <IconComp className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
              {tab.href === "/customer/shop" && cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[8px] font-bold text-white">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </div>
            <span className={cn("text-[10px] font-semibold truncate", active && "font-bold")}>{tab.label}</span>
            {active && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-[#2563EB] dark:bg-[#60A5FA] rounded-full" />
            )}
          </Link>
        );
      })}
      <button
        onClick={onMoreClick}
        className="flex flex-col items-center gap-1 py-3 px-3 min-w-0 flex-1 transition-colors text-[#94A3B8] dark:text-[#64748B]"
      >
        <MoreHorizontal className="h-5 w-5" />
        <span className="text-[10px] font-semibold">More</span>
      </button>
    </nav>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Init realtime sync once per customer session
  useEffect(() => {
    realtimeSync.init();
  }, []);

  // Auth routes — no sidebar/header
  const isAuthRoute =
    pathname.endsWith("/signin") ||
    pathname.endsWith("/signup") ||
    pathname.endsWith("/forgot-password");

  if (isAuthRoute) {
    return (
      <NotificationProvider>
        <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-center transition-colors duration-200">
          {children}
        </div>
      </NotificationProvider>
    );
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col transition-colors duration-200">
        {/* Desktop Sidebar — hidden on mobile, shown on lg+ */}
        <CustomerSidebar
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Main Content Column — offset by sidebar width on desktop */}
        <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
          {/* Top Header */}
          <CustomerHeader onOpenMobileMenu={() => setMobileSidebarOpen(true)} />

          {/* Page Content — add bottom padding on mobile for tab bar */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 pb-24 lg:pb-8">
            {children}
          </main>
        </div>

        {/* Global Components */}
        <CartDrawer />
        <AiChatWidget portal="customer" />

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav onMoreClick={() => setMobileSidebarOpen(true)} />
      </div>
    </NotificationProvider>
  );
}
