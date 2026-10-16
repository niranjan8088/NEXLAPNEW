import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Unified Nex LapTech Theme Tokens
        nex: {
          primary: "var(--color-primary, #0EA5E9)",
          primaryHover: "var(--color-primary-hover, #0284C7)",
          primarySoft: "var(--color-primary-soft, #E0F2FE)",
          accent: "var(--color-accent, #F472B6)",
          accentHover: "var(--color-accent-hover, #EC4899)",
          accentSoft: "var(--color-accent-soft, #FCE7F3)",
          bg: "var(--color-background, #F8FAFC)",
          surface: "var(--color-surface, #FFFFFF)",
          surface2: "var(--color-surface-secondary, #F1F5F9)",
          border: "var(--color-border, #E2E8F0)",
          text: "var(--color-text, #0F172A)",
          textMuted: "var(--color-text-secondary, #64748B)",
          textSoft: "var(--color-text-soft, #94A3B8)",
          // Backward compatibility mappings
          blue: "var(--color-primary, #0EA5E9)",
          blueLight: "var(--color-primary-soft, #E0F2FE)",
          blueDeep: "var(--color-primary-hover, #0284C7)",
          white: "var(--color-surface, #FFFFFF)",
          mist: "var(--color-text-secondary, #64748B)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        "glow-blue": "0 0 20px var(--color-primary-glow, rgba(14,165,233,0.25)), 0 0 60px var(--color-primary-soft, rgba(14,165,233,0.15))",
        "glow-pink": "0 0 20px var(--color-accent-glow, rgba(244,114,182,0.22)), 0 0 60px var(--color-accent-soft, rgba(244,114,182,0.15))",
        "glow-blue-lg": "0 0 40px var(--color-primary-glow, rgba(14,165,233,0.35)), 0 0 100px var(--color-primary-soft, rgba(14,165,233,0.2))",
        "glass": "0 8px 32px rgba(0,0,0,0.06)",
      },
      backgroundImage: {
        "grid-glow":
          "radial-gradient(circle at 50% 0%, var(--color-primary-soft, rgba(14,165,233,0.15)), transparent 60%)",
        "hero-radial":
          "radial-gradient(ellipse 80% 60% at 50% -10%, var(--color-primary-glow, rgba(14,165,233,0.25)), transparent 70%)",
        "hero-ambient":
          "radial-gradient(circle at 20% 20%, rgba(14,165,233,0.12), transparent 40%), radial-gradient(circle at 80% 80%, rgba(244,114,182,0.10), transparent 40%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", filter: "blur(20px)" },
          "50%": { opacity: "1", filter: "blur(28px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        marquee: "marquee 30s linear infinite",
        "scan-line": "scan-line 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
