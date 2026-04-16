import { hslToHex, toHsl } from "../lib/color";
import { DOCK_FONT_OPTIONS, THEME_PRESET_OPTIONS } from "../lib/presets";
import type { DesignSpec, RadiusPreset, ThemePreset } from "../types/design";

interface TokenDockProps {
  spec: DesignSpec;
  onColorChange: (key: keyof DesignSpec["colors"], value: string) => void;
  baseTone: number;
  onBaseToneChange: (value: number) => void;
  onFontFamilyChange: (value: string) => void;
  onShapeChange: (key: keyof DesignSpec["shape"], value: RadiusPreset) => void;
  themePreset: ThemePreset;
  onThemePresetChange: (value: ThemePreset) => void;
}

const radiusOptions: RadiusPreset[] = ["none", "extra-small", "small", "medium", "large"];
const formRadiusOptions: RadiusPreset[] = ["none", "extra-small", "small", "medium", "large", "extra-large"];

const radiusAbbrev: Record<RadiusPreset, string> = {
  none: "-",
  "extra-small": "XS",
  small: "S",
  medium: "M",
  large: "L",
  "extra-large": "XL"
};

function huePosition(input: string) {
  return toHsl(input)?.h ?? 200;
}

function dockFontFamily(spec: DesignSpec["typography"]) {
  return DOCK_FONT_OPTIONS.find((option) => option === spec.bodyFont || option === spec.displayFont) ?? spec.displayFont ?? spec.bodyFont ?? "Inter";
}

function dockFontOptions(spec: DesignSpec["typography"]) {
  const currentFont = spec.displayFont || spec.bodyFont;
  if (!currentFont || DOCK_FONT_OPTIONS.includes(currentFont as (typeof DOCK_FONT_OPTIONS)[number])) {
    return DOCK_FONT_OPTIONS;
  }

  return [currentFont, ...DOCK_FONT_OPTIONS] as const;
}

export function TokenDock({
  spec,
  onColorChange,
  baseTone,
  onBaseToneChange,
  onFontFamilyChange,
  onShapeChange,
  themePreset,
  onThemePresetChange
}: TokenDockProps) {
  const accentTone = toHsl(spec.colors.accent);
  const accentPosition = huePosition(spec.colors.accent);
  const accentSaturation = accentTone ? Math.max(0.72, accentTone.s) : 0.82;
  const accentLightness = accentTone ? Math.min(0.62, Math.max(0.48, accentTone.l)) : 0.56;
  const basePosition = Math.round((Math.max(0, Math.min(0.012, baseTone)) / 0.012) * 100);
  const baseThumb = hslToHex(accentTone?.h ?? 253.83, 0.12, 0.72);
  const activeDockFont = dockFontFamily(spec.typography);
  const fontOptions = dockFontOptions(spec.typography);

  return (
    <div className="token-dock token-dock--hero">
      <div className="dock-control dock-control--tone">
        <span className="dock-control__label">
          Accent <span className="dock-control__hint">i</span>
        </span>
        <div className="dock-control__inline">
          <label className="tone-track tone-track--accent">
            <span
              className="tone-track__thumb"
              style={{
                left: `${accentPosition / 3.6}%`,
                backgroundColor: spec.colors.accent
              }}
            />
            <input
              aria-label="Accent hue"
              className="tone-track__input"
              type="range"
              min="0"
              max="360"
              step="1"
              value={accentPosition}
              onChange={(event) =>
                onColorChange("accent", hslToHex(Number(event.target.value), accentSaturation, accentLightness))
              }
            />
          </label>
          <label className="tone-swatch tone-swatch--dock" aria-label="Accent color">
            <span className="tone-swatch__chip" style={{ backgroundColor: spec.colors.accent }} />
            <input type="color" value={spec.colors.accent} onChange={(event) => onColorChange("accent", event.target.value)} />
          </label>
        </div>
      </div>

      <div className="dock-control dock-control--tone dock-control--base">
        <span className="dock-control__label">
          Base <span className="dock-control__hint">i</span>
        </span>
        <label className="tone-track tone-track--base">
          <span
            className="tone-track__thumb"
            style={{
              left: `${basePosition}%`,
              backgroundColor: baseThumb
            }}
          />
          <input
            aria-label="Base tone"
            className="tone-track__input"
            type="range"
            min="0"
            max="0.012"
            step="0.0001"
            value={baseTone}
            onChange={(event) => onBaseToneChange(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="dock-control dock-control--wide">
        <span className="dock-control__label">Font Family</span>
        <label className="dock-select">
          <span className="dock-select__prefix">Aa</span>
          <select value={activeDockFont} onChange={(event) => onFontFamilyChange(event.target.value)}>
            {fontOptions.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="dock-control">
        <span className="dock-control__label">Radius</span>
        <label className="dock-select">
          <span className="dock-select__prefix">{radiusAbbrev[spec.shape.radius]}</span>
          <select value={spec.shape.radius} onChange={(event) => onShapeChange("radius", event.target.value as RadiusPreset)}>
            {radiusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="dock-control">
        <span className="dock-control__label">Radius Form</span>
        <label className="dock-select">
          <span className="dock-select__prefix">{radiusAbbrev[spec.shape.formRadius]}</span>
          <select value={spec.shape.formRadius} onChange={(event) => onShapeChange("formRadius", event.target.value as RadiusPreset)}>
            {formRadiusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="dock-control">
        <span className="dock-control__label">Theme</span>
        <label className="dock-select">
          <span className="dock-select__prefix">◌</span>
          <select value={themePreset} onChange={(event) => onThemePresetChange(event.target.value as ThemePreset)}>
            {THEME_PRESET_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
