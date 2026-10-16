# NEXLAPTECH
## Master UI/UX Design Bible & Enterprise Product Design Document (PDD)
### Section 6: Enterprise Design System Specification

***

## 1. Color Palette Tokens

```css
/* Core Color Palette Tokens */
--color-bg-dark: #0B1120;       /* Deep Space Ink */
--color-bg-panel: #0E1626;      /* Glassmorphic Panel Navy */
--color-primary: #1E5EFF;       /* Electric Royal Blue */
--color-primary-hover: #3B72FF; /* Lighter Royal Blue */
--color-accent-cyan: #00D8F6;   /* Neon Cyan Accent */
--color-accent-gold: #F59E0B;   /* Gold Star / Alert Amber */
--color-success: #10B981;       /* Emerald Success Green */
--color-error: #EF4444;         /* Coral Error Red */
--color-text-main: #F8FAFC;     /* Pure White Primary Text */
--color-text-muted: #94A3B8;    /* Slate Muted Subtext */
--color-border-glass: rgba(255, 255, 255, 0.1);
```

***

## 2. Typography System

- **Primary Heading Font:** `Outfit`, sans-serif (Weights: 600 SemiBold, 700 Bold, 800 ExtraBold)
- **Body & Interface Font:** `Inter`, sans-serif (Weights: 400 Regular, 500 Medium, 600 SemiBold)

### Scale
- Display H1: `text-4xl md:text-6xl font-extrabold tracking-tight`
- Section H2: `text-2xl md:text-4xl font-bold`
- Card H3: `text-lg md:text-xl font-semibold`
- Body Text: `text-sm md:text-base text-nex-mist leading-relaxed`
- Small Caption: `text-xs text-nex-mist/80`

***

## 3. Glassmorphism & Shadow Tokens

```css
/* Glassmorphism & Shadow Effects */
.glass-panel {
  background: rgba(14, 22, 38, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.shadow-glow-blue {
  box-shadow: 0 0 25px rgba(30, 94, 255, 0.25);
}

.shadow-glow-cyan {
  box-shadow: 0 0 25px rgba(0, 216, 246, 0.25);
}
```

***

## 4. Component Styles

### Buttons
- **Primary Action:** `bg-nex-blue text-white hover:bg-nex-blueLight shadow-glow-blue px-6 py-3 rounded-xl font-bold transition-all`
- **Secondary Action:** `bg-white/10 text-white hover:bg-white/20 border border-white/10 px-6 py-3 rounded-xl font-semibold transition-all`
- **Danger Action:** `bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 px-4 py-2 rounded-lg font-semibold`

### Forms & Inputs
- **Text Input:** `w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-nex-mist/50 focus:border-nex-cyan focus:outline-none transition-colors`
