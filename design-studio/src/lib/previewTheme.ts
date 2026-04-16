import { contrastText, darken, lighten, luminance, mix, toHsl, withAlpha } from "./color";
import { FORM_RADIUS_VALUES, RADIUS_VALUES, THEME_PRESET_TINTS, getFontCss } from "./presets";
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
  const cardShadow = dark
    ? `0 14px 40px ${withAlpha("#020617", 0.24)}`
    : `0 1px 1px rgba(15, 23, 42, 0.02), 0 8px 24px rgba(15, 23, 42, 0.035)`;
  const surfaceRadius = RADIUS_VALUES[spec.shape.radius];
  const formRadius = FORM_RADIUS_VALUES[spec.shape.formRadius];

  return {
    "--studio-page": page,
    "--studio-shell": shell,
    "--studio-surface": surface,
    "--studio-raised": raised,
    "--studio-stage": dark ? neutralDark(0.2103, 0.98) : neutralLight(1, 0),
    "--studio-board": colorMix(dark ? neutralDark(0.257, 0.82) : neutralLight(0.9702, 1), presetTint, boardTintStrength * 0.18),
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
    "--studio-shadow-soft": `0 12px 36px ${withAlpha("#0f172a", dark ? 0.22 : 0.06)}`,
    "--studio-display-font": getFontCss(spec.typography.displayFont),
    "--studio-body-font": getFontCss(spec.typography.bodyFont),
    "--studio-mono-font": getFontCss(spec.typography.monoFont),
    "--studio-accent-contrast": contrastText(spec.colors.accent)
  } as Record<string, string>;
}
