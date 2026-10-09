"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, PlusCircle, Package,
  MessageSquare, BarChart3, User, Settings, Home, LogOut,
  Bell, Menu, X, Building2, ChevronRight, Sun, Moon
} from "lucide-react";
import { useState, useEffect } from "react";
import AiChatWidget from "@/components/AiChatWidget";
import { useTheme } from "@/components/ThemeProvider";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/reseller", icon: LayoutDashboard },
  { label: "My Products", href: "/reseller/products", icon: ShoppingBag },
  { label: "Add Product", href: "/reseller/products/add", icon: PlusCircle },
  { label: "Orders", href: "/reseller/orders", icon: Package },
  { label: "Messages", href: "/reseller/messages", icon: MessageSquare },
  { label: "Analytics", href: "/reseller/analytics", icon: BarChart3 },
  { label: "My Profile", href: "/reseller/profile", icon: User },
  { label: "Settings", href: "/reseller/settings", icon: Settings },
];

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [resellerName, setResellerName] = useState("Reseller");
  const [resellerEmail, setResellerEmail] = useState("");

  useEffect(() => {
    // Read display cookies
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split(";").reduce((acc: Record<string, string>, c) => {
        const [k, v] = c.trim().split("=");
        if (k) acc[k] = v || "";
        return acc;
      }, {});
      const name = cookies["nexbyte_reseller_name"];
      const email = cookies["nexbyte_reseller_email"];
      if (name) setResellerName(decodeURIComponent(name));
      if (email) setResellerEmail(decodeURIComponent(email));
    }
  }, []);

  const isLoginPage = pathname === "/reseller/login";
  if (isLoginPage) return <>{children}</>;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/reseller/logout", { method: "POST" });
      router.replace("/reseller/login");
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-black dark:bg-black dark:text-white overflow-hidden relative">
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-neutral-50 dark:bg-black border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex-1 flex flex-col min-h-0">
          {/* Brand */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black shadow-sm">
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="font-display text-sm font-extrabold text-black dark:text-white tracking-tight">NexByte</h2>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider">RESELLER HUB</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 rounded-lg text-neutral-500 hover:text-black dark:hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Reseller info card */}
          <div className="mb-6 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-sm">
                {resellerName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-black dark:text-white truncate">{resellerName}</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">{resellerEmail}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-0.5 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-800 pb-4">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === "/reseller" ? pathname === "/reseller" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-bold tracking-wide transition-all ${isActive
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-900"
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-white dark:text-black" : "text-neutral-500 dark:text-neutral-400"}`} />
                  <span className="truncate">{item.label}</span>
                  {isActive && <ChevronRight className="h-3 w-3 ml-auto opacity-50" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 mx-2 mb-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-900 transition-colors">
            <Home className="h-4 w-4 text-neutral-500" /> Back to Website
          </Link>
          <button onClick={handleLogout} disabled={loggingOut}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-neutral-900 transition-colors text-left">
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-black/95 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span>Reseller Hub</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-black dark:text-white font-bold capitalize">
                {NAV_ITEMS.find(i => i.href === pathname || (i.href !== "/reseller" && pathname.startsWith(i.href)))?.label || "Dashboard"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Day ☀ / Night ☾ Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              title={theme === "day" ? "Switch to Night Mode" : "Switch to Day Mode"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              {theme === "day" ? (
                <Moon className="h-4 w-4 text-black" />
              ) : (
                <Sun className="h-4 w-4 text-white" />
              )}
            </button>

            <button className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
              <Bell className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
            </button>
            <div className="h-8 w-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-sm">
              {resellerName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-white dark:bg-black text-black dark:text-white scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-800">
          {children}
        </main>
        <AiChatWidget portal="reseller" />
      </div>
    </div>
  );
}

