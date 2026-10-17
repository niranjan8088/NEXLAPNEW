"use client";

import { Settings } from "lucide-react";

export default function ResellerSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
        <p className="text-xs text-nex-mist mt-0.5">Configure your reseller account settings.</p>
      </div>
      <div className="text-center py-20 glass-panel rounded-2xl border border-white/5">
        <Settings className="h-10 w-10 text-nex-mist mx-auto mb-3" />
        <p className="text-xs text-white">Advanced settings coming soon.</p>
        <p className="text-[10px] text-nex-mist mt-1">Contact admin to change email or business type.</p>
      </div>
    </div>
  );
}
