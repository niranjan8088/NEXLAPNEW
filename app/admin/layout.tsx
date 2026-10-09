"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  MessageSquare,
  Home,
  LogOut,
  Shield,
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Package,
  Wrench,
  GraduationCap,
  BookOpen,
  Users,
  Archive,
  FileText,
  Globe,
  Bell,
  BarChart3,
  Image,
  Settings,
  Mail,
  Laptop,
  AlertCircle,
  Award,
  QrCode,
  MapPin,
  UserCheck,
  Menu,
  X,
  Store,
  Sparkles,
  Receipt,
  Tag,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { useState, useEffect, useMemo, Suspense } from "react";
import { realtimeSync } from "@/lib/realtimeSync";
import { useAutoLogout } from "@/lib/useAutoLogout";
import { useNotificationStore } from "@/lib/notificationStore";
import QuickNotificationsPopover from "@/components/QuickNotificationsPopover";
import { useTheme } from "@/components/ThemeProvider";

// ─── Primary Immediate Navigation Links ──────────────────────────────────────

const PRIMARY_NAV_ITEMS = [
  { label: "Overview Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Billing & Invoices", href: "/admin/billing", icon: Receipt },
  { label: "Offers Management", href: "/admin/offers", icon: Tag },
  { label: "Bookings", href: "/admin/bookings", icon: Calendar },
  { label: "Products", href: "/admin/products", icon: ShoppingBag },
  { label: "Orders", href: "/admin/orders", icon: Package },
  { label: "IT Services", href: "/admin/services", icon: Wrench },
  { label: "Reseller Management", href: "/admin/resellers", icon: Store },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Laptop Enquiries", href: "/admin/laptop-enquiries", icon: Laptop },
  { label: "Inventory Alerts", href: "/admin/inventory", icon: Archive },
  { label: "Notifications", href: "/admin/notifications", icon: Bell, hasBadge: true },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Reports", href: "/admin/reports", icon: FileText },
];

// ─── Collapsible Secondary Groups ─────────────────────────────────────────────

const COLLAPSIBLE_GROUPS = [
  {
    id: "content",
    title: "Content & Website",
    items: [
      { label: "Website CMS", href: "/admin/website-cms", icon: Globe },
      { label: "Media Library", href: "/admin/media", icon: Image },
      { label: "Product Filters", href: "/admin/product-filters", icon: SlidersHorizontal },
    ],
  },
  {
    id: "academy",
    title: "Training & Internship",
    items: [
      { label: "Training Programs", href: "/admin/training", icon: BookOpen },
      { label: "Internships", href: "/admin/internships", icon: GraduationCap },
    ],
  },
  {
    id: "cert_qr",
    title: "Certificates & QR",
    items: [
      { label: "Certificates", href: "/admin/certificates", icon: Award },
      { label: "QR Generator", href: "/admin/qr-generator", icon: QrCode },
    ],
  },
  {
    id: "reviews_gallery",
    title: "Reviews & Gallery",
    items: [
      { label: "Customer Reviews", href: "/admin/reviews", icon: MessageSquare },
      { label: "Gallery", href: "/admin/gallery", icon: Image },
    ],
  },
  {
    id: "admin_settings",
    title: "Administration & Settings",
    items: [
      { label: "Admin Users", href: "/admin/users", icon: UserCheck },
      { label: "Branches", href: "/admin/branches", icon: MapPin },
      { label: "AI Center", href: "/admin/ai", icon: Sparkles },
      { label: "Contact Messages", href: "/admin/contacts", icon: Mail },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

import AdminCommandPalette from "@/components/AdminCommandPalette";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const { showWarning, countdown, dismissWarning, logout: autoLogout } = useAutoLogout();

  useEffect(() => {
    fetchNotifications();
    realtimeSync.init();
    const handleRealtime = () => fetchNotifications();
    if (typeof window !== "undefined") {
      window.addEventListener("nexbyte-realtime", handleRealtime);
      try {
        const savedCollapsed = localStorage.getItem("nexbyte_admin_sidebar_collapsed");
        if (savedCollapsed === "true") setIsDesktopCollapsed(true);

        const savedGroups = localStorage.getItem("nexbyte_admin_expanded_groups");
        if (savedGroups) setExpandedGroups(JSON.parse(savedGroups));
      } catch {}
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("nexbyte-realtime", handleRealtime);
      }
    };
  }, [fetchNotifications]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      try { localStorage.setItem("nexbyte_admin_expanded_groups", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const toggleDesktopCollapse = () => {
    setIsDesktopCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem("nexbyte_admin_sidebar_collapsed", String(next)); } catch {}
      return next;
    });
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (res.ok) router.replace("/admin/login");
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const isLoginPage = pathname === "/admin/login";
  if (isLoginPage) return <>{children}</>;

  const renderNavItem = (item: { label: string; href: string; icon: any; hasBadge?: boolean }) => {
    const active = isActive(item.href);
    const badge = item.hasBadge ? unreadCount : 0;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setIsMobileOpen(false)}
        title={isDesktopCollapsed ? item.label : undefined}
        className={`relative flex items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-bold tracking-wide transition-all ${
          active
            ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/30 border border-blue-400/40"
            : "text-[#94A3B8] hover:text-white hover:bg-[#17243B]"
        } ${isDesktopCollapsed ? "justify-center px-2" : ""}`}
      >
        <item.icon
          className={`h-4 w-4 shrink-0 transition-colors ${
            active ? "text-white" : "text-[#06B6D4]"
          }`}
        />
        {!isDesktopCollapsed && <span className="truncate">{item.label}</span>}
        {badge > 0 && (
          <span
            className={`flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold px-1 ${
              isDesktopCollapsed ? "absolute -top-1 -right-1" : "ml-auto"
            }`}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#080D1B] text-[#F8FAFC] overflow-hidden relative">
      {/* Auto-logout warning overlay */}
      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#080D1B]/85 backdrop-blur-md" />
          <div className="relative border border-amber-500/30 bg-[#111B32] rounded-2xl p-8 max-w-sm text-center shadow-2xl">
            <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4 animate-pulse" />
            <h3 className="font-display text-lg font-bold text-white mb-2">Session Expiring</h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              You will be automatically logged out in <span className="text-amber-400 font-bold text-base">{countdown}s</span> due to inactivity.
            </p>
            <div className="flex gap-2 justify-center">
              <button onClick={dismissWarning} className="bg-[#2563EB] text-white py-2 px-6 rounded-xl text-xs font-bold">
                Stay Logged In
              </button>
              <button onClick={autoLogout} className="border border-red-500 text-red-400 py-2 px-4 rounded-xl text-xs font-bold">
                Log Out Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 border-r border-[#26364D] bg-[#0B1528] flex flex-col justify-between shrink-0 transform transition-all duration-300 ease-in-out md:translate-x-0 md:static print:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isDesktopCollapsed ? "w-20" : "w-64"}`}
      >
        <div className="p-4 flex-1 flex flex-col min-h-0">
          {/* Logo Brand & Collapse Toggle */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#26364D]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#8B5CF6] text-white shadow-md shadow-[#2563EB]/30 shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              {!isDesktopCollapsed && (
                <div className="truncate">
                  <h2 className="font-display text-sm font-extrabold tracking-tight text-white truncate">
                    NEXBYTE
                  </h2>
                  <span className="text-[9px] text-[#06B6D4] font-semibold tracking-wider uppercase block">
                    QUANTUM COMMAND
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleDesktopCollapse}
                title={isDesktopCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                className="hidden md:flex p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#17243B] transition-colors"
              >
                {isDesktopCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                )}
              </button>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-[#94A3B8] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto pr-1 pb-4 scrollbar-thin scrollbar-thumb-[#26364D] space-y-3">
            {/* 1. Primary Immediate Links */}
            <div className="space-y-1">
              {!isDesktopCollapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#06B6D4] mb-2">
                  COMMAND NAVIGATION
                </p>
              )}
              {PRIMARY_NAV_ITEMS.map(renderNavItem)}
            </div>

            <div className="h-px bg-[#26364D] my-3 mx-1" />

            {/* 2. Collapsible Secondary Groups */}
            <div className="space-y-2">
              {!isDesktopCollapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8] mb-1">
                  ENTERPRISE MODULES
                </p>
              )}
              {COLLAPSIBLE_GROUPS.map((group) => {
                const isExpanded = !!expandedGroups[group.id];
                return (
                  <div key={group.id} className="space-y-1">
                    {!isDesktopCollapsed ? (
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-[11px] font-bold text-[#94A3B8] hover:bg-[#17243B] hover:text-white transition-all text-left"
                      >
                        <span className="truncate">{group.title}</span>
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 text-[#06B6D4] shrink-0" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-[#94A3B8] shrink-0" />
                        )}
                      </button>
                    ) : (
                      <div className="h-px bg-[#26364D]/50 my-1" />
                    )}

                    {(isExpanded || isDesktopCollapsed) && (
                      <div className={isDesktopCollapsed ? "space-y-1" : "space-y-1 ml-2 pl-2 border-l border-[#26364D]"}>
                        {group.items.map(renderNavItem)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-3 mx-2 mb-2 border-t border-[#26364D] space-y-1">
          <Link
            href="/"
            title="Back to Website"
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-[#94A3B8] hover:bg-[#17243B] hover:text-white transition-colors ${
              isDesktopCollapsed ? "justify-center px-2" : ""
            }`}
          >
            <Home className="h-4 w-4 text-[#06B6D4] shrink-0" />
            {!isDesktopCollapsed && <span className="truncate">Back to Website</span>}
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Log Out"
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-bold text-rose-400 hover:bg-rose-950/40 transition-colors text-left ${
              isDesktopCollapsed ? "justify-center px-2" : ""
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isDesktopCollapsed && <span className="truncate">{loggingOut ? "Logging out..." : "Log Out"}</span>}
          </button>
        </div>
      </aside>

      {/* Main dashboard content container */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden print:max-h-none print:overflow-visible">
        {/* Header Navigation */}
        <header className="h-16 border-b border-[#26364D] bg-[#0B1528]/95 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-[#94A3B8] hover:text-white transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-sm font-bold text-white tracking-wide hidden md:block">
              {[...PRIMARY_NAV_ITEMS, ...COLLAPSIBLE_GROUPS.flatMap((g) => g.items)].find(
                (item) => isActive(item.href)
              )?.label || "Admin Command Console"}
            </h1>

            {/* Quantum Command Palette Trigger */}
            <button
              id="admin-command-palette-btn"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2.5 rounded-xl border border-[#26364D] bg-[#111B32] px-3.5 py-1.5 text-xs text-[#94A3B8] hover:bg-[#17243B] hover:border-[#06B6D4]/40 transition-all text-left"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#06B6D4]" />
              <span className="hidden sm:inline">Quantum Command...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-[#17243B] text-[#94A3B8] border border-[#26364D] ml-2">
                Ctrl+K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              title={theme === "day" ? "Switch to Night Mode" : "Switch to Day Mode"}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#26364D] bg-[#111B32] text-white hover:bg-[#17243B] transition-colors"
            >
              {theme === "day" ? (
                <Moon className="h-4 w-4 text-[#06B6D4]" />
              ) : (
                <Sun className="h-4 w-4 text-amber-400" />
              )}
            </button>

            {/* Notification Popover */}
            <QuickNotificationsPopover role="admin" />

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="hidden md:flex text-[12px] font-bold text-[#94A3B8] hover:text-white transition-colors ml-2"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#080D1B] text-[#F8FAFC] scrollbar-thin scrollbar-thumb-[#26364D] print:p-0 print:bg-white print:overflow-visible">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-8 w-8 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" />
                  <p className="text-[11px] text-[#94A3B8] font-medium">Loading Quantum Console...</p>
                </div>
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>

      {/* Admin Command Palette */}
      <AdminCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
