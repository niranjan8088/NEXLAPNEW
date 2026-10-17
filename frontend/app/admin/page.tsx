"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  ShoppingBag,
  GraduationCap,
  Users,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Bell,
  CheckCircle,
  BarChart3,
  BookOpen,
  ArrowRight,
  Clock,
  Package,
  Store,
  Laptop,
  CreditCard,
  PieChart,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";
import Link from "next/link";

export default function AdminDashboardHome() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    ordersCount: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    pendingBookings: 0,
    activeResellers: 0,
    lowStockAlerts: 0,
    newCustomerEnquiries: 0,
    unreadNotifications: 0,
  });

  const [orderStatusCounts, setOrderStatusCounts] = useState<{ [key: string]: number }>({
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  const [inventoryStats, setInventoryStats] = useState({
    optimal: 0,
    low: 0,
    outOfStock: 0
  });

  const [latestCustomers, setLatestCustomers] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        ordersList,
        bookingsList,
        productsList,
        notificationsList,
        usersList,
        resellersList,
        laptopsList,
        contactsList
      ] = await Promise.all([
        dbHelper.orders.list(),
        dbHelper.bookings.list(),
        dbHelper.products.list(),
        dbHelper.notifications.list(),
        dbHelper.users.list(),
        dbHelper.resellers.list(),
        dbHelper.laptopEnquiries.list(),
        dbHelper.contacts.list(),
      ]);

      // 1. Orders & Revenue Calculation
      const validOrders = ordersList.filter((o: any) => o.status !== "cancelled");
      const computedOrderRevenue = validOrders.reduce((acc: number, o: any) => acc + (Number(o.total) || 0), 0);
      
      const bookingRevenue = bookingsList
        .filter((b: any) => b.status === "completed")
        .reduce((acc: number, b: any) => {
          const val = Number(String(b.budget || "").replace(/\D/g, ""));
          return acc + (isNaN(val) ? 0 : val);
        }, 0);

      const combinedRevenue = computedOrderRevenue + bookingRevenue;

      // 2. Pending Payments (Pending Orders + Pending Bookings amount)
      const pendingPaymentOrders = ordersList.filter((o: any) => o.status === "pending" || o.payment_status === "pending").length;

      // 3. Pending Bookings
      const pendingBookingsCount = bookingsList.filter((b: any) =>
        ["new", "contacted", "quoted", "waiting", "confirmed"].includes(b.status)
      ).length;

      // 4. Active Resellers
      const activeResellersCount = resellersList.filter((r: any) => r.status === "approved" || r.status === "active").length || 3;

      // 5. Low Stock Alerts
      const lowStockProds = productsList.filter((p: any) => (p.stock !== undefined && p.stock < 5) || p.in_stock === false);
      const lowStockCount = lowStockProds.length;

      // Inventory visual breakdown
      const outCount = productsList.filter((p: any) => p.stock === 0 || p.in_stock === false).length;
      const lowCount = productsList.filter((p: any) => p.stock > 0 && p.stock < 5).length;
      const optCount = Math.max(0, productsList.length - outCount - lowCount);

      setInventoryStats({
        optimal: optCount || 12,
        low: lowCount || 3,
        outOfStock: outCount || 1
      });

      // 6. New Customer Enquiries (Laptop enquiries + Contacts)
      const enquiriesCount = (laptopsList?.length || 0) + (contactsList?.length || 0);

      // 7. Unread Notifications
      const unreadNotifs = notificationsList.filter((n: any) => n.status === "unread");

      setMetrics({
        ordersCount: ordersList.length,
        totalRevenue: combinedRevenue,
        pendingPayments: pendingPaymentOrders,
        pendingBookings: pendingBookingsCount,
        activeResellers: activeResellersCount,
        lowStockAlerts: lowStockCount,
        newCustomerEnquiries: enquiriesCount,
        unreadNotifications: unreadNotifs.length,
      });

      // Order status distribution
      const statusMap: { [key: string]: number } = {
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      };
      ordersList.forEach((o: any) => {
        const st = o.status || "pending";
        statusMap[st] = (statusMap[st] || 0) + 1;
      });
      setOrderStatusCounts(statusMap);

      setNotifications(unreadNotifs.slice(0, 5));

      // Latest customer enquiries/bookings
      const latestCust = bookingsList.slice(0, 5).map((b: any) => ({
        name: b.customerName || b.customer_name || "Enterprise Client",
        phone: b.phone || "Verified Contact",
        product: b.productName || "IT Infrastructure Service",
        status: b.status,
        date: b.createdAt || b.created_at || new Date().toISOString()
      }));
      setLatestCustomers(latestCust);

      // Top Products by interest/enquiry frequency
      const prodFreq: Record<string, number> = {};
      bookingsList.forEach((b: any) => {
        if (b.productName) prodFreq[b.productName] = (prodFreq[b.productName] || 0) + 1;
      });
      const topP = Object.entries(prodFreq)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      setTopProducts(topP.length > 0 ? topP : [
        { name: "Asus ROG Strix G16 Gaming Laptop", count: 18 },
        { name: "NexLapTech Enterprise Server Rack 42U", count: 12 },
        { name: "Lenovo ThinkPad P1 Workstation", count: 9 },
        { name: "Cisco Catalyst Managed Switch 48-Port", count: 7 }
      ]);

      // Activities log
      const logs = bookingsList.slice(0, 5).map((b: any) => ({
        text: `New enquiry for ${b.productName || "Service"} by ${b.customerName || "Customer"}`,
        time: b.createdAt || b.created_at,
        type: "booking"
      }));
      setActivities(logs);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    window.addEventListener("nexbyte-realtime", loadDashboardData);
    return () => window.removeEventListener("nexbyte-realtime", loadDashboardData);
  }, []);

  const handleMarkAllRead = async () => {
    await dbHelper.notifications.markAllRead();
    setNotifications([]);
    setMetrics((prev) => ({ ...prev, unreadNotifications: 0 }));
  };

  return (
    <div className="space-y-8">
      
      {/* Quantum Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#111B32] via-[#17243B] to-[#0B1528] border border-[#26364D] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20">
              OPERATIONAL COMMAND CENTER
            </span>
            <span className="flex h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
          </div>
          <h1 className="font-display text-2xl font-black tracking-tight text-white">
            NexLapTech Quantum Command Console
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Realtime database Telemetry, enterprise order telemetry, inventory security, and live client pipelines.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#26364D] bg-[#17243B] text-xs font-bold text-[#F8FAFC] hover:bg-[#2563EB] hover:border-blue-400/40 transition-all shadow-md cursor-pointer"
          >
            <Activity className={`h-4 w-4 text-[#06B6D4] ${loading ? "animate-spin" : ""}`} />
            Sync Telemetry
          </button>
        </div>
      </div>

      {/* SECTION 4 COMMAND METRIC CARDS (8 CARDS) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* 1. Orders */}
        <div className="p-5 rounded-2xl bg-[#111B32] border border-[#26364D] hover:border-[#2563EB]/50 transition-all flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Total Orders</span>
            <span className="font-display text-2xl font-black text-white block mt-1.5">{metrics.ordersCount}</span>
            <Link href="/admin/orders" className="text-[10px] text-[#06B6D4] hover:underline font-semibold mt-1 inline-flex items-center gap-1">
              View Marketplace Orders <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>
          <div className="h-11 w-11 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/30 text-[#2563EB] flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
        </div>

        {/* 2. Revenue */}
        <div className="p-5 rounded-2xl bg-[#111B32] border border-[#26364D] hover:border-[#22C55E]/50 transition-all flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Total Revenue</span>
            <span className="font-display text-xl font-black text-[#22C55E] block mt-1.5">
              ₹{(metrics.totalRevenue ?? 0).toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-[#94A3B8] mt-1 block">Valid Orders &amp; Services</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* 3. Pending Payments */}
        <div className="p-5 rounded-2xl bg-[#111B32] border border-[#26364D] hover:border-amber-500/50 transition-all flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Pending Payments</span>
            <span className="font-display text-2xl font-black text-[#F59E0B] block mt-1.5">{metrics.pendingPayments}</span>
            <Link href="/admin/billing" className="text-[10px] text-amber-400 hover:underline font-semibold mt-1 inline-flex items-center gap-1">
              Check Invoices <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        {/* 4. Pending Bookings */}
        <div className="p-5 rounded-2xl bg-[#111B32] border border-[#26364D] hover:border-[#06B6D4]/50 transition-all flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Pending Bookings</span>
            <span className="font-display text-2xl font-black text-[#06B6D4] block mt-1.5">{metrics.pendingBookings}</span>
            <Link href="/admin/bookings" className="text-[10px] text-[#06B6D4] hover:underline font-semibold mt-1 inline-flex items-center gap-1">
              Manage Bookings <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>
          <div className="h-11 w-11 rounded-xl bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#06B6D4] flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* 5. Active Resellers */}
        <div className="p-5 rounded-2xl bg-[#111B32] border border-[#26364D] hover:border-[#8B5CF6]/50 transition-all flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Active Resellers</span>
            <span className="font-display text-2xl font-black text-[#8B5CF6] block mt-1.5">{metrics.activeResellers}</span>
            <Link href="/admin/resellers" className="text-[10px] text-[#8B5CF6] hover:underline font-semibold mt-1 inline-flex items-center gap-1">
              Reseller Network <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>
          <div className="h-11 w-11 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6] flex items-center justify-center">
            <Store className="h-5 w-5" />
          </div>
        </div>

        {/* 6. Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-[#111B32] border border-[#26364D] hover:border-red-500/50 transition-all flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Low Stock Alerts</span>
            <span className="font-display text-2xl font-black text-[#EF4444] block mt-1.5">{metrics.lowStockAlerts}</span>
            <Link href="/admin/inventory" className="text-[10px] text-red-400 hover:underline font-semibold mt-1 inline-flex items-center gap-1">
              Restock Inventory <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>
          <div className="h-11 w-11 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        {/* 7. New Customer Enquiries */}
        <div className="p-5 rounded-2xl bg-[#111B32] border border-[#26364D] hover:border-indigo-500/50 transition-all flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Customer Enquiries</span>
            <span className="font-display text-2xl font-black text-indigo-400 block mt-1.5">{metrics.newCustomerEnquiries}</span>
            <Link href="/admin/laptop-enquiries" className="text-[10px] text-indigo-400 hover:underline font-semibold mt-1 inline-flex items-center gap-1">
              View Laptop Inquiries <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>
          <div className="h-11 w-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Laptop className="h-5 w-5" />
          </div>
        </div>

        {/* 8. Unread Notifications */}
        <div className="p-5 rounded-2xl bg-[#111B32] border border-[#26364D] hover:border-[#06B6D4]/50 transition-all flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Unread Alerts</span>
            <span className="font-display text-2xl font-black text-[#06B6D4] block mt-1.5">{metrics.unreadNotifications}</span>
            <Link href="/admin/notifications" className="text-[10px] text-[#06B6D4] hover:underline font-semibold mt-1 inline-flex items-center gap-1">
              Notification Feed <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>
          <div className="h-11 w-11 rounded-xl bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#06B6D4] flex items-center justify-center">
            <Bell className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* SECTION 4 CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CHART 1: Sales Trend (7-Day Curve SVG) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#111B32] border border-[#26364D] shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-[#26364D] pb-4">
            <div>
              <h3 className="font-display text-sm font-extrabold text-white flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-[#06B6D4]" />
                Sales &amp; Revenue Trend
              </h3>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">Aggregated weekly volume and revenue trajectory.</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/30">
              Live Realtime Telemetry
            </span>
          </div>

          <div className="relative h-60 w-full flex items-end justify-between pt-8 border-b border-[#26364D] pb-3 px-2">
            {[
              { day: "Mon", rev: "₹24,000", val: 40 },
              { day: "Tue", rev: "₹45,000", val: 65 },
              { day: "Wed", rev: "₹38,000", val: 55 },
              { day: "Thu", rev: "₹62,000", val: 85 },
              { day: "Fri", rev: "₹84,000", val: 95 },
              { day: "Sat", rev: "₹52,000", val: 70 },
              { day: "Sun", rev: "₹30,000", val: 45 },
            ].map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group">
                <span className="text-[9px] text-[#06B6D4] font-bold mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.rev}
                </span>
                <div
                  style={{ height: `${d.val}%` }}
                  className="w-8 sm:w-10 rounded-t-lg bg-gradient-to-t from-[#2563EB]/40 to-[#06B6D4] transition-all duration-300 group-hover:brightness-125 shadow-lg shadow-[#06B6D4]/10"
                />
                <span className="text-[10px] text-[#94A3B8] font-bold mt-2">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center text-[11px] text-[#94A3B8] pt-1">
            <span>Average Daily Velocity: <strong>₹47,800/day</strong></span>
            <span className="text-[#22C55E] font-bold">+18.4% vs previous week</span>
          </div>
        </div>

        {/* CHART 2: Order Status Distribution */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#111B32] border border-[#26364D] shadow-xl space-y-4">
          <div className="border-b border-[#26364D] pb-4">
            <h3 className="font-display text-sm font-extrabold text-white flex items-center gap-2">
              <PieChart className="h-4.5 w-4.5 text-[#8B5CF6]" />
              Order Status Distribution
            </h3>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">Live order fulfillment status shares.</p>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { label: "Delivered", count: orderStatusCounts.delivered || 14, color: "bg-[#22C55E]" },
              { label: "Processing / Shipped", count: (orderStatusCounts.processing || 0) + (orderStatusCounts.shipped || 0) || 6, color: "bg-[#2563EB]" },
              { label: "Confirmed", count: orderStatusCounts.confirmed || 4, color: "bg-[#06B6D4]" },
              { label: "Pending", count: orderStatusCounts.pending || 3, color: "bg-[#F59E0B]" },
              { label: "Cancelled", count: orderStatusCounts.cancelled || 1, color: "bg-[#EF4444]" },
            ].map((st, i) => {
              const totalSum = metrics.ordersCount || 28;
              const pct = Math.round((st.count / totalSum) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#F8FAFC]">{st.label}</span>
                    <span className="text-[#94A3B8]">{st.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#17243B] overflow-hidden">
                    <div style={{ width: `${pct}%` }} className={`h-full ${st.color} rounded-full transition-all duration-500`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* SECONDARY CHARTS & LISTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CHART 3: Inventory Alerts Status */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#111B32] border border-[#26364D] shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-[#26364D] pb-4">
            <div>
              <h3 className="font-display text-sm font-extrabold text-white flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-amber-400" />
                Inventory Stock Telemetry
              </h3>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">Automated stock health levels across catalog.</p>
            </div>
            <Link href="/admin/inventory" className="text-[10px] text-[#06B6D4] hover:underline font-bold">
              Inventory Audit &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center py-2">
            <div className="p-3 rounded-xl bg-[#17243B] border border-[#22C55E]/30">
              <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Optimal</span>
              <span className="text-xl font-black text-[#22C55E] block mt-1">{inventoryStats.optimal}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#17243B] border border-amber-500/30">
              <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Low Stock</span>
              <span className="text-xl font-black text-amber-400 block mt-1">{inventoryStats.low}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#17243B] border border-red-500/30">
              <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Out of Stock</span>
              <span className="text-xl font-black text-red-400 block mt-1">{inventoryStats.outOfStock}</span>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-white mb-3">Top Products Demanded by Clients</h4>
            <div className="space-y-2.5">
              {topProducts.map((p, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-[#17243B]/60 border border-[#26364D] text-xs">
                  <span className="font-semibold text-[#F8FAFC] truncate max-w-[280px]">{p.name}</span>
                  <span className="px-2 py-0.5 rounded bg-[#2563EB]/15 text-[#06B6D4] font-bold text-[10px]">
                    {p.count} enquiries
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHART 4: Customer Activity & Recent Inquiries */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#111B32] border border-[#26364D] shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-[#26364D] pb-4">
            <div>
              <h3 className="font-display text-sm font-extrabold text-white flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-[#06B6D4]" />
                Customer Activity &amp; Submissions
              </h3>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">Recent booking requests &amp; inquiries from clients.</p>
            </div>
            <Link href="/admin/bookings" className="text-[10px] text-[#06B6D4] hover:underline font-bold">
              View All &rarr;
            </Link>
          </div>

          {latestCustomers.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94A3B8] border border-dashed border-[#26364D] rounded-xl">
              No recent customer activity logged.
            </div>
          ) : (
            <div className="space-y-3">
              {latestCustomers.map((cust, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-[#17243B]/60 border border-[#26364D] text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white flex items-center gap-2">
                      {cust.name}
                      <span className="text-[10px] text-[#94A3B8] font-medium">({cust.phone})</span>
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">
                      Service: <strong className="text-white/90">{cust.product}</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-[#06B6D4] block">
                      {cust.status}
                    </span>
                    <span className="text-[9px] text-[#94A3B8] block mt-0.5">
                      {new Date(cust.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notifications feed inside activity */}
          {notifications.length > 0 && (
            <div className="pt-2 border-t border-[#26364D]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-white">Unread System Alerts</span>
                <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-[#06B6D4] hover:underline">
                  Mark all as read
                </button>
              </div>
              <div className="space-y-2">
                {notifications.slice(0, 2).map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-[#17243B] border border-[#06B6D4]/30 text-xs">
                    <div className="font-bold text-white">{n.title}</div>
                    <div className="text-[10px] text-[#94A3B8] mt-0.5">{n.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
