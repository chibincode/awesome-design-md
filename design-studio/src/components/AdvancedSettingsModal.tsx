import { FONT_BUNDLES, FONT_OPTIONS } from "../lib/presets";
import type {
  DensityPreset,
  DesignSpec,
  ElevationPreset,
  RadiusPreset,
  ScalePreset,
  ThemeMode
} from "../types/design";

type FontField = "displayFont" | "bodyFont" | "monoFont" | "scalePreset";

interface AdvancedSettingsModalProps {
  open: boolean;
  spec: DesignSpec;
  onClose: () => void;
  onColorChange: (key: keyof DesignSpec["colors"], value: string) => void;
  onFontChange: (key: FontField, value: string) => void;
  onApplyFontBundle: (bundleId: string) => void;
  onDensityChange: (value: DensityPreset) => void;
  onElevationChange: (value: ElevationPreset) => void;
  onThemeModeChange: (value: ThemeMode) => void;
  onShapeChange: (key: keyof DesignSpec["shape"], value: RadiusPreset) => void;
}

const scaleOptions: ScalePreset[] = ["editorial", "balanced", "product"];
const densityOptions: DensityPreset[] = ["compact", "comfortable", "spacious"];
const elevationOptions: ElevationPreset[] = ["flat", "soft", "ring", "dramatic"];
const radiusOptions: RadiusPreset[] = ["none", "extra-small", "small", "medium", "large"];
const formRadiusOptions: RadiusPreset[] = ["none", "extra-small", "small", "medium", "large", "extra-large"];
const themeModeOptions: ThemeMode[] = ["light", "dark", "hybrid"];

export function AdvancedSettingsModal({
  open,
  spec,
  onClose,
  onColorChange,
  onFontChange,
  onApplyFontBundle,
  onDensityChange,
  onElevationChange,
  onThemeModeChange,
  onShapeChange
}: AdvancedSettingsModalProps) {
  if (!open) return null;

  return (
    <div className="overlay" role="presentation">
      <div className="modal modal--advanced" role="dialog" aria-modal="true" aria-labelledby="advanced-controls-title">
        <div className="modal__header">
          <div>
            <p className="eyebrow">Detailed Tokens</p>
            <h2 id="advanced-controls-title">Advanced controls</h2>
          </div>
          <div className="button-row">
            <button type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div className="advanced-grid">
          <section className="advanced-card">
            <p className="eyebrow">Color System</p>
            <div className="advanced-stack">
              <label className="swatch-input">
                <input type="color" value={spec.colors.surface} onChange={(event) => onColorChange("surface", event.target.value)} />
                <span>Surface {spec.colors.surface}</span>
              </label>
              <label className="swatch-input">
                <input
                  type="color"
                  value={spec.colors.textPrimary}
                  onChange={(event) => onColorChange("textPrimary", event.target.value)}
                />
                <span>Text primary</span>
              </label>
              <label className="swatch-input">
                <input
                  type="color"
                  value={spec.colors.textSecondary}
                  onChange={(event) => onColorChange("textSecondary", event.target.value)}
                />
                <span>Text secondary</span>
              </label>
              <label className="swatch-input">
                <input type="color" value={spec.colors.border} onChange={(event) => onColorChange("border", event.target.value)} />
                <span>Border</span>
              </label>
            </div>
          </section>

          <section className="advanced-card advanced-card--wide">
            <p className="eyebrow">Typography</p>
            <div className="bundle-row">
              {FONT_BUNDLES.map((bundle) => (
                <button key={bundle.id} type="button" onClick={() => onApplyFontBundle(bundle.id)}>
                  {bundle.label}
                </button>
              ))}
            </div>
            <div className="select-stack">
              <select value={spec.typography.displayFont} onChange={(event) => onFontChange("displayFont", event.target.value)}>
                {FONT_OPTIONS.map((option) => (
                  <option key={`display-${option.value}`} value={option.value}>
                    Display: {option.label}
                  </option>
                ))}
              </select>
              <select value={spec.typography.bodyFont} onChange={(event) => onFontChange("bodyFont", event.target.value)}>
                {FONT_OPTIONS.map((option) => (
                  <option key={`body-${option.value}`} value={option.value}>
                    Body: {option.label}
                  </option>
                ))}
              </select>
              <select value={spec.typography.monoFont} onChange={(event) => onFontChange("monoFont", event.target.value)}>
                {FONT_OPTIONS.map((option) => (
                  <option key={`mono-${option.value}`} value={option.value}>
                    Mono: {option.label}
                  </option>
                ))}
              </select>
              <select value={spec.typography.scalePreset} onChange={(event) => onFontChange("scalePreset", event.target.value)}>
                {scaleOptions.map((option) => (
                  <option key={option} value={option}>
                    Scale: {option}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="advanced-card">
            <p className="eyebrow">System</p>
            <div className="select-stack">
              <select value={spec.layout.density} onChange={(event) => onDensityChange(event.target.value as DensityPreset)}>
                {densityOptions.map((option) => (
                  <option key={option} value={option}>
                    Density: {option}
                  </option>
                ))}
              </select>
              <select value={spec.elevation.preset} onChange={(event) => onElevationChange(event.target.value as ElevationPreset)}>
                {elevationOptions.map((option) => (
                  <option key={option} value={option}>
                    Elevation: {option}
                  </option>
                ))}
              </select>
              <select value={spec.theme.themeMode} onChange={(event) => onThemeModeChange(event.target.value as ThemeMode)}>
                {themeModeOptions.map((option) => (
                  <option key={option} value={option}>
                    Theme mode: {option}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="advanced-card">
            <p className="eyebrow">Shape</p>
            <div className="select-stack">
              <select value={spec.shape.radius} onChange={(event) => onShapeChange("radius", event.target.value as RadiusPreset)}>
                {radiusOptions.map((option) => (
                  <option key={option} value={option}>
                    Radius: {option}
                  </option>
                ))}
              </select>
              <select
                value={spec.shape.formRadius}
                onChange={(event) => onShapeChange("formRadius", event.target.value as RadiusPreset)}
              >
                {formRadiusOptions.map((option) => (
                  <option key={option} value={option}>
                    Form radius: {option}
                  </option>
                ))}
              </select>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
