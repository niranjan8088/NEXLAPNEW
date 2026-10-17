"use client";

import React, { useEffect, useState } from "react";
import { Search, Trash2, CheckCircle2, XCircle, RefreshCw, BookOpen, Clock, MapPin } from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";

export default function AdminTrainingPage() {
  const [enrolls, setEnrolls] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await dbHelper.enrollments.list();
      setEnrolls(list.filter((e) => e.type === "training"));
    } catch {
      alert("Failed to load training enrollments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("nexbyte-realtime", handler);
    return () => window.removeEventListener("nexbyte-realtime", handler);
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await dbHelper.enrollments.updateStatus(id, newStatus);
      load();
      window.dispatchEvent(new CustomEvent("nexbyte-realtime"));
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this enrollment record?")) return;
    try {
      await dbHelper.enrollments.delete(id);
      load();
      window.dispatchEvent(new CustomEvent("nexbyte-realtime"));
    } catch {
      alert("Failed to delete record.");
    }
  };

  const filtered = enrolls.filter((e) => {
    const s = search.toLowerCase();
    return (
      e.fullName?.toLowerCase().includes(s) ||
      e.enrollmentId?.toLowerCase().includes(s) ||
      e.phone?.includes(s) ||
      e.email?.toLowerCase().includes(s) ||
      e.courseTitle?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-cyan-400" /> Academy Enrollments
          </h1>
          <p className="text-xs text-nex-mist mt-0.5">Moderate and track registrations for systems repair courses.</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 glass-card p-4 border-cyan-500/10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, ID, phone, course..."
            className="w-full rounded-xl bg-white/[0.03] border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="h-6 w-6 animate-spin text-cyan-400 mx-auto" />
          <p className="text-xs text-nex-mist mt-2">Loading enrollment records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass-card border-white/5">
          <BookOpen className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-xs text-nex-mist">No training applications found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div key={item.id} className="glass-card p-5 border-cyan-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">{item.fullName}</h3>
                  <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-white/50">{item.enrollmentId}</span>
                  <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${
                    item.status === "completed" 
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : item.status === "in_progress"
                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  }`}>
                    {item.status}
                  </span>
                </div>
                
                <p className="text-[11px] text-nex-blueLight font-semibold flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> {item.courseTitle}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-[10px] text-nex-mist pt-2">
                  <p><strong className="text-white">Phone:</strong> {item.phone}</p>
                  <p><strong className="text-white">Email:</strong> {item.email}</p>
                  <p><strong className="text-white">Institution:</strong> {item.college} ({item.branch}, {item.semester})</p>
                  <p><strong className="text-white">Batch:</strong> {item.preferredBatch}</p>
                </div>

                {item.message && (
                  <p className="text-[10px] bg-white/[0.01] border border-white/5 p-2 rounded-xl text-nex-mist mt-3 italic">
                    &ldquo;{item.message}&rdquo;
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 shrink-0 flex-wrap">
                <button onClick={() => handleStatusChange(item.id, "approved")} className="btn-secondary !py-1.5 !px-3 text-[10px] border-green-500/20 text-green-400 hover:bg-green-500/10">
                  Approve
                </button>
                <button onClick={() => handleStatusChange(item.id, "contacted")} className="btn-secondary !py-1.5 !px-3 text-[10px] border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10">
                  Contact
                </button>
                <button onClick={() => handleStatusChange(item.id, "in_progress")} className="btn-secondary !py-1.5 !px-3 text-[10px] border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10">
                  In Progress
                </button>
                <button onClick={() => handleStatusChange(item.id, "completed")} className="btn-secondary !py-1.5 !px-3 text-[10px] border-green-500/20 text-green-400 hover:bg-green-500/10">
                  Complete
                </button>
                <button onClick={() => handleDelete(item.id)} className="btn-secondary !py-1.5 !px-3 text-[10px] text-red-400 border-red-500/20 hover:bg-red-500/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
