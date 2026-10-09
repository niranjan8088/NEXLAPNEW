"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeId = "day" | "night";

export type GlobalPolicy = "personal" | "forced";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  mode: "light" | "dark";
  primary: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
}

export const THEME_PRESETS: Record<ThemeId, ThemeConfig> = {
  day: {
    id: "day",
    name: "Arctic Glass Light",
    description: "Bright, Clean & Premium Light UI",
    mode: "light",
    primary: "#2563EB",
    accent: "#0891B2",
    bg: "#FFFFFF",
    surface: "#FFFFFF",
    text: "#0F172A",
  },
  night: {
    id: "night",
    name: "Arctic Glass Dark",
    description: "Sleek Arctic Glass Dark Mode",
    mode: "dark",
    primary: "#2563EB",
    accent: "#0891B2",
    bg: "#0B1220",
    surface: "#101B2B",
    text: "#F8FAFC",
  },
};

interface ThemeContextType {
  theme: ThemeId;
  activeThemeConfig: ThemeConfig;
  globalPolicy: GlobalPolicy;
  forcedTheme: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  toggleTheme: () => void;
  setGlobalPolicy: (policy: GlobalPolicy, forcedThemeId?: ThemeId) => Promise<void>;
  resetToDefault: () => void;
  isForced: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [userTheme, setUserTheme] = useState<ThemeId>("day");
  const [globalPolicy, setGlobalPolicyState] = useState<GlobalPolicy>("personal");
  const [forcedTheme, setForcedThemeState] = useState<ThemeId>("day");
  const [mounted, setMounted] = useState(false);

  // Computed effective active theme
  const effectiveThemeId: ThemeId =
    globalPolicy === "forced" && THEME_PRESETS[forcedTheme]
      ? forcedTheme
      : THEME_PRESETS[userTheme]
      ? userTheme
      : "day";

  const activeThemeConfig = THEME_PRESETS[effectiveThemeId] || THEME_PRESETS["day"];

  // Apply DOM attributes instantly
  const applyThemeToDom = (themeId: ThemeId) => {
    const target = themeId === "night" ? "night" : "day";
    document.documentElement.setAttribute("data-theme", target);
    if (target === "night") {
      document.documentElement.classList.add("dark", "night");
      document.documentElement.classList.remove("light", "day");
    } else {
      document.documentElement.classList.add("light", "day");
      document.documentElement.classList.remove("dark", "night");
    }
  };

  // Helper to map legacy theme strings to day/night
  const mapLegacyTheme = (val: string | null): ThemeId => {
    if (!val) return "day";
    if (val === "night" || val === "dark" || val.includes("dark") || val.includes("midnight") || val.includes("black")) {
      return "night";
    }
    return "day";
  };

  // Initial hydration & server sync
  useEffect(() => {
    setMounted(true);
    try {
      const savedUser = localStorage.getItem("nexbyte_theme") || localStorage.getItem("nexbyte-theme") || localStorage.getItem("theme");
      if (savedUser) {
        setUserTheme(mapLegacyTheme(savedUser));
      }
    } catch (e) {}

    // Load admin global policy from server
    fetchSystemSettings();

    // Listen for custom theme broadcasts
    const handleBroadcast = (e: any) => {
      if (e.detail?.table === "system_settings") {
        fetchSystemSettings();
      }
    };
    window.addEventListener("nexbyte-data-changed", handleBroadcast);
    return () => window.removeEventListener("nexbyte-data-changed", handleBroadcast);
  }, []);

  // Fetch admin global policy
  const fetchSystemSettings = async () => {
    try {
      const res = await fetch("/api/system/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.policy) setGlobalPolicyState(data.policy);
        if (data.forcedTheme) {
          setForcedThemeState(mapLegacyTheme(data.forcedTheme));
        }
      }
    } catch (e) {
      // ignore
    }
  };

  // Sync DOM whenever effectiveThemeId changes
  useEffect(() => {
    if (mounted) {
      applyThemeToDom(effectiveThemeId);
    }
  }, [effectiveThemeId, mounted]);

  const setTheme = (newTheme: ThemeId) => {
    const valid = newTheme === "night" ? "night" : "day";
    setUserTheme(valid);
    try {
      localStorage.setItem("nexbyte_theme", valid);
      localStorage.setItem("nexbyte-theme", valid);
      localStorage.setItem("theme", valid);
    } catch (e) {}
    if (globalPolicy !== "forced") {
      applyThemeToDom(valid);
    }
  };

  const toggleTheme = () => {
    const next = effectiveThemeId === "day" ? "night" : "day";
    setTheme(next);
  };

  const setGlobalPolicy = async (policy: GlobalPolicy, forcedThemeId?: ThemeId) => {
    const targetForced = forcedThemeId ? (forcedThemeId === "night" ? "night" : "day") : forcedTheme;
    setGlobalPolicyState(policy);
    setForcedThemeState(targetForced);

    try {
      await fetch("/api/system/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policy,
          forcedTheme: targetForced,
        }),
      });
    } catch (e) {
      console.error("Global theme policy save error", e);
    }
  };

  const resetToDefault = () => {
    setTheme("day");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: effectiveThemeId,
        activeThemeConfig,
        globalPolicy,
        forcedTheme,
        setTheme,
        toggleTheme,
        setGlobalPolicy,
        resetToDefault,
        isForced: globalPolicy === "forced",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
