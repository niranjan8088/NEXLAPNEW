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
    name: "Nex LapTech Light",
    description: "Premium light storefront experience",
    mode: "light",
    primary: "#2563EB",
    accent: "#0EA5E9",
    bg: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#0F172A",
  },
  night: {
    id: "night",
    name: "Nex LapTech Light",
    description: "Premium light storefront experience",
    mode: "light",
    primary: "#2563EB",
    accent: "#0EA5E9",
    bg: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#0F172A",
  },
};

const normalizeTheme = (value?: ThemeId | null): ThemeId => "day";

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
      ? normalizeTheme(forcedTheme)
      : THEME_PRESETS[userTheme]
      ? normalizeTheme(userTheme)
      : "day";

  const activeThemeConfig = THEME_PRESETS[effectiveThemeId] || THEME_PRESETS["day"];

  // Apply DOM attributes instantly
  const applyThemeToDom = (themeId: ThemeId) => {
    const target = "day";
    document.documentElement.setAttribute("data-theme", target);
    document.documentElement.classList.add("light", "day");
    document.documentElement.classList.remove("dark", "night");
  };

  // Helper to map legacy theme strings to day/night
  const mapLegacyTheme = (val: string | null): ThemeId => {
    if (!val) return "day";
    return "day";
  };

  // Initial hydration & server sync
  useEffect(() => {
    setMounted(true);
    try {
      const savedUser = localStorage.getItem("nexbyte_theme") || localStorage.getItem("nexbyte-theme") || localStorage.getItem("theme");
      if (savedUser) {
        setUserTheme(normalizeTheme(mapLegacyTheme(savedUser)));
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
          setForcedThemeState(normalizeTheme(mapLegacyTheme(data.forcedTheme)));
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
    const valid = normalizeTheme(newTheme);
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
    setTheme("day");
  };

  const setGlobalPolicy = async (policy: GlobalPolicy, forcedThemeId?: ThemeId) => {
    const targetForced = normalizeTheme(forcedThemeId ?? forcedTheme);
    const response = await fetch("/api/system/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ policy, forcedTheme: targetForced }),
    });
    const result = await response.json();
    if (!response.ok || result.success === false) {
      throw new Error(result.error || "Unable to save global appearance settings.");
    }

    setGlobalPolicyState(result.policy === "forced" ? "forced" : "personal");
    setForcedThemeState(normalizeTheme(result.forcedTheme));
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
