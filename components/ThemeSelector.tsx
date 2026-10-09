"use client";

import React, { useState } from "react";
import { useTheme, THEME_PRESETS, ThemeId, GlobalPolicy } from "@/components/ThemeProvider";
import { CheckCircle2, RefreshCw, Lock, Globe, User, Sun, Moon } from "lucide-react";

interface ThemeSelectorProps {
  isAdmin?: boolean;
}

export default function ThemeSelector({ isAdmin = false }: ThemeSelectorProps) {
  const {
    theme,
    globalPolicy,
    forcedTheme,
    setTheme,
    setGlobalPolicy,
    resetToDefault,
    isForced,
  } = useTheme();

  const [savingPolicy, setSavingPolicy] = useState(false);
  const [policySuccessMsg, setPolicySuccessMsg] = useState("");
  const [selectedAdminPolicy, setSelectedAdminPolicy] = useState<GlobalPolicy>(globalPolicy);
  const [selectedAdminForcedTheme, setSelectedAdminForcedTheme] = useState<ThemeId>(forcedTheme);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSelectTheme = (id: ThemeId) => {
    if (isForced && !isAdmin) return;
    setTheme(id);
  };

  const handleSaveGlobalPolicy = async () => {
    setSavingPolicy(true);
    setPolicySuccessMsg("");
    try {
      await setGlobalPolicy(selectedAdminPolicy, selectedAdminForcedTheme);
      setPolicySuccessMsg("Global appearance settings updated.");
      setTimeout(() => setPolicySuccessMsg(""), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleConfirmReset = () => {
    resetToDefault();
    setShowResetModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Policy Warning Banner if Global Theme Forced */}
      {isForced && !isAdmin && (
        <div className="rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 p-4 text-xs flex items-center gap-3 text-neutral-800 dark:text-neutral-200 shadow-sm">
          <Lock className="h-5 w-5 shrink-0" />
          <div>
            <span className="font-bold block">Global Theme Policy Active</span>
            <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
              An enterprise global theme policy has been set by the Admin. Theme mode is synchronized across all consoles.
            </span>
          </div>
        </div>
      )}

      {/* Admin Global Policy Control Section */}
      {isAdmin && (
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <Globe className="h-5 w-5 text-neutral-900 dark:text-white" />
            <div>
              <h3 className="font-display font-bold text-base text-neutral-900 dark:text-white">
                Global Theme Policy (Admin Control)
              </h3>
              <p className="text-xs text-neutral-500">
                Enforce a single uniform theme across Customer, Reseller, and Admin consoles, or allow personal preference.
              </p>
            </div>
          </div>

          {policySuccessMsg && (
            <div className="rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 p-4 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{policySuccessMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => setSelectedAdminPolicy("personal")}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedAdminPolicy === "personal"
                    ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-900 dark:border-white ring-2 ring-neutral-400/30"
                    : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-950"
                }`}
              >
                <input
                  type="radio"
                  name="policy"
                  checked={selectedAdminPolicy === "personal"}
                  onChange={() => setSelectedAdminPolicy("personal")}
                  className="mt-0.5 accent-neutral-900 dark:accent-white"
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Personal Choice
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Users and resellers can individually toggle Day or Night mode.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setSelectedAdminPolicy("forced")}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedAdminPolicy === "forced"
                    ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-900 dark:border-white ring-2 ring-neutral-400/30"
                    : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-950"
                }`}
              >
                <input
                  type="radio"
                  name="policy"
                  checked={selectedAdminPolicy === "forced"}
                  onChange={() => setSelectedAdminPolicy("forced")}
                  className="mt-0.5 accent-neutral-900 dark:accent-white"
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Force Theme Mode For Everyone
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Lock all portal interfaces to Day or Night mode globally.
                  </p>
                </div>
              </label>
            </div>

            {selectedAdminPolicy === "forced" && (
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                  Mandatory Global Theme Selection:
                </label>
                <select
                  value={selectedAdminForcedTheme}
                  onChange={(e) => setSelectedAdminForcedTheme(e.target.value as ThemeId)}
                  className="w-full max-w-md rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2.5 text-xs font-bold text-neutral-900 dark:text-white shadow-sm"
                >
                  <option value="day">☀ DAY Mode (Pure Light #FFFFFF)</option>
                  <option value="night">☾ NIGHT Mode (Pure Dark #000000)</option>
                </select>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveGlobalPolicy}
                disabled={savingPolicy}
                className="rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs px-6 py-2.5 shadow-sm transition-all disabled:opacity-50"
              >
                {savingPolicy ? "Saving Policy..." : "Save Global Theme Policy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Available Theme Options Grid (Day vs Night Only) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-extrabold text-lg text-neutral-900 dark:text-white">
              Global Appearance Theme
            </h3>
            <p className="text-xs text-neutral-500">
              Select your appearance mode. Only pure Day and Night monochrome modes are supported.
            </p>
          </div>

          <button
            onClick={() => setShowResetModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset to Default (Day)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* DAY THEME CARD */}
          {(() => {
            const isSelected = theme === "day";
            const isDisabled = isForced && !isAdmin;

            return (
              <div
                onClick={() => !isDisabled && handleSelectTheme("day")}
                className={`group relative rounded-3xl border transition-all duration-300 p-6 flex flex-col justify-between space-y-5 cursor-pointer ${
                  isSelected
                    ? "bg-white text-black border-neutral-900 ring-2 ring-neutral-900/20 shadow-lg"
                    : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 shadow-sm"
                } ${isDisabled ? "opacity-75 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider bg-neutral-100 text-neutral-900 border border-neutral-300">
                    <Sun className="h-4 w-4 text-neutral-900" />
                    <span>☀ DAY MODE</span>
                  </span>

                  {isSelected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black text-white px-3 py-1 text-xs font-extrabold">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Active</span>
                    </span>
                  )}
                </div>

                <div className="rounded-2xl p-4 border border-neutral-200 bg-white space-y-3 shadow-inner">
                  <div className="h-6 rounded-lg bg-neutral-100 px-3 flex items-center justify-between border border-neutral-200">
                    <div className="h-2 w-16 bg-neutral-900 rounded" />
                    <div className="h-3 w-8 bg-neutral-900 rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-16 rounded-lg bg-neutral-100 border border-neutral-200 p-1.5 space-y-1">
                      <div className="h-2 bg-neutral-300 rounded" />
                      <div className="h-2 bg-black rounded" />
                    </div>
                    <div className="col-span-2 h-16 rounded-lg bg-neutral-50 border border-neutral-200 p-2 flex flex-col justify-between">
                      <div className="h-2 w-20 bg-neutral-900 rounded" />
                      <div className="h-4 w-12 bg-black rounded text-[8px] text-white font-bold flex items-center justify-center">
                        Button
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-display font-extrabold text-base text-neutral-900">
                    ☀ DAY (Pure Light)
                  </h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Background: #FFFFFF, Surface: #FFFFFF, Primary Text: #000000, Border: #E5E5E5. High contrast monochrome readability.
                  </p>
                </div>
              </div>
            );
          })()}

          {/* NIGHT THEME CARD */}
          {(() => {
            const isSelected = theme === "night";
            const isDisabled = isForced && !isAdmin;

            return (
              <div
                onClick={() => !isDisabled && handleSelectTheme("night")}
                className={`group relative rounded-3xl border transition-all duration-300 p-6 flex flex-col justify-between space-y-5 cursor-pointer ${
                  isSelected
                    ? "bg-neutral-950 text-white border-white ring-2 ring-white/20 shadow-lg"
                    : "bg-neutral-900 text-white border-neutral-800 hover:border-neutral-700 shadow-sm"
                } ${isDisabled ? "opacity-75 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider bg-neutral-800 text-white border border-neutral-700">
                    <Moon className="h-4 w-4 text-white" />
                    <span>☾ NIGHT MODE</span>
                  </span>

                  {isSelected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white text-black px-3 py-1 text-xs font-extrabold">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Active</span>
                    </span>
                  )}
                </div>

                <div className="rounded-2xl p-4 border border-neutral-800 bg-neutral-950 space-y-3 shadow-inner">
                  <div className="h-6 rounded-lg bg-neutral-900 px-3 flex items-center justify-between border border-neutral-800">
                    <div className="h-2 w-16 bg-white rounded" />
                    <div className="h-3 w-8 bg-white rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-16 rounded-lg bg-neutral-900 border border-neutral-800 p-1.5 space-y-1">
                      <div className="h-2 bg-neutral-700 rounded" />
                      <div className="h-2 bg-white rounded" />
                    </div>
                    <div className="col-span-2 h-16 rounded-lg bg-neutral-900 border border-neutral-800 p-2 flex flex-col justify-between">
                      <div className="h-2 w-20 bg-white rounded" />
                      <div className="h-4 w-12 bg-white rounded text-[8px] text-black font-bold flex items-center justify-center">
                        Button
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-display font-extrabold text-base text-white">
                    ☾ NIGHT (Pure Dark)
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Background: #000000, Surface: #111111, Primary Text: #FFFFFF, Border: #262626. Pure dark mode for night usage.
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Confirmation Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white">
              <RefreshCw className="h-5 w-5" />
              <h4 className="font-display font-bold text-base">
                Reset Appearance Theme?
              </h4>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Reset appearance to the default Day theme (Pure Light #FFFFFF)?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-bold text-white bg-black dark:bg-white dark:text-black hover:bg-neutral-800 rounded-xl shadow-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
