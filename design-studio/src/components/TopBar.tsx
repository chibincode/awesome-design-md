import type { DesignFlowStep, PreviewMode } from "../types/design";

interface TopBarProps {
  flowStep: DesignFlowStep;
  previewMode: PreviewMode;
  onFlowStepChange: (step: DesignFlowStep) => void;
  onPreviewModeChange: (mode: PreviewMode) => void;
}

export function TopBar({
  flowStep,
  previewMode,
  onFlowStepChange,
  onPreviewModeChange
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <h1>Design.md Flow</h1>
      </div>

      <div className="topbar__controls">
        <div className="flow-toggle" aria-label="Design flow">
          <button
            type="button"
            className={flowStep === "style" ? "is-active" : ""}
            onClick={() => onFlowStepChange("style")}
          >
            <span className="step-number">1</span>
            <span>Style Lab</span>
          </button>
          <button
            type="button"
            className={flowStep === "generate" ? "is-active" : ""}
            onClick={() => onFlowStepChange("generate")}
          >
            <span className="step-number">2</span>
            <span>Generate</span>
          </button>
        </div>
      </div>

      <div className="topbar__preview">
        <div className="preview-toggle" aria-label="Preview mode">
          <span>Preview</span>
          <div className="segmented">
            {(["light", "dark"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={previewMode === mode ? "is-active" : ""}
                onClick={() => onPreviewModeChange(mode)}
              >
                {mode === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
