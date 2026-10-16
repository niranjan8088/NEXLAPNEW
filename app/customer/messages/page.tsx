"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, User, Bot, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
import { safeJsonFetch } from "@/lib/apiHelper";

export default function CustomerMessagesPage() {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
    const handler = () => fetchMessages();
    window.addEventListener("nexbyte-realtime", handler);
    return () => window.removeEventListener("nexbyte-realtime", handler);
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await safeJsonFetch("/api/customer/messages");
      if (res.ok && res.data?.messages) {
        setMessages(res.data.messages);
      }
    } catch (e) {
      console.error("Messages load error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/customer/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage, subject: "Customer Portal Enquiry" }),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setMessages([...messages, data.message]);
        setNewMessage("");
      }
    } catch (e) {
      console.error("Send error", e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E6EAF0] dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
          <MessageSquare className="h-3.5 w-3.5 text-blue-600" /> Technician &amp; Support Chat
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Customer Messages
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Communicate directly with Nex LapTech hardware technicians regarding repair inquiries, service quotes, and custom PC builds.
        </p>
      </div>

      {/* Messages Feed & Composer */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E6EAF0] dark:border-white/10 p-6 shadow-sm space-y-6">
        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-semibold">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Bot className="h-8 w-8 mx-auto text-slate-300" />
              <p>No message history yet. Type below to ask a technician!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const hasReply = Boolean(msg.admin_reply || msg.reply);
              const isRead = msg.status === "read";

              return (
                <div
                  key={msg.id || Math.random()}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {msg.subject || "Customer Inquiry"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{msg.message}</p>

                  {/* Admin / Support Reply Box (Req #13, #14) */}
                  {hasReply && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Nex LapTech Support Team Reply:</span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                        {msg.admin_reply || msg.reply}
                      </p>
                    </div>
                  )}

                  {/* Status Indicator backed by system state (Req #13) */}
                  <div className="flex items-center gap-1.5 text-[10px] font-bold pt-1">
                    {hasReply ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3" /> Replied by Support
                      </span>
                    ) : isRead ? (
                      <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                        <CheckCircle2 className="h-3 w-3" /> Read by Support
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        <Clock className="h-3 w-3" /> Delivered to Support Team
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Composer */}
        <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-100 dark:border-white/5 pt-4">
          <input
            type="text"
            placeholder="Type your message or repair enquiry..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-600"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{sending ? "Sending..." : "Send"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
