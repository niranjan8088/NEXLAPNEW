"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Shield, Bell, Palette, Database, Save, Check, AlertTriangle, RefreshCw } from "lucide-react";
import ThemeSelector from "@/components/ThemeSelector";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "notifications" | "system">("appearance");

  // Profile
  const [adminName, setAdminName] = useState("Nex LapTech Admin");
  const [adminEmail, setAdminEmail] = useState("admin@nexbyte.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Notification prefs
  const [notifyBooking, setNotifyBooking] = useState(true);
  const [notifyReview, setNotifyReview] = useState(true);
  const [notifyContact, setNotifyContact] = useState(true);
  const [notifyLaptop, setNotifyLaptop] = useState(true);
  const [notifyInternship, setNotifyInternship] = useState(true);
  const [notifyTraining, setNotifyTraining] = useState(true);

  // System
  const [autoLogoutMin, setAutoLogoutMin] = useState(30);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearMockDb = () => {
    if (confirm("This will clear all local mock data and reset to defaults. Continue?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExportAll = () => {
    const keys = ["bookings", "products", "services", "internships", "training", "notifications", "contacts", "laptop_enquiries", "reviews", "users", "gallery", "cms_content"];
    const exportData: Record<string, any> = {};
    keys.forEach((k) => {
      const val = localStorage.getItem(`nexbyte_${k}`);
      if (val) exportData[k] = JSON.parse(val);
    });
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `NexLapTech_Full_Export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { key: "profile" as const, label: "Admin Profile", icon: <Shield className="h-4 w-4" /> },
    { key: "appearance" as const, label: "Appearance & Global Policy", icon: <Palette className="h-4 w-4" /> },
    { key: "notifications" as const, label: "Notification Preferences", icon: <Bell className="h-4 w-4" /> },
    { key: "system" as const, label: "System & Database", icon: <Database className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-black dark:text-white flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-black dark:text-white" /> Settings
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Admin profile, notification preferences, and system configuration.</p>
        </div>
        <button onClick={handleSave} className={`btn-primary !py-2.5 !px-5 text-xs flex items-center gap-1.5 transition-all ${saved ? "bg-green-600 text-white" : ""}`}>
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-neutral-200 dark:border-neutral-800 pb-2">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === tab.key ? "bg-black text-white dark:bg-white dark:text-black shadow-sm" : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="glass-panel bg-nex-ink border border-white/5 rounded-2xl p-6 space-y-5 max-w-2xl">
          <h2 className="text-sm font-bold text-white">Admin Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-white/80 font-semibold">Display Name</label>
              <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)}
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/80 font-semibold">Email Address</label>
              <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none" />
            </div>
          </div>
          <div className="border-t border-white/5 pt-5">
            <h3 className="text-xs font-bold text-white mb-3">Change Password</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-white/80 font-semibold">Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/80 font-semibold">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none" />
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3.5 text-xs text-blue-400">
            <strong>Note:</strong> Password changes require Supabase Auth to be configured. In local dev mode, use the default credentials.
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === "appearance" && (
        <ThemeSelector isAdmin={true} />
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="glass-panel bg-nex-ink border border-white/5 rounded-2xl p-6 space-y-5 max-w-2xl">
          <h2 className="text-sm font-bold text-white">Notification Preferences</h2>
          <p className="text-xs text-nex-mist">Choose which events trigger admin notifications.</p>
          <div className="space-y-3">
            {[
              { label: "New Service Bookings", value: notifyBooking, set: setNotifyBooking },
              { label: "New Customer Reviews", value: notifyReview, set: setNotifyReview },
              { label: "Contact Form Submissions", value: notifyContact, set: setNotifyContact },
              { label: "Laptop Purchase Enquiries", value: notifyLaptop, set: setNotifyLaptop },
              { label: "Internship Applications", value: notifyInternship, set: setNotifyInternship },
              { label: "Training Registrations", value: notifyTraining, set: setNotifyTraining },
            ].map((pref) => (
              <label key={pref.label} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                <span className="text-xs text-white font-medium">{pref.label}</span>
                <div onClick={() => pref.set(!pref.value)}
                  className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${pref.value ? "bg-nex-blue" : "bg-white/10"}`}>
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${pref.value ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === "system" && (
        <div className="space-y-6 max-w-2xl">
          <div className="glass-panel bg-nex-ink border border-white/5 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-bold text-white">System Preferences</h2>
            <div className="space-y-1">
              <label className="text-xs text-white/80 font-semibold">Auto-Logout Timer (minutes)</label>
              <input type="number" min={5} max={120} value={autoLogoutMin} onChange={(e) => setAutoLogoutMin(Number(e.target.value))}
                className="w-32 rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none" />
              <p className="text-[10px] text-nex-mist mt-1">Session expires after {autoLogoutMin} minutes of inactivity</p>
            </div>
          </div>

          <div className="glass-panel bg-nex-ink border border-white/5 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-bold text-white">Database Management</h2>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleExportAll} className="btn-secondary !py-2.5 !px-4 text-xs flex items-center gap-1.5">
                <Database className="h-4 w-4" /> Export All Data (JSON)
              </button>
              <button onClick={handleClearMockDb} className="btn-secondary !py-2.5 !px-4 text-xs flex items-center gap-1.5 bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20">
                <RefreshCw className="h-4 w-4" /> Reset Mock Database
              </button>
            </div>
            <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3.5 text-xs text-yellow-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Resetting the mock database will clear all local data and restore default seed records. This cannot be undone.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
