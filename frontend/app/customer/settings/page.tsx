"use client";

import { useState } from "react";
import { Settings, CheckCircle2 } from "lucide-react";
import ThemeSelector from "@/components/ThemeSelector";

export default function CustomerSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E6EAF0] dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Settings className="h-3.5 w-3.5 text-slate-500" /> Portal Preferences
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
          Customize your customer portal experience, theme preferences, and notification channels.
        </p>
      </div>

      {savedSuccess && (
        <div className="rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Settings Options Grid */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E6EAF0] dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-8">
        {/* Appearance & Themes */}
        <ThemeSelector isAdmin={false} />

        {/* Notifications Section */}
        <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-white/5">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Notification Preferences</h3>
            <p className="text-xs text-slate-500">Manage how you receive repair updates and promotional coupons.</p>
          </div>

          <div className="space-y-3 max-w-xl">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 cursor-pointer">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Email Order &amp; Repair Updates</span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4 accent-sky-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 cursor-pointer">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">SMS Technician Dispatch Alerts</span>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="h-4 w-4 accent-sky-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveSettings}
            className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-6 py-2.5 shadow-sm transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
