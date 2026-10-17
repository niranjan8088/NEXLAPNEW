"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  CheckCircle2,
  RefreshCw,
  GraduationCap,
  FileText,
  Clipboard,
  Filter,
  FileSpreadsheet,
  X,
  UserCheck,
  Save,
  Award,
  ExternalLink,
  Plus,
  Clock,
  Phone,
  Mail,
  Building,
  BookOpen,
  Calendar,
  AlertCircle
} from "lucide-react";
// Removed dbHelper import since we now use API
import { getSafeImageSrc } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { value: "under_review", label: "Under Review", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  { value: "more_info_required", label: "More Info Required", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { value: "approved", label: "Approved", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  { value: "enrolled", label: "Enrolled", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { value: "in_progress", label: "In Progress", color: "text-nex-blueLight bg-nex-blue/10 border-nex-blue/20" },
  { value: "completed", label: "Completed", color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
  { value: "rejected", label: "Rejected", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  { value: "on_hold", label: "On Hold", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { value: "cancelled", label: "Cancelled", color: "text-white/50 bg-white/5 border-white/10" },
];

export default function AdminInternshipsPage() {
  const [internships, setInternships] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Detail & Lifecycle Modal State
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [adminNotesText, setAdminNotesText] = useState("");
  const [customerReplyText, setCustomerReplyText] = useState("");
  const [rejectionReasonText, setRejectionReasonText] = useState("");
  const [infoRequestText, setInfoRequestText] = useState("");
  const [mentorText, setMentorText] = useState("");
  const [batchText, setBatchText] = useState("");
  const [startDateText, setStartDateText] = useState("");
  const [endDateText, setEndDateText] = useState("");
  const [progressVal, setProgressVal] = useState(0);
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [savingApp, setSavingApp] = useState(false);

  // Sub-modal triggers
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showInfoRequestModal, setShowInfoRequestModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/internships", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setInternships(data.applications || []);
    } catch {
      alert("Failed to load internship applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener("nexbyte-realtime", handler);
    return () => window.removeEventListener("nexbyte-realtime", handler);
  }, []);

  const handleOpenDetail = (app: any) => {
    setSelectedApp(app);
    setAdminNotesText(app.admin_notes || "");
    setCustomerReplyText(app.customer_reply || "");
    setRejectionReasonText(app.rejection_reason || "");
    setInfoRequestText(app.info_request_text || "");
    setMentorText(app.mentor || "");
    setBatchText(app.batch || "");
    setStartDateText(app.start_date || "");
    setEndDateText(app.end_date || "");
    setProgressVal(app.progress || 0);
    setTasksList(app.tasks || []);
  };

  const handleSaveAppDetails = async (extraUpdates: any = {}) => {
    if (!selectedApp) return;
    setSavingApp(true);
    try {
      const payload = {
        status: selectedApp.status,
        admin_notes: adminNotesText,
        customer_reply: customerReplyText,
        rejection_reason: rejectionReasonText,
        info_request_text: infoRequestText,
        mentor: mentorText,
        batch: batchText,
        start_date: startDateText,
        end_date: endDateText,
        progress: progressVal,
        tasks: tasksList,
        ...extraUpdates,
      };

      const res = await fetch("/api/internships", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedApp.id, ...payload })
      });
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      
      setSelectedApp(data.application || data.data || selectedApp);
      loadData();
    } catch (err) {
      alert("Failed to update application.");
    } finally {
      setSavingApp(false);
    }
  };

  const handleConfirmApproval = async () => {
    await handleSaveAppDetails({
      status: "approved",
      mentor: mentorText || "NexLapTech Senior Tech Lead",
      batch: batchText || "Batch A - 2026",
      customer_reply: `Congratulations! Your internship application ${selectedApp?.application_id} has been approved.`
    });
    setShowApproveModal(false);
  };

  const handleConfirmRejection = async () => {
    if (!rejectionReasonText.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    await handleSaveAppDetails({
      status: "rejected",
      rejection_reason: rejectionReasonText,
      customer_reply: customerReplyText || `We regret to inform you that your application for ${selectedApp?.domain} could not be approved at this time. Reason: ${rejectionReasonText}`
    });
    setShowRejectModal(false);
  };

  const handleConfirmInfoRequest = async () => {
    if (!infoRequestText.trim()) {
      alert("Please specify the information requested.");
      return;
    }
    await handleSaveAppDetails({
      status: "more_info_required",
      info_request_text: infoRequestText,
      customer_reply: `Action Required: Please provide the following information: ${infoRequestText}`
    });
    setShowInfoRequestModal(false);
  };

  const handleGenerateCertificate = async () => {
    await handleSaveAppDetails({
      status: "completed",
      progress: 100,
    });
    alert(`Certificate generated successfully for ${selectedApp?.full_name || selectedApp?.student_name}! Official Registration ID issued.`);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      status: "pending"
    };
    setTasksList((prev) => [...prev, newTask]);
    setNewTaskTitle("");
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasksList((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === "completed" ? "pending" : t.status === "in_progress" ? "completed" : "in_progress";
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this internship application permanently?")) {
      try {
        await fetch(`/api/internships?id=${id}`, { method: "DELETE" });
        loadData();
      } catch (err) {
        alert("Failed to delete application");
      }
    }
  };

  const handleExportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,Application ID,Enrollment ID,Name,Phone,Email,College,Course,Branch,Domain,Duration,Status,Applied Date\n";
    internships.forEach((i) => {
      csv += `"${i.application_id || i.id}","${i.enrollment_id || ""}","${i.full_name || i.student_name}","${i.phone}","${i.email}","${i.college}","${i.course}","${i.branch}","${i.domain}","${i.duration}","${i.status}","${i.created_at}"\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "NexLapTech_Internship_Applications.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter calculations
  const filtered = internships.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch =
      (i.full_name || i.student_name || "").toLowerCase().includes(q) ||
      (i.application_id || "").toLowerCase().includes(q) ||
      (i.enrollment_id || "").toLowerCase().includes(q) ||
      (i.phone || "").includes(q) ||
      (i.email || "").toLowerCase().includes(q) ||
      (i.college || "").toLowerCase().includes(q) ||
      (i.domain || "").toLowerCase().includes(q);

    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    const matchDomain = domainFilter === "all" || i.domain === domainFilter;
    return matchSearch && matchStatus && matchDomain;
  });

  // Counter metrics
  const totalApps = internships.length;
  const pendingCount = internships.filter((i) => i.status === "pending").length;
  const reviewCount = internships.filter((i) => i.status === "under_review").length;
  const approvedCount = internships.filter((i) => i.status === "approved" || i.status === "enrolled").length;
  const inProgressCount = internships.filter((i) => i.status === "in_progress").length;
  const completedCount = internships.filter((i) => i.status === "completed").length;
  const rejectedCount = internships.filter((i) => i.status === "rejected").length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-cyan-400" /> Internship Applications Management
          </h1>
          <p className="text-xs text-nex-mist mt-0.5">Approve applications, assign mentors, manage student project tasks, and issue verified certificates.</p>
        </div>
        <button onClick={handleExportCSV} className="btn-secondary !py-2.5 !px-4 text-xs flex items-center gap-1.5">
          <FileSpreadsheet className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Top Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Total Applications", count: totalApps, color: "text-white" },
          { label: "Pending", count: pendingCount, color: "text-yellow-400" },
          { label: "Under Review", count: reviewCount, color: "text-cyan-400" },
          { label: "Approved", count: approvedCount, color: "text-green-400" },
          { label: "In Progress", count: inProgressCount, color: "text-nex-blueLight" },
          { label: "Completed", count: completedCount, color: "text-teal-400" },
          { label: "Rejected", count: rejectedCount, color: "text-red-400" },
        ].map((m, idx) => (
          <div key={idx} className="glass-panel p-3.5 rounded-xl border border-white/5 bg-nex-ink text-center">
            <span className="text-[10px] text-nex-mist uppercase font-semibold block truncate">{m.label}</span>
            <span className={`font-display text-xl font-bold ${m.color} mt-0.5 block`}>{m.count}</span>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-nex-ink flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
          <input
            type="text"
            placeholder="Search Application ID (INT-2026-...), name, phone, college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-nex-black border border-white/[0.08] pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-nex-mist shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 rounded-xl bg-nex-black border border-white/10 px-3 py-2.5 text-xs text-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="h-6 w-6 animate-spin text-cyan-400 mx-auto" />
          <p className="text-xs text-nex-mist mt-2">Loading applications from server...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-white/5">
          <GraduationCap className="h-10 w-10 text-nex-mist mx-auto mb-3" />
          <p className="text-xs text-white font-medium">No internship applications found.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 bg-nex-ink overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-white border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01] text-nex-mist font-semibold">
                  <th className="py-3.5 px-5">App ID &amp; Candidate</th>
                  <th className="py-3.5 px-4">College &amp; Branch</th>
                  <th className="py-3.5 px-4">Domain &amp; Duration</th>
                  <th className="py-3.5 px-4">Status &amp; Mentor</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const statusCfg = STATUS_OPTIONS.find((s) => s.value === item.status) || STATUS_OPTIONS[0];
                  return (
                    <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-mono text-[10px] font-bold text-cyan-400">{item.application_id || item.id}</div>
                        {item.enrollment_id && (
                          <div className="font-mono text-[9px] text-green-400 font-bold">{item.enrollment_id}</div>
                        )}
                        <div className="font-semibold text-white mt-0.5">{item.full_name || item.student_name}</div>
                        <div className="text-[10px] text-nex-mist">{item.phone} • {item.email}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-white">{item.college}</div>
                        <div className="text-[10px] text-nex-mist">{item.course} ({item.branch})</div>
                        <div className="text-[9px] text-white/40">{item.semester} • USN: {item.usn || "N/A"}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-cyan-300">{item.domain}</div>
                        <div className="text-[10px] text-white/70">{item.duration} ({item.internship_type})</div>
                        {item.need_project_support && (
                          <span className="inline-block text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold mt-0.5">
                            + {item.project_type || "Project Support"}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-block rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                        {item.mentor && (
                          <div className="text-[9px] text-white/50 mt-1">Mentor: {item.mentor}</div>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="h-8 px-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold inline-flex items-center gap-1"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center inline-flex text-red-400"
                          title="Delete Record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Lifecycle & Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => !savingApp && setSelectedApp(null)} />

          <div className="glass-panel relative w-full max-w-4xl overflow-y-auto max-h-[90vh] rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue sm:p-8 z-10">
            <button
              onClick={() => !savingApp && setSelectedApp(null)}
              className="absolute right-4 top-4 text-white/50 hover:text-white z-10"
              disabled={savingApp}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-white">Internship Application Manager</h3>
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {selectedApp.application_id || selectedApp.id}
                  </span>
                  {selectedApp.enrollment_id && (
                    <span className="font-mono text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                      {selectedApp.enrollment_id}
                    </span>
                  )}
                </div>
                <p className="text-xs text-nex-mist mt-0.5">Applied on {new Date(selectedApp.created_at).toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="space-y-6 text-xs">
              
              {/* Quick Action Toolbar */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-white/70 font-semibold">Status:</span>
                  <select
                    value={selectedApp.status}
                    onChange={(e) => setSelectedApp((prev: any) => ({ ...prev, status: e.target.value }))}
                    className="rounded-lg bg-nex-black border border-white/10 px-3 py-1.5 text-xs text-white font-bold"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowApproveModal(true)}
                    className="btn-primary !py-1.5 !px-3 text-xs bg-green-600 hover:bg-green-500 border-none"
                  >
                    Approve Application
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    className="btn-secondary !py-1.5 !px-3 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInfoRequestModal(true)}
                    className="btn-secondary !py-1.5 !px-3 text-xs text-purple-300 border-purple-500/30 hover:bg-purple-500/10"
                  >
                    Request Info
                  </button>
                  {selectedApp.status === "completed" && (
                    <button
                      type="button"
                      onClick={handleGenerateCertificate}
                      className="btn-primary !py-1.5 !px-3 text-xs bg-teal-600 hover:bg-teal-500 border-none flex items-center gap-1"
                    >
                      <Award className="h-3.5 w-3.5" /> Issue Certificate
                    </button>
                  )}
                </div>
              </div>

              {/* Grid: Candidate Info & Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Candidate & Personal */}
                <div className="p-4 rounded-xl bg-nex-black/60 border border-white/5 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Candidate Info</h4>
                  <div className="space-y-1">
                    <p><strong className="text-white">Full Name:</strong> {selectedApp.full_name || selectedApp.student_name}</p>
                    <p><strong className="text-white">Phone:</strong> {selectedApp.phone}</p>
                    <p><strong className="text-white">Email:</strong> {selectedApp.email}</p>
                    <p><strong className="text-white">Location:</strong> {selectedApp.city || "Bengaluru"}, {selectedApp.state || "Karnataka"}</p>
                  </div>
                </div>

                {/* Academic Profile */}
                <div className="p-4 rounded-xl bg-nex-black/60 border border-white/5 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Academic Background</h4>
                  <div className="space-y-1">
                    <p><strong className="text-white">College:</strong> {selectedApp.college}</p>
                    <p><strong className="text-white">University:</strong> {selectedApp.university || "N/A"}</p>
                    <p><strong className="text-white">Course &amp; Branch:</strong> {selectedApp.course} ({selectedApp.branch})</p>
                    <p><strong className="text-white">Semester &amp; USN:</strong> {selectedApp.semester} • {selectedApp.usn || "No USN"}</p>
                  </div>
                </div>

              </div>

              {/* Internship Specs & Project Support */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-xl bg-nex-black/60 border border-white/5 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Internship Specs</h4>
                  <div className="space-y-1">
                    <p><strong className="text-white">Domain:</strong> {selectedApp.domain}</p>
                    <p><strong className="text-white">Duration &amp; Mode:</strong> {selectedApp.duration} ({selectedApp.internship_type})</p>
                    <p><strong className="text-white">Preferred Start Date:</strong> {selectedApp.start_date}</p>
                    <p><strong className="text-white">Purpose:</strong> {selectedApp.purpose}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-nex-black/60 border border-white/5 space-y-2">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Project Support</h4>
                  {selectedApp.need_project_support ? (
                    <div className="space-y-1">
                      <p><strong className="text-white">Type:</strong> {selectedApp.project_type}</p>
                      <p><strong className="text-white">Title:</strong> {selectedApp.project_title || "To be decided"}</p>
                      <p><strong className="text-white">Tech:</strong> {selectedApp.technology_preference || "Standard"}</p>
                      <p className="italic text-nex-mist">&ldquo;{selectedApp.project_requirements || "No custom requirement notes"}&rdquo;</p>
                    </div>
                  ) : (
                    <p className="text-nex-mist italic">No project development support requested.</p>
                  )}
                </div>

              </div>

              {/* Uploaded Documents */}
              {selectedApp.documents && selectedApp.documents.length > 0 && (
                <div className="p-4 rounded-xl bg-nex-black/60 border border-white/5 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Attached Student Documents</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.documents.map((doc: any, i: number) => (
                      <a
                        key={i}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-cyan-300 flex items-center gap-1.5 text-xs font-medium"
                      >
                        <FileText className="h-4 w-4" /> {doc.name || `Document ${i + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress & Mentor Management Section */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Internship Onboarding &amp; Progress Management</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-white/80 font-semibold block mb-1">Assigned Mentor</label>
                    <input
                      type="text"
                      value={mentorText}
                      onChange={(e) => setMentorText(e.target.value)}
                      placeholder="e.g. Senior Tech Lead"
                      className="w-full rounded-xl bg-nex-black border border-white/10 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-white/80 font-semibold block mb-1">Batch Code</label>
                    <input
                      type="text"
                      value={batchText}
                      onChange={(e) => setBatchText(e.target.value)}
                      placeholder="e.g. Batch A - 2026"
                      className="w-full rounded-xl bg-nex-black border border-white/10 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-white/80 font-semibold block mb-1">Overall Progress ({progressVal}%)</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={progressVal}
                      onChange={(e) => setProgressVal(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
                    />
                  </div>
                </div>

                {/* Tasks Checklist Manager */}
                <div className="space-y-2 pt-2">
                  <label className="text-[11px] text-white/80 font-semibold block">Student Task Checklist</label>
                  <div className="space-y-1.5">
                    {tasksList.map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-nex-black border border-white/5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleTaskStatus(t.id)}
                            className={`h-4 w-4 rounded border flex items-center justify-center ${
                              t.status === "completed"
                                ? "bg-green-500 border-green-500 text-white"
                                : t.status === "in_progress"
                                ? "bg-yellow-500 border-yellow-500 text-black"
                                : "border-white/20"
                            }`}
                          >
                            {t.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                          </button>
                          <span className={`text-xs ${t.status === "completed" ? "line-through text-white/40" : "text-white"}`}>
                            {t.title}
                          </span>
                        </div>
                        <span className="text-[9px] uppercase font-bold text-nex-mist">{t.status}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Add custom task..."
                      className="flex-1 bg-nex-black border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                    <button type="button" onClick={handleAddTask} className="btn-secondary !py-1.5 !px-3 text-xs">
                      + Add Task
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer Facing Reply Message */}
              <div className="space-y-1">
                <label className="text-xs text-white/90 font-bold block">
                  Customer-Facing Proposal / Message (Public on Track Page)
                </label>
                <textarea
                  value={customerReplyText}
                  onChange={(e) => setCustomerReplyText(e.target.value)}
                  placeholder="e.g. Your application INT-2026-000001 is approved. Batch starts 10th August..."
                  rows={2}
                  className="w-full rounded-xl bg-nex-black border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Internal Admin Notes */}
              <div className="space-y-1">
                <label className="text-xs text-amber-300 font-bold block">
                  Internal Admin Notes (PRIVATE - Hidden from Student)
                </label>
                <textarea
                  value={adminNotesText}
                  onChange={(e) => setAdminNotesText(e.target.value)}
                  placeholder="Private internal notes (e.g. Student requested online mode due to exam schedule)..."
                  rows={2}
                  className="w-full rounded-xl bg-white/[0.03] border border-amber-500/20 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="btn-secondary !py-2 !px-4"
                  disabled={savingApp}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAppDetails()}
                  disabled={savingApp}
                  className="btn-primary !py-2 !px-6 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {savingApp ? "Saving Changes..." : "Save Application Details"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Sub-modal: Confirm Approval */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setShowApproveModal(false)} />
          <div className="glass-panel relative w-full max-w-md rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue space-y-4 z-10">
            <h3 className="font-display text-base font-bold text-white">Approve Internship Application?</h3>
            <p className="text-xs text-nex-mist">
              Candidate: <strong className="text-white">{selectedApp?.full_name || selectedApp?.student_name}</strong><br />
              Domain: <strong className="text-cyan-300">{selectedApp?.domain}</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-white/80 font-semibold block mb-1">Mentor Name</label>
                <input
                  type="text"
                  value={mentorText}
                  onChange={(e) => setMentorText(e.target.value)}
                  placeholder="e.g. Senior Tech Lead"
                  className="w-full rounded-xl bg-nex-black border border-white/10 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/80 font-semibold block mb-1">Batch Name</label>
                <input
                  type="text"
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  placeholder="e.g. Batch A - 2026"
                  className="w-full rounded-xl bg-nex-black border border-white/10 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button onClick={() => setShowApproveModal(false)} className="btn-secondary !py-2 !px-4">Cancel</button>
              <button onClick={handleConfirmApproval} className="btn-primary !py-2 !px-5 bg-green-600 border-none">
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-modal: Confirm Rejection */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setShowRejectModal(false)} />
          <div className="glass-panel relative w-full max-w-md rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue space-y-4 z-10">
            <h3 className="font-display text-base font-bold text-white">Reject Application</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-white/80 font-semibold block mb-1">Rejection Reason *</label>
                <textarea
                  required
                  value={rejectionReasonText}
                  onChange={(e) => setRejectionReasonText(e.target.value)}
                  placeholder="e.g. We are currently unable to accommodate this domain for the requested dates."
                  rows={2}
                  className="w-full rounded-xl bg-nex-black border border-white/10 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button onClick={() => setShowRejectModal(false)} className="btn-secondary !py-2 !px-4">Cancel</button>
              <button onClick={handleConfirmRejection} className="btn-primary !py-2 !px-5 bg-red-600 border-none">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-modal: Request Info */}
      {showInfoRequestModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setShowInfoRequestModal(false)} />
          <div className="glass-panel relative w-full max-w-md rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue space-y-4 z-10">
            <h3 className="font-display text-base font-bold text-white">Request More Information</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-white/80 font-semibold block mb-1">Information Required *</label>
                <textarea
                  required
                  value={infoRequestText}
                  onChange={(e) => setInfoRequestText(e.target.value)}
                  placeholder="e.g. Please upload your latest college ID and internship request letter."
                  rows={2}
                  className="w-full rounded-xl bg-nex-black border border-white/10 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button onClick={() => setShowInfoRequestModal(false)} className="btn-secondary !py-2 !px-4">Cancel</button>
              <button onClick={handleConfirmInfoRequest} className="btn-primary !py-2 !px-5 bg-purple-600 border-none">
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
