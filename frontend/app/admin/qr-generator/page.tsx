"use client";

import React, { useState } from "react";
import { QrCode, Download, Link, RefreshCw } from "lucide-react";

export default function AdminQRGenerator() {
  const [text, setText] = useState("https://nexbytetechnologies.com");
  const [size, setSize] = useState(250);
  const [qrUrl, setQrUrl] = useState(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent("https://nexbytetechnologies.com")}`);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text.trim())}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <QrCode className="h-6 w-6 text-cyan-400" /> Unified QR Generator
        </h1>
        <p className="text-xs text-nex-mist mt-0.5">Generate QR code anchors for certification validation or website marketing assets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Generator Controls */}
        <div className="glass-card p-6 border-cyan-500/10 space-y-4">
          <h3 className="font-bold text-white text-sm">Generator Settings</h3>
          
          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] text-nex-mist block uppercase">QR Code Data URL / Text</label>
              <textarea
                rows={3}
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter URL or text payload..."
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white resize-none focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-nex-mist block uppercase">QR Image Size (px)</label>
              <select 
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white"
              >
                <option value={150}>150 x 150</option>
                <option value={200}>200 x 200</option>
                <option value={250}>250 x 250</option>
                <option value={300}>300 x 300</option>
              </select>
            </div>

            <button type="submit" className="w-full btn-primary !py-2.5 text-xs bg-cyan-600 hover:bg-cyan-500 border-none shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              Generate QR Code
            </button>
          </form>
        </div>

        {/* Visual Output */}
        <div className="glass-card p-6 border-cyan-500/10 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="h-64 w-64 bg-white rounded-2xl p-4 flex items-center justify-center border border-white/10 overflow-hidden">
            {qrUrl && (
              <img
                src={qrUrl}
                alt="Generated QR"
                className="object-contain max-h-full max-w-full"
              />
            )}
          </div>

          <div className="space-y-1 text-xs">
            <span className="text-[10px] text-nex-mist uppercase block">Target Payload Link</span>
            <span className="font-mono text-[10px] text-white break-all max-w-[280px] block">{text}</span>
          </div>

          <a 
            href={qrUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-secondary !py-2 !px-6 text-xs border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
          >
            <Download className="h-4 w-4" /> Download QR Code (PNG)
          </a>
        </div>

      </div>
    </div>
  );
}
