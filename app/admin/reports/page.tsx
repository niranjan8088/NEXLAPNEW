"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  Users,
  ShoppingBag,
  Wrench,
  Award,
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";

type Period = "daily" | "weekly" | "monthly" | "yearly";

function filterByPeriod(items: any[], period: Period, dateField: string) {
  const now = new Date();
  return items.filter((item) => {
    const d = new Date(item[dateField] || item.created_at || "");
    if (isNaN(d.getTime())) return true; // include if no date
    if (period === "daily") {
      return d.toDateString() === now.toDateString();
    } else if (period === "weekly") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    } else if (period === "monthly") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } else {
      return d.getFullYear() === now.getFullYear();
    }
  });
}

export default function AdminReportsDashboard() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [bookings, setBookings] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [training, setTraining] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const load = async () => {
    const [b, p, i, t, c] = await Promise.all([
      dbHelper.bookings.list(),
      dbHelper.products.list(),
      dbHelper.internships.list(),
      dbHelper.training.list(),
      dbHelper.users.list(),
    ]);
    setBookings(b);
    setProducts(p);
    setInternships(i);
    setTraining(t);
    setCustomers(c.filter((u: any) => u.role !== "admin"));
  };

  useEffect(() => { load(); }, []);

  const periodBookings = filterByPeriod(bookings, period, "booking_date");
  const periodCustomers = filterByPeriod(customers, period, "created_at");
  const periodInternships = filterByPeriod(internships, period, "created_at");
  const periodTraining = filterByPeriod(training, period, "created_at");

  const completedBookings = periodBookings.filter((b) => b.status === "completed").length;
  const pendingBookings = periodBookings.filter((b) => b.status === "pending").length;
  const acceptedInterns = periodInternships.filter((i) => i.status === "accepted").length;
  const certifiedStudents = periodTraining.filter((t) => t.certificate_url).length;

  const kpis = [
    { label: "Service Bookings", value: periodBookings.length, sub: `${completedBookings} completed`, icon: <Wrench className="h-5 w-5" />, color: "text-nex-blueLight" },
    { label: "New Customers", value: periodCustomers.length, sub: "registered accounts", icon: <Users className="h-5 w-5" />, color: "text-green-400" },
    { label: "Internship Applicants", value: periodInternships.length, sub: `${acceptedInterns} accepted`, icon: <Award className="h-5 w-5" />, color: "text-purple-400" },
    { label: "Training Enrollments", value: periodTraining.length, sub: `${certifiedStudents} certified`, icon: <ShoppingBag className="h-5 w-5" />, color: "text-amber-400" },
  ];

  const exportCSV = () => {
    // Comprehensive export with all data sets
    const rows: string[] = [
      "Section,ID,Name/Title,Detail,Status,Date",
    ];
    periodBookings.forEach((b) => {
      rows.push(`"Booking","${b.id}","${b.customer_name}","${b.service_name}","${b.status}","${b.booking_date}"`);
    });
    periodCustomers.forEach((c) => {
      rows.push(`"Customer","${c.id}","${c.full_name}","${c.email}","registered","${c.created_at || ""}"`);
    });
    periodInternships.forEach((i) => {
      rows.push(`"Internship","${i.id}","${i.student_name}","${i.domain} - ${i.college}","${i.status}","${i.created_at || ""}"`);
    });
    periodTraining.forEach((t) => {
      rows.push(`"Training","${t.id}","${t.student_name}","${t.course_title} - ${t.batch}","${t.certificate_url ? "certified" : "enrolled"}","${t.created_at || ""}"`);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `NexLapTech_Report_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const PERIOD_LABELS: Record<Period, string> = {
    daily: "Today",
    weekly: "Last 7 Days",
    monthly: "This Month",
    yearly: "This Year",
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Business Reports</h1>
          <p className="text-xs text-nex-mist mt-0.5">Analytics snapshots and downloadable spreadsheets for daily, weekly, monthly & yearly activity.</p>
        </div>
        <button
          onClick={exportCSV}
          className="btn-primary !py-2.5 !px-4 text-xs flex items-center gap-1.5"
        >
          <FileSpreadsheet className="h-4 w-4" /> Export {PERIOD_LABELS[period]} Report CSV
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 flex-wrap">
        {(["daily", "weekly", "monthly", "yearly"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize transition-all ${
              period === p
                ? "bg-nex-blue text-white shadow-glow-blue"
                : "glass-panel bg-nex-ink border border-white/10 text-nex-mist hover:text-white hover:border-white/20"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="glass-panel bg-nex-ink border border-white/5 rounded-2xl p-5 flex flex-col gap-2">
            <div className={`${k.color}`}>{k.icon}</div>
            <div className="text-3xl font-display font-bold text-white">{k.value}</div>
            <div>
              <div className="text-xs font-semibold text-white">{k.label}</div>
              <div className="text-[10px] text-nex-mist mt-0.5">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bookings breakdown */}
      <div className="glass-panel bg-nex-ink border border-white/5 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-nex-blueLight" /> Bookings Status Breakdown — {PERIOD_LABELS[period]}
        </h2>
        {periodBookings.length === 0 ? (
          <p className="text-xs text-nex-mist py-4 text-center">No booking data for selected period.</p>
        ) : (
          <div className="space-y-3">
            {["pending", "confirmed", "in_progress", "completed", "cancelled"].map((status) => {
              const count = periodBookings.filter((b) => b.status === status).length;
              const pct = periodBookings.length > 0 ? Math.round((count / periodBookings.length) * 100) : 0;
              const colorMap: Record<string, string> = {
                pending: "bg-yellow-400",
                confirmed: "bg-nex-blue",
                in_progress: "bg-purple-400",
                completed: "bg-green-400",
                cancelled: "bg-red-400",
              };
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-24 text-[11px] text-white/70 font-medium capitalize">{status.replace("_", " ")}</div>
                  <div className="flex-1 h-2 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorMap[status]} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-[11px] font-bold text-white">{count}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Bookings list */}
      <div className="glass-panel bg-nex-ink border border-white/5 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-nex-blueLight" /> Recent Service Bookings
        </h2>
        {periodBookings.length === 0 ? (
          <p className="text-xs text-nex-mist py-4 text-center">No bookings in selected period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-white border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-nex-mist font-semibold">
                  <th className="py-2.5 pr-4 text-left">Customer</th>
                  <th className="py-2.5 pr-4 text-left">Service</th>
                  <th className="py-2.5 pr-4 text-left">Date</th>
                  <th className="py-2.5 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {periodBookings.slice(0, 10).map((b) => (
                  <tr key={b.id} className="border-b border-white/[0.03]">
                    <td className="py-3 pr-4 font-semibold">{b.customer_name}</td>
                    <td className="py-3 pr-4 text-nex-mist">{b.service_name}</td>
                    <td className="py-3 pr-4 text-nex-mist">{b.booking_date}</td>
                    <td className="py-3">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        b.status === "completed" ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : b.status === "pending" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                        : "bg-white/5 border-white/10 text-white/60"
                      }`}>{b.status}</span>
                    </td>
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
