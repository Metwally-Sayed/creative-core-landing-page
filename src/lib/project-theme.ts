import type { ProjectColor, ProjectThemeRole } from "@/lib/project-catalog";

export type ThemePaletteColor = {
  hex: string;
  name: string;
};

export type ThemePalette = {
  accent?: ThemePaletteColor | null;
  secondary?: ThemePaletteColor | null;
  background?: ThemePaletteColor | null;
  foreground?: ThemePaletteColor | null;
  supporting?: ThemePaletteColor[] | null;
};

export type ProjectPageTheme = {
  "--accent": string;
  "--accent-foreground": string;
  "--secondary": string;
  "--secondary-foreground": string;
  "--background": string;
  "--foreground": string;
  "--card": string;
  "--card-foreground": string;
  "--popover": string;
  "--popover-foreground": string;
  "--primary": string;
  "--primary-foreground": string;
  "--muted": string;
  "--muted-foreground": string;
  "--border": string;
  "--input": string;
  "--ring": string;
  "--sidebar-background": string;
  "--sidebar-foreground": string;
  "--sidebar-primary": string;
  "--sidebar-primary-foreground": string;
  "--sidebar-accent": string;
  "--sidebar-accent-foreground": string;
  "--sidebar-border": string;
  "--sidebar-ring": string;
  "--shadow-soft": string;
  "--shadow-float": string;
};

export const COLOR_TOKENS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--border",
  "--input",
  "--ring",
  "--sidebar-background",
  "--sidebar-foreground",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
  "--sidebar-border",
  "--sidebar-ring",
] as const;

type HslColor = {
  h: number;
  s: number;
  l: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function parseHex(hex: string) {
  const value = hex.trim();
  if (!/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(value)) return null;

  const normalized =
    value.length === 4
      ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
      : value;

  const red = Number.parseInt(normalized.slice(1, 3), 16);
  const green = Number.parseInt(normalized.slice(3, 5), 16);
  const blue = Number.parseInt(normalized.slice(5, 7), 16);

  return { red, green, blue };
}

function rgbToHsl(red: number, green: number, blue: number): HslColor {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;

  let hue = 0;
  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;

    hue *= 60;
    if (hue < 0) hue += 360;
  }

  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  return {
    h: Math.round(hue),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

const toChannels = (color: HslColor) =>
  `${Math.round(color.h)} ${clamp(Math.round(color.s), 0, 100)}% ${clamp(
    Math.round(color.l),
    0,
    100,
  )}%`;

function readableForeground(background: HslColor): HslColor {
  return background.l > 58 ? { h: 220, s: 35, l: 12 } : { h: 0, s: 0, l: 98 };
}

function normaliseColor(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function pushPaletteColor(
  colors: ProjectColor[],
  color: ThemePaletteColor | null | undefined,
  themeRole: ProjectThemeRole,
) {
  if (!color || typeof color !== "object") return;

  const hex = normaliseColor(color.hex);
  const name = normaliseColor(color.name);
  if (!hex && !name) return;

  colors.push({ hex, name, themeRole });
}

export function hasThemePaletteColors(palette: ThemePalette | Record<string, never> | null | undefined) {
  return buildProjectPaletteColors(palette).length > 0;
}

export function resolveThemeInheritance(
  inheritThemeFromPalette: boolean | null | undefined,
  themePreferenceConfigured: boolean | null | undefined,
  themePalette: ThemePalette | Record<string, never> | null | undefined,
) {
  return themePreferenceConfigured
    ? Boolean(inheritThemeFromPalette)
    : hasThemePaletteColors(themePalette);
}

export function buildProjectPaletteColors(
  palette: ThemePalette | Record<string, never> | null | undefined,
) {
  if (!palette || typeof palette !== "object") return [];

  const source = palette as ThemePalette;
  const colors: ProjectColor[] = [];

  if (Object.prototype.hasOwnProperty.call(source, "accent")) {
    pushPaletteColor(colors, source.accent, "accent");
  }
  if (Object.prototype.hasOwnProperty.call(source, "secondary")) {
    pushPaletteColor(colors, source.secondary, "secondary");
  }
  if (Object.prototype.hasOwnProperty.call(source, "background")) {
    pushPaletteColor(colors, source.background, "background");
  }
  if (Object.prototype.hasOwnProperty.call(source, "foreground")) {
    pushPaletteColor(colors, source.foreground, "foreground");
  }

  for (const color of source.supporting ?? []) {
    pushPaletteColor(colors, color, "showcase");
  }

  return colors;
}

export function buildProjectThemeTokens(colors: ProjectColor[]): ProjectPageTheme | null {
  const parsed = colors
    .map((item) => {
      const rgb = parseHex(item.hex);
      if (!rgb) {
        return null;
      }

      return {
        color: rgbToHsl(rgb.red, rgb.green, rgb.blue),
        themeRole: item.themeRole,
      };
    })
    .filter(
      (
        item,
      ): item is {
        color: HslColor;
        themeRole: ProjectColor["themeRole"];
      } => Boolean(item),
    );

  if (parsed.length === 0) return null;

  const explicit = {
    accent: parsed.find((item) => item.themeRole === "accent")?.color,
    secondary: parsed.find((item) => item.themeRole === "secondary")?.color,
    background: parsed.find((item) => item.themeRole === "background")?.color,
    foreground: parsed.find((item) => item.themeRole === "foreground")?.color,
  };

  const fallbackPool = parsed
    .filter((item) => item.themeRole === null)
    .map((item) => item.color);
  const takeFallback = () => fallbackPool.shift();

  if (
    !explicit.accent &&
    !explicit.secondary &&
    !explicit.background &&
    !explicit.foreground &&
    fallbackPool.length === 0
  ) {
    return null;
  }

  const accent = explicit.accent ?? takeFallback();
  if (!accent) return null;

  const secondary =
    explicit.secondary ?? takeFallback() ?? {
      h: accent.h,
      s: clamp(accent.s + 8, 18, 92),
      l: clamp(accent.l + 16, 24, 74),
    };
  const background =
    explicit.background ?? takeFallback() ?? {
      h: accent.h,
      s: clamp(accent.s * 0.25, 8, 28),
      l: 96,
    };
  const foreground = explicit.foreground ?? takeFallback() ?? readableForeground(background);

  const card = {
    h: background.h,
    s: clamp(background.s + 2, 6, 32),
    l: clamp(background.l + (background.l > 50 ? 2 : 6), 8, 98),
  };
  const muted = {
    h: background.h,
    s: clamp(background.s + 4, 6, 36),
    l: clamp(background.l + (background.l > 50 ? -6 : 8), 6, 94),
  };
  const border = {
    h: background.h,
    s: clamp(background.s + 6, 8, 30),
    l: clamp(background.l + (background.l > 50 ? -12 : 16), 18, 82),
  };
  const mutedForeground = {
    h: foreground.h,
    s: clamp(foreground.s - 10, 6, 42),
    l: clamp(foreground.l + (background.l > 50 ? 18 : -12), 28, 86),
  };
  const accentForeground = readableForeground(accent);
  const secondaryForeground = readableForeground(secondary);

  return {
    "--background": toChannels(background),
    "--foreground": toChannels(foreground),
    "--card": toChannels(card),
    "--card-foreground": toChannels(foreground),
    "--popover": toChannels(card),
    "--popover-foreground": toChannels(foreground),
    "--primary": toChannels(accent),
    "--primary-foreground": toChannels(accentForeground),
    "--secondary": toChannels(secondary),
    "--secondary-foreground": toChannels(secondaryForeground),
    "--muted": toChannels(muted),
    "--muted-foreground": toChannels(mutedForeground),
    "--accent": toChannels(accent),
    "--accent-foreground": toChannels(accentForeground),
    "--border": toChannels(border),
    "--input": toChannels(border),
    "--ring": toChannels(secondary),
    "--sidebar-background": toChannels(background),
    "--sidebar-foreground": toChannels(foreground),
    "--sidebar-primary": toChannels(accent),
    "--sidebar-primary-foreground": toChannels(accentForeground),
    "--sidebar-accent": toChannels(accent),
    "--sidebar-accent-foreground": toChannels(accentForeground),
    "--sidebar-border": toChannels(border),
    "--sidebar-ring": toChannels(secondary),
    "--shadow-soft": `0 14px 40px hsl(${accent.h} ${accent.s}% ${accent.l}% / 0.08)`,
    "--shadow-float": `0 24px 70px hsl(${accent.h} ${accent.s}% ${accent.l}% / 0.12)`,
  };
}
