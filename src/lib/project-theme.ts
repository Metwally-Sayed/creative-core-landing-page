export type ProjectPageTheme = {
  "--accent": string;
  "--accent-foreground": string;
  "--secondary": string;
  "--secondary-foreground": string;
  "--background": string;
  "--foreground": string;
  "--card": string;
  "--card-foreground": string;
  "--muted": string;
  "--muted-foreground": string;
  "--border": string;
  "--ring": string;
  "--shadow-soft": string;
  "--shadow-float": string;
};

export type ProjectPaletteColor = {
  hex: string;
  name: string;
};

type ThemeRole = "accent" | "secondary" | "background" | "foreground";

const DEFAULT_TOKENS: Record<ThemeRole, string> = {
  accent: "218 58% 30%",
  secondary: "23 76% 63%",
  background: "60 9% 96%",
  foreground: "218 65% 27%",
};

const DEFAULT_CARD = "0 0% 100%";
const DEFAULT_MUTED = "215 22% 88%";
const DEFAULT_MUTED_FOREGROUND = "218 30% 43%";
const DEFAULT_BORDER = "214 23% 82%";
const DEFAULT_RING = "23 76% 63%";

function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(hex.trim());
}

function hexToHsl(hex: string): string {
  const normalized = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
  if (!result) return "";

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function deriveForeground(hsl: string): string {
  const parts = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!parts) return "0 0% 100%";
  
  const l = parseInt(parts[3]);
  return l > 50 ? "218 65% 27%" : "0 0% 91%";
}

function deriveMuted(hsl: string): string {
  const parts = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!parts) return DEFAULT_MUTED;
  
  const h = parts[1];
  const s = Math.max(0, parseInt(parts[2]) - 15);
  const l = Math.min(100, parseInt(parts[3]) + 20);
  
  return `${h} ${s}% ${l}%`;
}

function deriveBorder(hsl: string): string {
  const parts = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!parts) return DEFAULT_BORDER;
  
  const h = parts[1];
  const s = Math.max(0, parseInt(parts[2]) - 20);
  const l = Math.min(100, parseInt(parts[3]) + 10);
  
  return `${h} ${s}% ${l}%`;
}

export function resolveProjectPageTheme(
  inheritTheme: boolean,
  colors: ProjectPaletteColor[]
): ProjectPageTheme | null {
  if (!inheritTheme) return null;

  const validColors: string[] = [];
  for (const color of colors) {
    if (color.hex && isValidHex(color.hex)) {
      validColors.push(color.hex.trim());
    }
  }

  if (validColors.length === 0) return null;

  const roleMap: Record<ThemeRole, string> = {
    accent: validColors[0] ? hexToHsl(validColors[0]) : DEFAULT_TOKENS.accent,
    secondary: validColors[1] ? hexToHsl(validColors[1]) : DEFAULT_TOKENS.secondary,
    background: validColors[2] ? hexToHsl(validColors[2]) : DEFAULT_TOKENS.background,
    foreground: validColors[3] ? hexToHsl(validColors[3]) : DEFAULT_TOKENS.foreground,
  };

  const accent = roleMap.accent;
  const secondary = roleMap.secondary;
  const background = roleMap.background;
  const foreground = roleMap.foreground;

  const card = background;
  const cardForeground = foreground;
  const muted = deriveMuted(accent);
  const mutedForeground = DEFAULT_MUTED_FOREGROUND;
  const border = deriveBorder(background);
  const ring = secondary;
  const shadowSoft = `0 14px 40px hsl(${accent} / 0.08)`;
  const shadowFloat = `0 24px 70px hsl(${accent} / 0.12)`;

  return {
    "--accent": accent,
    "--accent-foreground": deriveForeground(accent),
    "--secondary": secondary,
    "--secondary-foreground": deriveForeground(secondary),
    "--background": background,
    "--foreground": foreground,
    "--card": card,
    "--card-foreground": cardForeground,
    "--muted": muted,
    "--muted-foreground": mutedForeground,
    "--border": border,
    "--ring": ring,
    "--shadow-soft": shadowSoft,
    "--shadow-float": shadowFloat,
  };
}