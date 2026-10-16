"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, Mail, Phone, MessageCircle, Trash2, Edit, X, Send, Filter, FileSpreadsheet, CheckCircle, Eye
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";
import { dispatchPipelineEvent } from "@/lib/pipelineEvents";

function AdminContactsContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams ? searchParams.get("id") : null;

  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [replyModal, setReplyModal] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    const list = await dbHelper.contacts.list();
    setContacts(list);

    if (targetId) {
      const match = list.find((c: any) => c.id === targetId);
      if (match) {
        setReplyModal(match);
        setReplyText(match.admin_reply || "");
      }
    }
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("nexbyte-realtime", handler);
    return () => window.removeEventListener("nexbyte-realtime", handler);
  }, [targetId]);

  const handleReply = async () => {
    if (!replyModal || !replyText.trim()) return;
    setSending(true);
    await dbHelper.contacts.reply(replyModal.id, replyText);

    // Dispatch real-time Customer notification
    await dispatchPipelineEvent({
      eventType: "MESSAGE_RECEIVED",
      title: "💬 New reply from Nex LapTech Support",
      message: replyText.trim().substring(0, 100),
      recipientUserId: replyModal.user_id || replyModal.customer_id,
      referenceType: "message",
      referenceId: replyModal.id,
      metadata: { contactId: replyModal.id, reply: replyText }
    });

    setReplyModal(null);
    setReplyText("");
    setSending(false);
    load();
  };

  const handleMarkRead = async (id: string) => {
    await dbHelper.contacts.update(id, { status: "read" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this contact enquiry?")) {
      await dbHelper.contacts.delete(id);
      load();
    }
  };

  const handleExportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,Name,Email,Phone,Subject,Message,Status,Date\n";
    contacts.forEach((c) => {
      csv += `"${c.name}","${c.email}","${c.phone || ""}","${c.subject || ""}","${(c.message || "").replace(/"/g, '""')}","${c.status}","${c.created_at}"\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "NexLapTech_Contact_Enquiries.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = contacts.filter((c) => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      (c.subject || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Contact Enquiries</h1>
          <p className="text-xs text-nex-mist mt-0.5">Manage customer contact form submissions, reply to messages, and track communication.</p>
        </div>
        <button onClick={handleExportCSV} className="btn-secondary !py-2.5 !px-4 text-xs flex items-center gap-1.5">
          <FileSpreadsheet className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-nex-ink flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
          <input type="text" placeholder="Search name, email, or subject..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-nex-black border border-white/[0.08] pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-nex-mist shrink-0" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 rounded-xl bg-nex-black border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none">
            <option value="all">All Statuses</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <Mail className="h-10 w-10 text-nex-mist mx-auto mb-3" />
          <p className="text-xs text-white">No contact enquiries found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className={`glass-panel p-5 rounded-2xl bg-nex-ink border transition-all ${c.status === "unread" ? "border-nex-blue/20" : "border-white/5"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white text-xs">{c.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase border ${
                      c.status === "unread" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
                      c.status === "replied" ? "text-green-400 bg-green-500/10 border-green-500/20" :
                      "text-white/50 bg-white/5 border-white/10"
                    }`}>{c.status}</span>
                  </div>
                  <p className="text-[10px] text-nex-mist">{c.email} {c.phone && `• ${c.phone}`}</p>
                  {c.subject && <p className="text-[11px] text-nex-blueLight font-semibold mt-2">{c.subject}</p>}
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">{c.message}</p>
                  {c.admin_reply && (
                    <div className="mt-3 p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                      <p className="text-[10px] text-green-400 font-bold mb-1">Admin Reply:</p>
                      <p className="text-xs text-white/80">{c.admin_reply}</p>
                      <p className="text-[9px] text-white/30 mt-1">{new Date(c.admin_reply_at).toLocaleDateString("en-IN")}</p>
                    </div>
                  )}
                  <p className="text-[9px] text-white/30 mt-2">{new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  {c.status === "unread" && (
                    <button onClick={() => handleMarkRead(c.id)} className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white" title="Mark as Read">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button onClick={() => { setReplyModal(c); setReplyText(c.admin_reply || ""); }} className="h-8 w-8 rounded-full bg-nex-blue/10 hover:bg-nex-blue/20 flex items-center justify-center text-nex-blueLight" title="Reply">
                    <Send className="h-3.5 w-3.5" />
                  </button>
                  <a href={`tel:${c.phone}`} className="h-8 w-8 rounded-full bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center text-green-400" title="Call">
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                  <a href={`https://wa.me/${(c.phone || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 flex items-center justify-center text-[#25D366]" title="WhatsApp">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                  <button onClick={() => handleDelete(c.id)} className="h-8 w-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400" title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setReplyModal(null)} />
          <div className="glass-panel relative w-full max-w-md rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue">
            <button onClick={() => setReplyModal(null)} className="absolute right-4 top-4 text-white/50 hover:text-white"><X className="h-5 w-5" /></button>
            <h3 className="font-display text-base font-bold text-white mb-2">Reply to {replyModal.name}</h3>
            <p className="text-[11px] text-nex-mist mb-4">Re: {replyModal.subject || replyModal.message?.substring(0, 60)}</p>
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} placeholder="Type your reply message..."
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none resize-none mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setReplyModal(null)} className="btn-secondary !py-2 !px-4 text-xs">Cancel</button>
              <button onClick={handleReply} disabled={sending} className="btn-primary !py-2 !px-5 text-xs flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" /> {sending ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminContactsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white text-xs font-semibold">Loading Contact Enquiries...</div>}>
      <AdminContactsContent />
    </Suspense>
  );
}
