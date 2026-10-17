"use client";

import React, { useEffect, useState } from "react";
import { Plus, Image as ImageIcon, FileText, Film, Trash2, Search, RefreshCw, UploadCloud, Link } from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [fileType, setFileType] = useState("image/png");

  const load = async () => {
    setLoading(true);
    try {
      const list = await dbHelper.media.list();
      setMediaList(list);
    } catch {
      alert("Failed to load media assets.");
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    try {
      await dbHelper.media.create({ title, url, fileType });
      setTitle("");
      setUrl("");
      setShowUpload(false);
      load();
      window.dispatchEvent(new CustomEvent("nexbyte-realtime"));
    } catch {
      alert("Failed to register media asset.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media file?")) return;
    try {
      await dbHelper.media.delete(id);
      load();
      window.dispatchEvent(new CustomEvent("nexbyte-realtime"));
    } catch {
      alert("Failed to delete media asset.");
    }
  };

  const filtered = mediaList.filter((m) =>
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.fileType?.toLowerCase().includes(search.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return <ImageIcon className="h-5 w-5 text-cyan-400" />;
    if (type.includes("video")) return <Film className="h-5 w-5 text-purple-400" />;
    return <FileText className="h-5 w-5 text-yellow-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-cyan-400" /> Media Library Assets
          </h1>
          <p className="text-xs text-nex-mist mt-0.5">Manage photos, documents, and promotional media links instantly.</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary !py-2 !px-4 text-xs bg-cyan-600 hover:bg-cyan-500 border-none shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <UploadCloud className="h-4 w-4" /> Upload Asset
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 glass-card p-4 border-cyan-500/10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets by file title or type..."
            className="w-full rounded-xl bg-white/[0.03] border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="h-6 w-6 animate-spin text-cyan-400 mx-auto" />
          <p className="text-xs text-nex-mist mt-2">Loading media assets...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass-card border-white/5">
          <ImageIcon className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-xs text-nex-mist">No media assets cataloged.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map((m) => (
            <div key={m.id} className="glass-card p-4 border-cyan-500/10 flex flex-col justify-between group overflow-hidden">
              <div className="space-y-3">
                {/* Visual Thumbnail */}
                <div className="h-32 w-full bg-white/[0.02] border border-white/5 rounded-xl relative overflow-hidden flex items-center justify-center">
                  {m.fileType.includes("image") ? (
                    <img src={m.url} alt={m.title} className="object-contain max-h-full max-w-full" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      {getFileIcon(m.fileType)}
                      <span className="text-[9px] uppercase font-bold text-white/40">{m.fileType}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-white text-xs truncate">{m.title}</h4>
                  <span className="text-[9px] text-white/30 truncate block mt-0.5">{m.url}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center gap-2">
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
                  <Link className="h-3 w-3" /> View Asset
                </a>
                <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-white/5 rounded-lg">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowUpload(false)} />
          <div className="relative w-full max-w-md glass-panel bg-nex-ink border border-cyan-500/20 p-6 rounded-2xl shadow-glow-blue">
            <h3 className="font-display text-lg font-bold text-white mb-4">Register Media Resource</h3>
            
            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-nex-mist block uppercase">Asset Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Laptop Repair Banner Poster" className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-nex-mist block uppercase">Asset URI Link</label>
                <input type="text" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="e.g. /images/repair-poster.png or external link..." className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-nex-mist block uppercase">File Category Type</label>
                <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white">
                  <option value="image/png">Image (PNG)</option>
                  <option value="image/jpeg">Image (JPEG)</option>
                  <option value="application/pdf">Document (PDF)</option>
                  <option value="video/mp4">Video (MP4)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button type="button" onClick={() => setShowUpload(false)} className="btn-secondary !py-2 !px-4 text-xs">Cancel</button>
                <button type="submit" className="btn-primary !py-2 !px-6 text-xs bg-cyan-600 hover:bg-cyan-500 border-none shadow-[0_0_15px_rgba(6,182,212,0.3)]">Register Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
