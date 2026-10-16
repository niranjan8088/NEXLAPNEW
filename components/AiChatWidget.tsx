"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  X,
  Copy,
  Check,
  Globe,
  Paperclip,
  Square,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Minimize2,
  FileText
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
  actionRequired?: {
    tool: string;
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
  } | null;
  fileAttachment?: { name: string; size: string } | null;
}

export default function AiChatWidget({ portal }: { portal: "customer" | "reseller" | "admin" }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; text: string } | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [toolExecuting, setToolExecuting] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content:
        portal === "customer"
          ? "Hello! I'm **NexLapTech Customer AI**.\n\nI can help you check your **orders, service bookings, laptops, and training certificates**. Ask me anything!"
          : portal === "reseller"
          ? "Hello! I'm **NexLapTech Reseller AI**.\n\nI can analyze your **listed products, stock levels, orders, and customer messages**. How can I help you today?"
          : "Hello! I'm **NexLapTech Admin AI**.\n\nI can provide platform-wide insights on **orders, revenue, reseller applications, and catalog inventory**.",
      timestamp: new Date(),
      confidence: 1.0,
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, isGenerating]);

  const handleSendMessage = async () => {
    if ((!input.trim() && !attachedFile) || isGenerating) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      fileAttachment: attachedFile ? { name: attachedFile.name, size: attachedFile.size } : null,
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    const curFile = attachedFile;
    setAttachedFile(null);
    setIsGenerating(true);

    const assistantMsgId = `a-${Date.now()}`;
    const initialAssistant: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages([...updated, initialAssistant]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
          webSearch,
          fileContext: curFile ? curFile.text : "",
        }),
      });

      if (!response.ok) throw new Error("AI request failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value, { stream: true });
          const lines = textChunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") break;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.chunk) {
                  fullText += parsed.chunk;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: fullText,
                            confidence: parsed.confidence,
                            sources: parsed.sources,
                            actionRequired: parsed.actionRequired,
                          }
                        : m
                    )
                  );
                }
              } catch {}
            }
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: "Something went wrong while generating response. Please try again.",
                confidence: 0.3,
              }
            : m
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecuteTool = async (tool: string) => {
    setToolExecuting(true);
    setActionSuccess(null);
    try {
      const res = await fetch("/api/ai/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, confirm: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");

      setActionSuccess(data.message || "Action executed successfully.");
    } catch (err: any) {
      setActionSuccess(`Error: ${err.message}`);
    } finally {
      setToolExecuting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        text: (ev.target?.result as string) || "",
      });
    };
    reader.readAsText(file);
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, '<code class="bg-black/40 px-1 py-0.5 rounded text-nex-blueLight font-mono text-[11px]">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-nex-blueLight underline">$1</a>')
      .replace(/\n/g, "<br/>");
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-[#2563EB] px-4 py-3 text-xs font-bold text-white shadow-lg shadow-[#2563EB]/25 hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <div className="relative">
            <Bot className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span>
            {portal === "customer" ? "Ask NexLapTech AI" : portal === "reseller" ? "Reseller AI" : "Admin AI"}
          </span>
        </button>
      )}

      {/* Chat Panel Window */}
      {open && (
        <div
          className={`fixed z-50 ${
            portal === "customer"
              ? "bg-white border border-[#E2E8F0] text-[#0F172A]"
              : "bg-nex-ink border border-white/10 text-white"
          } rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 ${
            expanded
              ? "inset-4 sm:inset-10"
              : "bottom-6 right-6 w-[90vw] sm:w-[420px] h-[580px]"
          }`}
        >
          {/* Header */}
          <div
            className={`h-14 ${
              portal === "customer"
                ? "bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#0F172A]"
                : "bg-nex-black border-b border-white/10 text-white"
            } px-4 flex items-center justify-between shrink-0`}
          >
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/30 flex items-center justify-center">
                <Bot className="h-4 w-4 text-[#2563EB]" />
              </div>
              <div>
                <h3 className={`text-xs font-bold ${portal === "customer" ? "text-[#0F172A]" : "text-white"} uppercase tracking-wide`}>
                  {portal === "customer" ? "Customer AI Assistant" : portal === "reseller" ? "Reseller AI Assistant" : "Admin AI Assistant"}
                </h3>
                <span className="text-[9px] text-emerald-600 font-mono font-bold">Grounded Database AI</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setWebSearch(!webSearch)}
                className={`p-1.5 rounded-lg border text-[10px] flex items-center gap-1 ${
                  webSearch
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-700 dark:text-cyan-300"
                    : portal === "customer"
                    ? "border-[#E2E8F0] text-[#64748B]"
                    : "border-white/10 text-nex-mist"
                }`}
                title="Toggle Web Search"
              >
                <Globe className="h-3 w-3" />
              </button>
              <button onClick={() => setExpanded(!expanded)} className={`p-1.5 ${portal === "customer" ? "text-[#64748B] hover:text-[#0F172A]" : "text-nex-mist hover:text-white"}`}>
                {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => setOpen(false)} className={`p-1.5 ${portal === "customer" ? "text-[#64748B] hover:text-[#0F172A]" : "text-nex-mist hover:text-white"}`}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action notification banner */}
          {actionSuccess && (
            <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${m.role === "user" ? "items-end" : "items-start"}`}>
                  {m.fileAttachment && (
                    <div className="mb-1 text-[10px] text-[#2563EB] flex items-center gap-1">
                      <FileText className="h-3 w-3" /> {m.fileAttachment.name}
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl leading-relaxed ${
                      m.role === "user"
                        ? "bg-[#2563EB] text-white rounded-tr-none shadow-xs font-medium"
                        : portal === "customer"
                        ? "bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] rounded-tl-none font-medium"
                        : "bg-white/[0.04] border border-white/10 text-white/90 rounded-tl-none"
                    }`}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
                  />

                  {/* Action Confirmation Buttons if payload exists */}
                  {m.actionRequired && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 space-y-2">
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-300">{m.actionRequired.title}</p>
                      <p className="text-[11px] text-[#475569] dark:text-white/80">{m.actionRequired.description}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleExecuteTool(m.actionRequired!.tool)}
                          disabled={toolExecuting}
                          className="btn-primary py-1.5 px-3 text-[11px] font-bold shadow-xs"
                        >
                          {toolExecuting ? "Executing..." : m.actionRequired.confirmText}
                        </button>
                        <button
                          onClick={() => setActionSuccess("Action cancelled by user.")}
                          className="btn-secondary py-1.5 px-3 text-[11px]"
                        >
                          {m.actionRequired.cancelText}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2563EB]" />
                <span>AI processing grounded data...</span>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input Section */}
          <div className={`p-3 ${portal === "customer" ? "bg-[#F8FAFC] border-t border-[#E2E8F0]" : "bg-nex-black border-t border-white/10"} shrink-0`}>
            {attachedFile && (
              <div className="mb-2 text-[10px] text-[#2563EB] flex items-center justify-between bg-white border border-[#E2E8F0] p-1.5 rounded-lg">
                <span>📎 {attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)} className="hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input type="file" ref={fileRef} onChange={handleFileUpload} className="hidden" />
              <button
                onClick={() => fileRef.current?.click()}
                className={`p-2 ${portal === "customer" ? "text-[#64748B] hover:text-[#0F172A]" : "text-nex-mist hover:text-white"} rounded-lg`}
                title="Attach Document"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask NexLapTech AI..."
                className={`flex-1 rounded-xl ${
                  portal === "customer"
                    ? "bg-white border border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8]"
                    : "bg-white/[0.04] border border-white/10 text-white placeholder-white/30"
                } px-3 py-2 text-xs focus:border-[#2563EB] focus:outline-none`}
              />

              <button
                onClick={handleSendMessage}
                disabled={!input.trim() && !attachedFile}
                className="p-2 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-xs disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
