// ── Tutoring sub-brand palette (blue — lean lighter) ─────────────────────────

export const tutoringPalette = {
  blue50: "#F0FAFF",
  blue200: "#C2E9FF",
  blue500: "#00A3FF",
  blue600: "#0082CC",
  blue800: "#004166",
  darkText: "#1A1A2E",
  grayText: "#5A5A70",
  white: "#FFFFFF",
  yellow: "#FFC700",
} as const;

// ── Tutoring gradient — light-blue backgrounds (standard) ────────────────────
// Stops end at 85% per brand spec so the full spectrum fits visible text area.
export const tutoringGradient =
  "linear-gradient(90deg, #1D49E3 0%, #00A3FF 15%, #66A693 35%, #E8A909 60%, #FF7A00 85%)";

// ── Tutoring gradient — photo / dark backgrounds (brighter variant) ──────────
export const tutoringGradientBright =
  "linear-gradient(90deg, #5B8CFF 0%, #33C8FF 15%, #7EC9A8 35%, #F5C542 60%, #FF8C33 85%)";

// ── Typography ───────────────────────────────────────────────────────────────
export const fontStacks = {
  display: "'Satoshi', 'Hanken Grotesk', system-ui, sans-serif",
  body: "'Hanken Grotesk', 'Satoshi', system-ui, sans-serif",
} as const;
