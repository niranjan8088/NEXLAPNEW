"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  Globe,
  Square,
  Settings as SettingsIcon,
  Download,
  Share2,
  Check,
  FileText,
  Code,
  Table as TableIcon,
  MessageSquare,
  X,
  ChevronDown,
  Info,
  Shield,
  Zap,
  Cpu,
  Layers,
  HelpCircle,
  Sun,
  Moon
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
  feedback?: "like" | "dislike" | null;
  fileAttachment?: { name: string; size: string; type: string; contentText?: string } | null;
}

interface Conversation {
  id: string;
  title: string;
  pinned: boolean;
  timestamp: Date;
  messages: Message[];
  model: string;
}

const AVAILABLE_MODELS = [
  { id: "nexbyte-v2-smart", name: "Nex LapTech Intelligence v2.5", desc: "Live DB Grounded RAG & Analytics", icon: Cpu },
  { id: "gpt-4o-mini", name: "GPT-4o Flash", desc: "OpenAI Fast Reasoning Engine", icon: Zap },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Pro", desc: "Google Multimodal & High Context", icon: Sparkles },
  { id: "grok-beta", name: "Grok-2 Engine", desc: "xAI Realtime Intelligence", icon: Layers },
  { id: "local-llama", name: "Local LLaMA 3", desc: "Offline Secure Fallback", icon: Shield },
];

export default function ChatGPTGrokAICenter() {
  // ── Conversations & Session State ──────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "conv-1",
      title: "Low Stock & Reorder Analysis",
      pinned: true,
      timestamp: new Date(),
      model: "nexbyte-v2-smart",
      messages: [
        {
          id: "m-1",
          role: "assistant",
          content: "Hello! I'm **Nex LapTech AI Assistant** — your advanced business intelligence partner.\n\nI can analyze your **products, stock levels, orders, reseller applications, and customer service bookings** using your actual database records.\n\nHow can I help you today?",
          timestamp: new Date(),
          confidence: 1.0,
        },
      ],
    },
  ]);

  const [activeConvId, setActiveConvId] = useState<string>("conv-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("nexbyte-v2-smart");
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("You are Nex LapTech AI Assistant, a helpful and accurate business intelligence AI.");
  const [temperature, setTemperature] = useState(0.7);

  // ── Input & Attachment State ──────────────────────────────────────────────
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: string; contentText: string } | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // ── Settings Modal State ──────────────────────────────────────────────────
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"general" | "ai" | "privacy" | "shortcuts">("general");
  const [assistantName, setAssistantName] = useState("Nex LapTech AI Assistant");
  const [lineWrap, setLineWrap] = useState(true);

  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Active conversation object
  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages, isGenerating]);

  // Auto-growing textarea logic
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  // ── Conversation Actions ─────────────────────────────────────────────────
  const createNewChat = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: "New Conversation",
      pinned: false,
      timestamp: new Date(),
      model: selectedModel,
      messages: [
        {
          id: `m-${Date.now()}`,
          role: "assistant",
          content: `Hello! I'm **${assistantName}**.\n\nAsk me anything about your products, inventory, orders, resellers, or technical queries. You can also upload files or toggle web search.`,
          timestamp: new Date(),
          confidence: 1.0,
        },
      ],
    };
    setConversations([newConv, ...conversations]);
    setActiveConvId(newConv.id);
  };

  const togglePinConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(
      conversations.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversations.length <= 1) return;
    const filtered = conversations.filter((c) => c.id !== id);
    setConversations(filtered);
    if (activeConvId === id) {
      setActiveConvId(filtered[0].id);
    }
  };

  const renameConversation = (id: string) => {
    const current = conversations.find((c) => c.id === id);
    const newTitle = prompt("Enter new title for conversation:", current?.title);
    if (newTitle && newTitle.trim()) {
      setConversations(
        conversations.map((c) => (c.id === id ? { ...c, title: newTitle.trim() } : c))
      );
    }
  };

  // ── File Upload Handler ──────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) || "";
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || "Document",
        contentText: text,
      });
    };
    reader.readAsText(file);
  };

  // ── Send Message & Streaming Handler ──────────────────────────────────────
  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if ((!messageText.trim() && !attachedFile) || isGenerating) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: messageText.trim(),
      timestamp: new Date(),
      fileAttachment: attachedFile,
    };

    // Update active conversation title if it's new
    let updatedTitle = activeConv.title;
    if (activeConv.title === "New Conversation") {
      updatedTitle = messageText.trim().substring(0, 30) || "Data Query";
    }

    const updatedMessages = [...activeConv.messages, userMsg];

    setConversations(
      conversations.map((c) =>
        c.id === activeConvId
          ? { ...c, title: updatedTitle, messages: updatedMessages }
          : c
      )
    );

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    const currentAttachment = attachedFile;
    setAttachedFile(null);
    setIsGenerating(true);

    // Placeholder Assistant Message for streaming
    const assistantMsgId = `a-${Date.now()}`;
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      confidence: 0.95,
      sources: webSearchEnabled ? ["Nex LapTech DB Grounding", "Web Knowledge 2026"] : ["Nex LapTech DB Grounding"],
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, messages: [...updatedMessages, initialAssistantMsg] }
          : c
      )
    );

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
          systemPrompt,
          webSearch: webSearchEnabled,
          temperature,
          fileContext: currentAttachment ? currentAttachment.contentText : "",
        }),
      });

      if (!response.ok) throw new Error("Failed to connect to AI server.");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          const lines = chunkText.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") break;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.chunk) {
                  streamedText += parsed.chunk;
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === activeConvId
                        ? {
                            ...c,
                            messages: c.messages.map((m) =>
                              m.id === assistantMsgId ? { ...m, content: streamedText } : m
                            ),
                          }
                        : c
                    )
                  );
                }
              } catch {}
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content:
                            "Something went wrong while generating the response. Please check your connection and try again.",
                          confidence: 0.3,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const handleRegenerate = (msgIndex: number) => {
    if (isGenerating) return;
    const historyUpToUser = activeConv.messages.slice(0, msgIndex);
    const lastUserMsg = historyUpToUser[historyUpToUser.length - 1];

    setConversations(
      conversations.map((c) =>
        c.id === activeConvId ? { ...c, messages: historyUpToUser } : c
      )
    );

    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleFeedback = (msgId: string, type: "like" | "dislike") => {
    setConversations(
      conversations.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === msgId ? { ...m, feedback: m.feedback === type ? null : type } : m
              ),
            }
          : c
      )
    );
  };

  const exportConversation = (format: "markdown" | "json") => {
    const text =
      format === "markdown"
        ? `# ${activeConv.title}\n\n` +
          activeConv.messages
            .map((m) => `**${m.role.toUpperCase()}**: ${m.content}`)
            .join("\n\n")
        : JSON.stringify(activeConv, null, 2);

    const blob = new Blob([text], { type: format === "markdown" ? "text/markdown" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeConv.title.replace(/\s+/g, "_")}.${format === "markdown" ? "md" : "json"}`;
    a.click();
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConvs = filteredConversations.filter((c) => c.pinned);
  const recentConvs = filteredConversations.filter((c) => !c.pinned);

  // Markdown Formatting Parser helper
  const renderMarkdown = (text: string) => {
    if (!text) return "";
    let formatted = text
      .replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-white mt-3 mb-1">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-white mt-4 mb-1">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold text-white mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, '<code class="font-mono bg-black/40 text-nex-blueLight px-1.5 py-0.5 rounded text-[11px]">$1</code>')
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-2 border-nex-blue pl-3 italic text-nex-mist my-2">$1</blockquote>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-nex-blueLight underline hover:text-white">$1</a>')
      .replace(/\n\n/g, "</p><p class='mt-2.5'>")
      .replace(/\n/g, "<br/>");

    return formatted;
  };

  return (
    <div className="flex h-[calc(100vh-100px)] w-full bg-nex-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
      {/* ── SIDEBAR (Left Column) ────────────────────────────────────────── */}
      <div className="w-64 sm:w-72 bg-nex-ink border-r border-white/10 flex flex-col justify-between shrink-0">
        <div className="p-4 space-y-4">
          {/* New Chat Button */}
          <button
            onClick={createNewChat}
            className="btn-primary w-full py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 rounded-2xl shadow-glow-blue transition-transform hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </button>

          {/* Search Conversations */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-nex-mist" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:border-nex-blue focus:outline-none"
            />
          </div>

          {/* Conversation History List */}
          <div className="space-y-4 max-h-[calc(100vh-360px)] overflow-y-auto pr-1 no-scrollbar">
            {/* Pinned Section */}
            {pinnedConvs.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-nex-mist mb-2 px-2 flex items-center gap-1">
                  <Pin className="h-3 w-3 text-amber-400" /> Pinned
                </p>
                <div className="space-y-1">
                  {pinnedConvs.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all text-xs ${
                        activeConvId === conv.id
                          ? "bg-nex-blue/20 border border-nex-blue/40 text-white font-bold shadow-glow-blue"
                          : "text-nex-mist hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare className="h-3.5 w-3.5 text-nex-blueLight shrink-0" />
                        <span className="truncate">{conv.title}</span>
                      </div>
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button onClick={(e) => togglePinConversation(conv.id, e)} className="hover:text-amber-400 p-0.5">
                          <Pin className="h-3 w-3 text-amber-400 fill-amber-400" />
                        </button>
                        <button onClick={() => renameConversation(conv.id)} className="hover:text-white p-0.5">
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button onClick={(e) => deleteConversation(conv.id, e)} className="hover:text-red-400 p-0.5">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Section */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-nex-mist mb-2 px-2">
                Recent Chats
              </p>
              <div className="space-y-1">
                {recentConvs.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all text-xs ${
                      activeConvId === conv.id
                        ? "bg-nex-blue/20 border border-nex-blue/40 text-white font-bold shadow-glow-blue"
                        : "text-nex-mist hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="h-3.5 w-3.5 text-white/40 shrink-0" />
                      <span className="truncate">{conv.title}</span>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button onClick={(e) => togglePinConversation(conv.id, e)} className="hover:text-amber-400 p-0.5">
                        <Pin className="h-3 w-3" />
                      </button>
                      <button onClick={() => renameConversation(conv.id)} className="hover:text-white p-0.5">
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button onClick={(e) => deleteConversation(conv.id, e)} className="hover:text-red-400 p-0.5">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer — Model Selector & Settings */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-black/20">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-nex-mist block mb-1.5">
              Active Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full rounded-xl bg-nex-black border border-white/10 px-3 py-2 text-xs text-white focus:border-nex-blue focus:outline-none cursor-pointer"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs text-nex-mist hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4 text-nex-blueLight" />
              <span>AI Settings</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── CENTER CHAT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between bg-nex-black relative overflow-hidden">
        {/* Header Bar */}
        <div className="h-16 border-b border-white/10 bg-nex-ink/80 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-nex-blue/20 border border-nex-blue/40 flex items-center justify-center">
              <Bot className="h-4 w-4 text-nex-blueLight" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{activeConv?.title}</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-nex-blue/20 text-nex-blueLight border border-nex-blue/30">
                  {AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.name}
                </span>
              </h2>
              <p className="text-[10px] text-nex-mist">Grounded live database RAG & contextual memory active.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Web Search Toggle */}
            <button
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                webSearchEnabled
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  : "bg-white/[0.04] border-white/10 text-nex-mist hover:text-white"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Web Search {webSearchEnabled ? "ON" : "OFF"}</span>
            </button>

            {/* Export Menu */}
            <button
              onClick={() => exportConversation("markdown")}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-nex-mist hover:text-white transition-colors"
              title="Export Conversation Markdown"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages Scroll Viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {activeConv?.messages.map((msg, idx) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="h-9 w-9 rounded-2xl bg-nex-blue/20 border border-nex-blue/40 flex items-center justify-center shrink-0 shadow-glow-blue mt-1">
                  <Bot className="h-5 w-5 text-nex-blueLight" />
                </div>
              )}

              <div className={`group relative max-w-[85%] sm:max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {/* Role Header */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-white/80">
                    {msg.role === "user" ? "You" : assistantName}
                  </span>
                  {msg.confidence !== undefined && msg.role === "assistant" && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      {Math.round(msg.confidence * 100)}% Grounded
                    </span>
                  )}
                  <span className="text-[9px] text-nex-mist/50">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* File Attachment Badge if present */}
                {msg.fileAttachment && (
                  <div className="mb-2 inline-flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/10 px-3 py-1.5 text-xs text-nex-blueLight">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{msg.fileAttachment.name} ({msg.fileAttachment.size})</span>
                  </div>
                )}

                {/* Message Content Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-nex-blue/30 border border-nex-blue/40 text-white rounded-tr-none shadow-glow-blue"
                      : "bg-nex-ink border border-white/10 text-white/90 rounded-tl-none glass-card"
                  }`}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />

                {/* Grounding Sources Badge */}
                {msg.sources && msg.sources.length > 0 && msg.role === "assistant" && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-nex-mist">
                    <span className="font-semibold text-white/60">Sources:</span>
                    {msg.sources.map((src, sIdx) => (
                      <span key={sIdx} className="rounded-full bg-white/[0.05] border border-white/10 px-2 py-0.5 text-nex-blueLight">
                        {src}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Toolbar on Hover */}
                <div
                  className={`mt-1.5 flex items-center gap-2 text-[11px] text-nex-mist opacity-0 group-hover:opacity-100 transition-opacity ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <button
                    onClick={() => handleCopyText(msg.content, msg.id)}
                    className="hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/[0.06]"
                  >
                    {copiedMsgId === msg.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedMsgId === msg.id ? "Copied" : "Copy"}</span>
                  </button>

                  {msg.role === "assistant" && (
                    <>
                      <button
                        onClick={() => handleRegenerate(idx)}
                        className="hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/[0.06]"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Regenerate</span>
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, "like")}
                        className={`hover:text-emerald-400 p-1 ${msg.feedback === "like" ? "text-emerald-400" : ""}`}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, "dislike")}
                        className={`hover:text-red-400 p-1 ${msg.feedback === "dislike" ? "text-red-400" : ""}`}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Live Streaming Indicator */}
          {isGenerating && (
            <div className="flex items-center gap-3 text-xs text-nex-mist">
              <div className="h-8 w-8 rounded-2xl bg-nex-blue/20 border border-nex-blue/40 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-nex-blueLight animate-pulse" />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-nex-ink border border-white/10 text-white">
                <Loader2 className="h-4 w-4 animate-spin text-nex-blueLight" />
                <span>Generating response...</span>
                <span className="font-mono text-nex-blueLight animate-pulse">▋</span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input Bar Section */}
        <div className="p-4 border-t border-white/10 bg-nex-ink/90 backdrop-blur-xl shrink-0">
          {/* File attachment preview pill */}
          {attachedFile && (
            <div className="mb-2 inline-flex items-center gap-2 rounded-xl bg-nex-blue/20 border border-nex-blue/40 px-3 py-1.5 text-xs text-white">
              <FileText className="h-3.5 w-3.5 text-nex-blueLight" />
              <span className="font-semibold">{attachedFile.name}</span>
              <span className="text-[10px] text-nex-mist">({attachedFile.size})</span>
              <button onClick={() => setAttachedFile(null)} className="hover:text-red-400 ml-1">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="relative flex items-end gap-2 bg-nex-black border border-white/10 rounded-2xl p-2 focus-within:border-nex-blue/50 focus-within:ring-1 focus-within:ring-nex-blue/30 transition-all">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.txt,.docx,.csv,.xlsx,.json,.js,.ts,.py,image/*"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-nex-mist hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors mb-0.5"
              title="Attach File (PDF, TXT, CSV, Code, Image)"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {/* Auto-growing Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Message Nex LapTech AI Assistant... (Press Enter to send, Shift+Enter for new line)"
              className="flex-1 bg-transparent py-2 px-1 text-xs text-white placeholder-white/30 focus:outline-none resize-none max-h-44 scrollbar-thin"
            />

            {/* Stop or Send Button */}
            {isGenerating ? (
              <button
                onClick={handleStopGeneration}
                className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors mb-0.5"
                title="Stop Generation"
              >
                <Square className="h-4 w-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() && !attachedFile}
                className="p-2.5 rounded-xl btn-primary shadow-glow-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all mb-0.5"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-nex-mist px-1">
            <span>AI responses are grounded in live database. Shift+Enter for new line.</span>
            <span>{selectedModel}</span>
          </div>
        </div>
      </div>

      {/* ── SETTINGS MODAL ────────────────────────────────────────────────── */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-5">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-nex-ink p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-nex-blueLight" /> AI System & Assistant Settings
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="hover:text-white text-nex-mist">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-white/10 gap-4 text-xs font-semibold">
              {(["general", "ai", "privacy", "shortcuts"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSettingsTab(t)}
                  className={`pb-2 capitalize border-b-2 ${
                    settingsTab === t ? "border-nex-blue text-white font-bold" : "border-transparent text-nex-mist"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Settings Tab Content */}
            {settingsTab === "general" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">Assistant Name</label>
                  <input
                    type="text"
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-xs text-white focus:border-nex-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">Line Wrapping in Code Blocks</label>
                  <button
                    onClick={() => setLineWrap(!lineWrap)}
                    className="btn-secondary py-2 px-4 text-xs flex items-center gap-2"
                  >
                    <Check className={`h-4 w-4 ${lineWrap ? "text-emerald-400" : "opacity-0"}`} />
                    <span>Enable Code Line Wrap</span>
                  </button>
                </div>
              </div>
            )}

            {settingsTab === "ai" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">System Instructions Prompt</label>
                  <textarea
                    rows={3}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-white focus:border-nex-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">
                    Creativity Temperature ({temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-nex-blue cursor-pointer"
                  />
                </div>
              </div>
            )}

            {settingsTab === "privacy" && (
              <div className="space-y-4 text-xs">
                <p className="text-nex-mist">Manage your conversation history and stored session tokens.</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setConversations([])} className="btn-secondary text-red-400 py-2 px-4">
                    Clear All Chat History
                  </button>
                  <button onClick={() => exportConversation("json")} className="btn-primary py-2 px-4">
                    Export Data (JSON)
                  </button>
                </div>
              </div>
            )}

            {settingsTab === "shortcuts" && (
              <div className="space-y-2 text-xs text-nex-mist">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Send Message</span> <code className="text-white bg-black/40 px-2 py-0.5 rounded">Enter</code>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>New Line</span> <code className="text-white bg-black/40 px-2 py-0.5 rounded">Shift + Enter</code>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>New Chat</span> <code className="text-white bg-black/40 px-2 py-0.5 rounded">Alt + N</code>
                </div>
              </div>
            )}

            <div className="pt-2 text-right">
              <button onClick={() => setShowSettingsModal(false)} className="btn-primary py-2 px-6 text-xs font-bold">
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
