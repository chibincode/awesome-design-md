import { contrastText, darken, lighten, luminance, mix, toHsl, withAlpha } from "./color";
import { FORM_RADIUS_VALUES, RADIUS_VALUES, THEME_PRESET_TINTS, TYPOGRAPHY_SCALE, getFontCss } from "./presets";
import type { DesignSpec, PreviewMode, RadiusPreset, ThemePreset } from "../types/design";

function radiusPx(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function liftRadius(base: string, increment: number) {
  const numeric = radiusPx(base);
  if (numeric === 0) return "0px";
  return `${numeric + increment}px`;
}

function pillRadius(base: string, preset: RadiusPreset) {
  if (preset === "large" || preset === "extra-large") return "999px";
  return liftRadius(base, 4);
}

function oklch(lightness: number, chroma: number, hue: number) {
  return `oklch(${(lightness * 100).toFixed(2)}% ${Math.max(0, chroma).toFixed(4)} ${hue.toFixed(2)})`;
}

function colorMix(base: string, tint: string, weight: number) {
  const tintWeight = Math.max(0, Math.min(1, weight));
  const baseWeight = Math.max(0, 1 - tintWeight);
  return `color-mix(in oklch, ${base} ${(baseWeight * 100).toFixed(2)}%, ${tint} ${(tintWeight * 100).toFixed(2)}%)`;
}

const DENSITY_TOKENS = {
  compact: {
    gap: "10px",
    gapSm: "6px",
    gapLg: "14px",
    cardPadding: "14px",
    panelPadding: "22px",
    heroPadding: "42px 38px 36px",
    sectionMargin: "0 24px 20px",
    controlHeight: "36px"
  },
  comfortable: {
    gap: "16px",
    gapSm: "10px",
    gapLg: "22px",
    cardPadding: "18px",
    panelPadding: "28px",
    heroPadding: "58px 52px 48px",
    sectionMargin: "0 34px 28px",
    controlHeight: "42px"
  },
  spacious: {
    gap: "24px",
    gapSm: "14px",
    gapLg: "34px",
    cardPadding: "26px",
    panelPadding: "38px",
    heroPadding: "76px 70px 64px",
    sectionMargin: "0 44px 36px",
    controlHeight: "48px"
  }
} as const;

export function previewThemeVars(
  spec: DesignSpec,
  previewMode: PreviewMode,
  themePreset: ThemePreset = "default",
  baseTone = 0.0015
) {
  const dark = previewMode === "dark";
  const baseLum = luminance(spec.colors.base);
  const surfaceLum = luminance(spec.colors.surface);
  const designFeelsDark = spec.theme.themeMode === "dark" || baseLum < 0.28 || surfaceLum < 0.3;
  const accentHue = toHsl(spec.colors.accent)?.h ?? 253.83;
  const presetTint = THEME_PRESET_TINTS[themePreset];
  const shellTintStrength = themePreset === "default" ? 0 : dark ? 0.08 : 0.16;
  const boardTintStrength = themePreset === "default" ? 0 : dark ? 0.14 : 0.22;
  const baseChroma = Math.max(0, Math.min(0.015, baseTone));
  const neutralLight = (lightness: number, multiplier = 1) => oklch(lightness, Math.min(baseChroma * multiplier, 0.018), accentHue);
  const neutralDark = (lightness: number, multiplier = 1) => oklch(lightness, Math.min(Math.max(baseChroma, 0.004) * multiplier, 0.02), accentHue);
  const density = DENSITY_TOKENS[spec.layout.density];

  const page = dark
    ? darken(spec.colors.base, 0.9)
    : neutralLight(0.992, 0.18);
  const shellBase = dark
    ? neutralDark(0.145, 0.82)
    : neutralLight(0.982, 0.34);
  const shell = colorMix(shellBase, presetTint, shellTintStrength);
  const surfaceBase = dark
    ? neutralDark(designFeelsDark ? 0.22 : 0.28, 0.62)
    : neutralLight(0.995, 0.08);
  const surface = colorMix(surfaceBase, presetTint, themePreset === "default" ? 0 : dark ? 0.04 : 0.06);
  const raised = dark ? neutralDark(0.3, 0.78) : neutralLight(0.988, 0.22);
  const textPrimary = dark ? "oklch(98.48% 0 0)" : neutralLight(0.2103, 0.42);
  const textSecondary = dark ? neutralDark(0.705, 1.8) : neutralLight(0.5517, 0.92);
  const border = dark ? neutralDark(0.28, 1) : neutralLight(0.9, 1);
  const shadow =
    spec.elevation.preset === "flat"
      ? "none"
      : spec.elevation.preset === "ring"
        ? `0 0 0 1px ${withAlpha(spec.colors.accent, dark ? 0.36 : 0.14)}, 0 22px 60px ${withAlpha("#0f172a", dark ? 0.38 : 0.08)}`
        : spec.elevation.preset === "dramatic"
          ? `0 28px 90px ${withAlpha("#08101d", dark ? 0.55 : 0.14)}`
          : `0 18px 54px ${withAlpha("#0f172a", dark ? 0.34 : 0.08)}`;
  const cardSurface = dark ? neutralDark(0.22, 0.68) : neutralLight(1, 0.02);
  const fieldSurface = dark ? neutralDark(0.235, 0.6) : neutralLight(1, 0.01);
  const mutedSurface = dark ? neutralDark(0.7, 1.9) : neutralLight(0.9524, 0.8);
  const groupSurface = dark ? neutralDark(0.3964, 1.35) : neutralLight(0.9524, 1);
  const cardBorder = dark ? neutralDark(0.28, 1.1) : neutralLight(0.9, 1);
  const fieldBorder = dark ? neutralDark(0.28, 1) : neutralLight(0.92, 1);
  const cardShadow =
    spec.elevation.preset === "flat"
      ? "none"
      : spec.elevation.preset === "ring"
        ? `0 0 0 1px ${withAlpha(spec.colors.accent, dark ? 0.28 : 0.16)}, 0 10px 30px ${withAlpha("#0f172a", dark ? 0.26 : 0.05)}`
        : spec.elevation.preset === "dramatic"
          ? `0 30px 90px ${withAlpha("#08101d", dark ? 0.48 : 0.16)}, 0 8px 24px ${withAlpha("#08101d", dark ? 0.32 : 0.08)}`
          : dark
            ? `0 14px 40px ${withAlpha("#020617", 0.24)}`
            : `0 1px 1px rgba(15, 23, 42, 0.02), 0 8px 24px rgba(15, 23, 42, 0.035)`;
  const softShadow =
    spec.elevation.preset === "flat"
      ? "none"
      : spec.elevation.preset === "dramatic"
        ? `0 28px 80px ${withAlpha("#0f172a", dark ? 0.42 : 0.12)}`
        : spec.elevation.preset === "ring"
          ? `0 0 0 1px ${withAlpha(spec.colors.accent, dark ? 0.28 : 0.12)}, 0 14px 42px ${withAlpha("#0f172a", dark ? 0.2 : 0.05)}`
          : `0 12px 36px ${withAlpha("#0f172a", dark ? 0.22 : 0.06)}`;
  const heroSurface = dark ? neutralDark(0.18, 1.45) : neutralLight(0.974, 1.35);
  const heroSurfaceStrong = dark ? neutralDark(0.255, 2.1) : neutralLight(0.925, 1.8);
  const surfaceRadius = RADIUS_VALUES[spec.shape.radius];
  const formRadius = FORM_RADIUS_VALUES[spec.shape.formRadius];
  const [displayType, sectionType, cardType, bodyType, captionType] = TYPOGRAPHY_SCALE[spec.typography.scalePreset];

  return {
    "--studio-page": page,
    "--studio-shell": shell,
    "--studio-surface": surface,
    "--studio-raised": raised,
    "--studio-stage": dark ? neutralDark(0.2103, 0.98) : neutralLight(1, 0),
    "--studio-board": colorMix(dark ? neutralDark(0.257, 0.82) : neutralLight(0.9702, 1), presetTint, boardTintStrength * 0.18),
    "--studio-hero-surface": colorMix(heroSurface, presetTint, boardTintStrength * 0.1),
    "--studio-hero-surface-strong": colorMix(heroSurfaceStrong, presetTint, boardTintStrength * 0.14),
    "--studio-accent": spec.colors.accent,
    "--studio-accent-soft": withAlpha(spec.colors.accent, dark ? 0.22 : 0.14),
    "--studio-text": textPrimary,
    "--studio-text-muted": textSecondary,
    "--studio-border": border,
    "--studio-card-surface": cardSurface,
    "--studio-field-surface": fieldSurface,
    "--studio-muted-surface": mutedSurface,
    "--studio-group-surface": groupSurface,
    "--studio-card-border": cardBorder,
    "--studio-field-border": fieldBorder,
    "--studio-radius": surfaceRadius,
    "--studio-form-radius": formRadius,
    "--studio-card-radius": liftRadius(surfaceRadius, 8),
    "--studio-panel-radius": liftRadius(surfaceRadius, 12),
    "--studio-chip-radius": liftRadius(surfaceRadius, 4),
    "--studio-pill-radius": pillRadius(surfaceRadius, spec.shape.radius),
    "--studio-form-pill-radius": pillRadius(formRadius, spec.shape.formRadius),
    "--studio-shadow": shadow,
    "--studio-card-shadow": cardShadow,
    "--studio-shadow-soft": softShadow,
    "--studio-density-gap": density.gap,
    "--studio-density-gap-sm": density.gapSm,
    "--studio-density-gap-lg": density.gapLg,
    "--studio-density-card-padding": density.cardPadding,
    "--studio-density-panel-padding": density.panelPadding,
    "--studio-density-hero-padding": density.heroPadding,
    "--studio-density-section-margin": density.sectionMargin,
    "--studio-density-control-height": density.controlHeight,
    "--studio-display-font": getFontCss(spec.typography.displayFont),
    "--studio-body-font": getFontCss(spec.typography.bodyFont),
    "--studio-mono-font": getFontCss(spec.typography.monoFont),
    "--studio-type-display-size": displayType.size,
    "--studio-type-display-weight": displayType.weight,
    "--studio-type-display-line": displayType.lineHeight,
    "--studio-type-display-tracking": displayType.letterSpacing,
    "--studio-type-section-size": sectionType.size,
    "--studio-type-section-weight": sectionType.weight,
    "--studio-type-section-line": sectionType.lineHeight,
    "--studio-type-section-tracking": sectionType.letterSpacing,
    "--studio-type-card-size": cardType.size,
    "--studio-type-card-weight": cardType.weight,
    "--studio-type-card-line": cardType.lineHeight,
    "--studio-type-card-tracking": cardType.letterSpacing,
    "--studio-type-body-size": bodyType.size,
    "--studio-type-body-weight": bodyType.weight,
    "--studio-type-body-line": bodyType.lineHeight,
    "--studio-type-body-tracking": bodyType.letterSpacing,
    "--studio-type-caption-size": captionType.size,
    "--studio-type-caption-weight": captionType.weight,
    "--studio-type-caption-line": captionType.lineHeight,
    "--studio-type-caption-tracking": captionType.letterSpacing,
    "--studio-accent-contrast": contrastText(spec.colors.accent)
  } as Record<string, string>;
}
