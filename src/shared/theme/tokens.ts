// CarbonAI design tokens as plain values. Two consumers read them: theme.ts (for styled-components) and the
// chart options (ECharts draws on a canvas and cannot read a styled-components theme). One source, no drift.
export const color = {
  // Brand. Teal means "CarbonAI, interactive, or data".
  teal: "#397f86",
  tealDark: "#2f696f", // hover, pressed, and teal text that sits on the page background
  tealSoft: "#d2e5e6", // selected rows and filters, quiet data fills
  // Attention only. Never decoration, and never a text colour (2.2:1 on white).
  amber: "#e7a33c",
  // Surfaces
  cream: "#fffbf4", // used selectively: the unit-choice bar, the needs-attention card, flagged values, the empty state
  bg: "#f5f9f9",
  bgAlt: "#f4f3f6",
  card: "#ffffff",
  // Text: three levels, no other greys
  ink: "#111827",
  body: "#374151",
  muted: "#6b7280",
  // Borders
  line: "#d1d5db",
  lineSoft: "#e0ddd7",
};

export const radius = {
  sm: "6px",
  lg: "24px",
  md: "16px",
  pill: "999px",
};

export const shadow = {
  sm: "0 1px 2px rgba(17, 24, 39, 0.06)",
  md: "0 18px 40px rgba(17, 24, 39, 0.08)", // only for things that sit above the page
};

// 4px spacing scale. Use these steps, not ad hoc pixel values.
export const space = { 1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "24px", 6: "32px", 7: "48px" };

// Type scale. 14px is the base for a dense analyst tool.
export const fontSize = { xs: "12px", sm: "13px", base: "14px", md: "16px", lg: "20px", xl: "30px" };

export const sans = `"Roboto", sans-serif`;
