"use client";

import React, { useState } from "react";
import { MapPin, Plus, Trash2, Edit } from "lucide-react";
import { business } from "@/lib/data";

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<any[]>([...(business.branches || [])]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="h-6 w-6 text-cyan-400" /> Branch Location Settings
          </h1>
          <p className="text-xs text-nex-mist mt-0.5">Manage office locations, logistics mapping, and opening status indicators.</p>
        </div>
      </div>

      <div className="space-y-4 max-w-3xl">
        {branches.map((b) => (
          <div key={b.name} className="glass-card p-5 border-cyan-500/10 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="text-xs space-y-1">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  {b.name}
                  {b.status === "opening-soon" && (
                    <span className="text-[8px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded uppercase font-black">
                      Opening Soon
                    </span>
                  )}
                </h3>
                <p className="text-nex-mist leading-relaxed">{b.location}</p>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button className="btn-secondary !py-1.5 !px-3 text-[10px]">
                <Edit className="h-3.5 w-3.5" /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
