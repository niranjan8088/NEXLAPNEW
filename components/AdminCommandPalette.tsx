"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Package,
  Calendar,
  Wrench,
  ShoppingBag,
  SlidersHorizontal,
  Users,
  Store,
  Receipt,
  Tag,
  Laptop,
  Mail,
  GraduationCap,
  BookOpen,
  Award,
  MessageSquare,
  Archive,
  Bell,
  BarChart3,
  FileText,
  Image as ImageIcon,
  QrCode,
  UserCheck,
  MapPin,
  Globe,
  Sparkles,
  Settings,
  ArrowRight,
  X,
  Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { dbHelper } from "@/lib/dbHelper";

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavCommand {
  label: string;
  href: string;
  category: string;
  icon: any;
}

const COMMAND_LINKS: NavCommand[] = [
  { label: "Dashboard Overview", href: "/admin", category: "Navigation", icon: LayoutDashboard },
  { label: "Orders Management", href: "/admin/orders", category: "Navigation", icon: Package },
  { label: "Bookings & Repairs", href: "/admin/bookings", category: "Navigation", icon: Calendar },
  { label: "IT Services", href: "/admin/services", category: "Navigation", icon: Wrench },
  { label: "Products Catalog", href: "/admin/products", category: "Navigation", icon: ShoppingBag },
  { label: "Product Filters Engine", href: "/admin/product-filters", category: "Navigation", icon: SlidersHorizontal },
  { label: "Customers Directory", href: "/admin/customers", category: "Navigation", icon: Users },
  { label: "Resellers & Marketplace", href: "/admin/resellers", category: "Navigation", icon: Store },
  { label: "Billing & Invoices", href: "/admin/billing", category: "Navigation", icon: Receipt },
  { label: "Offers & Coupons", href: "/admin/offers", category: "Navigation", icon: Tag },
  { label: "Laptop Enquiries", href: "/admin/laptop-enquiries", category: "Navigation", icon: Laptop },
  { label: "Contact Messages", href: "/admin/contacts", category: "Navigation", icon: Mail },
  { label: "Internships Program", href: "/admin/internships", category: "Navigation", icon: GraduationCap },
  { label: "Academy Training", href: "/admin/training", category: "Navigation", icon: BookOpen },
  { label: "Certificates Registry", href: "/admin/certificates", category: "Navigation", icon: Award },
  { label: "Customer Reviews", href: "/admin/reviews", category: "Navigation", icon: MessageSquare },
  { label: "Inventory Stock Alerts", href: "/admin/inventory", category: "Navigation", icon: Archive },
  { label: "Notifications Feed", href: "/admin/notifications", category: "Navigation", icon: Bell },
  { label: "Analytics & Trends", href: "/admin/analytics", category: "Navigation", icon: BarChart3 },
  { label: "System Reports", href: "/admin/reports", category: "Navigation", icon: FileText },
  { label: "Media Gallery", href: "/admin/gallery", category: "Navigation", icon: ImageIcon },
  { label: "QR Code Generator", href: "/admin/qr-generator", category: "Navigation", icon: QrCode },
  { label: "Admin Team Users", href: "/admin/users", category: "Navigation", icon: UserCheck },
  { label: "Store Branches", href: "/admin/branches", category: "Navigation", icon: MapPin },
  { label: "Website CMS", href: "/admin/website-cms", category: "Navigation", icon: Globe },
  { label: "AI Center", href: "/admin/ai", category: "Navigation", icon: Sparkles },
  { label: "Console Settings", href: "/admin/settings", category: "Navigation", icon: Settings },
];

export default function AdminCommandPalette({ isOpen, onClose }: AdminCommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbOrders, setDbOrders] = useState<any[]>([]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      // Fetch quick search records
      Promise.all([
        dbHelper.products.list(),
        dbHelper.orders.list(),
      ]).then(([prods, ords]) => {
        setDbProducts((prods || []).slice(0, 10));
        setDbOrders((ords || []).slice(0, 10));
      }).catch(() => {});
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K keydown handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state trigger
          const trigger = document.getElementById("admin-command-palette-btn");
          if (trigger) trigger.click();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter items matching search query
  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return COMMAND_LINKS;
    }

    const q = query.toLowerCase().trim();

    // 1. Navigation items
    const matchedNav = COMMAND_LINKS.filter(
      (c) => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );

    // 2. Product items matching query
    const matchedProducts: NavCommand[] = dbProducts
      .filter((p) => (p.title || p.name || "").toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({
        label: `Product: ${p.title || p.name}`,
        href: `/admin/products`,
        category: "Catalog",
        icon: ShoppingBag,
      }));

    // 3. Order items matching query
    const matchedOrders: NavCommand[] = dbOrders
      .filter((o) => (o.order_number || o.id || "").toLowerCase().includes(q))
      .slice(0, 5)
      .map((o) => ({
        label: `Order #${o.order_number || o.id?.slice(0, 8)}`,
        href: `/admin/orders`,
        category: "Orders",
        icon: Package,
      }));

    return [...matchedNav, ...matchedProducts, ...matchedOrders];
  }, [query, dbProducts, dbOrders]);

  // Handle arrow key selection
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === "Enter" && filteredResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredResults[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleSelect = (item: NavCommand) => {
    onClose();
    router.push(item.href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#080D1B]/80 backdrop-blur-md">
          {/* Backdrop Click */}
          <div className="fixed inset-0" onClick={onClose} />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl rounded-2xl border border-[#26364D] bg-[#111B32] shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden z-10 text-[#F8FAFC]"
          >
            {/* Input Header */}
            <div className="flex items-center px-4 py-3.5 border-b border-[#26364D] bg-[#17243B]/60">
              <Search className="h-5 w-5 text-[#06B6D4] shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search orders, products, customers... (Esc to exit)"
                className="w-full bg-transparent text-sm font-medium text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none"
              />
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-[#17243B] text-[#94A3B8] border border-[#26364D]">
                  ESC
                </kbd>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#17243B]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1 divide-y divide-[#26364D]/40 no-scrollbar">
              {filteredResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#94A3B8]">
                  No commands or records found for &ldquo;<strong className="text-white">{query}</strong>&rdquo;
                </div>
              ) : (
                filteredResults.map((item, idx) => {
                  const IconComp = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={`${item.href}-${idx}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold transition-all text-left ${
                        isSelected
                          ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/20 border border-blue-400/30"
                          : "text-[#F8FAFC] hover:bg-[#17243B]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            isSelected ? "bg-white/20 text-white" : "bg-[#17243B] text-[#06B6D4]"
                          }`}
                        >
                          <IconComp className="h-4 w-4" />
                        </div>
                        <span className="truncate font-bold">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isSelected
                              ? "bg-white/20 text-white border-white/30"
                              : "bg-[#17243B] text-[#94A3B8] border-[#26364D]"
                          }`}
                        >
                          {item.category}
                        </span>
                        <ArrowRight className={`h-3.5 w-3.5 ${isSelected ? "opacity-100" : "opacity-0"}`} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Command Palette Footer */}
            <div className="px-4 py-2 bg-[#080D1B] border-t border-[#26364D] flex items-center justify-between text-[11px] text-[#94A3B8]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-[#17243B] border border-[#26364D]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-[#17243B] border border-[#26364D]">↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-[#17243B] border border-[#26364D]">↵</kbd>
                  <span>Select</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#06B6D4] font-bold">
                <Command className="h-3 w-3" />
                <span>Quantum Command OS</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
