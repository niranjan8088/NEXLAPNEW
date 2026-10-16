"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Bot, User, RefreshCw, ShieldCheck, HelpCircle, Package, Wrench, GraduationCap, Tag } from "lucide-react";
import { safeJsonFetch } from "@/lib/apiHelper";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function CustomerAiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-init",
      sender: "ai",
      text: "Hello! I am your Nex LapTech Customer AI Assistant. I can help track your hardware orders, check repair status, find promo codes, or answer questions about computer parts and services. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input.trim();
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await safeJsonFetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsgText, context: "customer_portal" }),
      });

      const aiText = res.ok && res.data?.reply
        ? res.data.reply
        : "I can check your account records. If you are asking about an order or booking status, please visit the Orders or Bookings tab for live tracking.";

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: "I couldn't verify that information right now. Please check your Orders or Service Bookings page.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const SUGGESTED_PROMPTS = [
    "Where is my latest order?",
    "What is the status of my laptop repair booking?",
    "What promo codes are active today?",
    "How do I claim my e-warranty?",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-[#0D0D0F] border border-[#E5E7EB] dark:border-[#27272A] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] dark:bg-[#1E1638] border border-[#4F46E5]/20 dark:border-[#7C5CFF]/30 px-3 py-1 text-xs font-bold text-[#4F46E5] dark:text-[#7C5CFF]">
            <Sparkles className="h-3.5 w-3.5" /> Customer-Scoped AI Assistant
          </span>
          <h1 className="font-display text-2xl font-extrabold text-[#111827] dark:text-white tracking-tight">
            Nex LapTech AI Assistant
          </h1>
          <p className="text-xs text-[#667085] dark:text-[#A1A1AA]">
            Instant support for your hardware orders, service requests, active deals, and technical queries.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
          <ShieldCheck className="h-4 w-4" /> Secure &amp; Account-Isolated
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="rounded-3xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#0D0D0F] shadow-xs flex flex-col h-[550px] overflow-hidden">
        {/* Scrollable Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  m.sender === "user"
                    ? "bg-[#4F46E5] text-white"
                    : "bg-[#EEF2FF] dark:bg-[#1E1638] text-[#4F46E5] dark:text-[#7C5CFF]"
                }`}
              >
                {m.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#4F46E5] text-white font-medium"
                    : "bg-[#F7F8FC] dark:bg-[#151518] text-[#111827] dark:text-white border border-[#E5E7EB] dark:border-[#27272A]"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <span className={`block text-[9px] mt-1.5 text-right opacity-60`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-[#EEF2FF] dark:bg-[#1E1638] text-[#4F46E5] dark:text-[#7C5CFF] flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 animate-bounce" />
              </div>
              <div className="rounded-2xl bg-[#F7F8FC] dark:bg-[#151518] p-3 text-xs text-[#667085] dark:text-[#A1A1AA] flex items-center gap-2 border border-[#E5E7EB] dark:border-[#27272A]">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#4F46E5]" />
                <span>Checking your Nex LapTech account details...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="p-3 border-t border-[#E5E7EB] dark:border-[#27272A] bg-[#F7F8FC] dark:bg-[#111113] flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInput(prompt);
              }}
              className="rounded-xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#151518] px-3 py-1.5 text-[11px] font-semibold text-[#667085] dark:text-[#A1A1AA] hover:text-[#4F46E5] dark:hover:text-[#7C5CFF] transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-[#E5E7EB] dark:border-[#27272A] flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about your orders, repair status, deals, or hardware..."
            className="flex-1 rounded-2xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-4 py-3 text-xs text-[#111827] dark:text-white focus:outline-none focus:border-[#4F46E5]"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="rounded-2xl bg-[#4F46E5] hover:bg-indigo-700 text-white p-3 font-bold text-xs disabled:opacity-50 transition-colors shadow-xs"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
