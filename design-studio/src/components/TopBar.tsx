import type { PreviewMode, ViewMode } from "../types/design";

interface TopBarProps {
  currentName: string;
  dirty: boolean;
  previewMode: PreviewMode;
  viewMode: ViewMode;
  warningCount: number;
  onOpenAdvanced: () => void;
  onOpenFile: () => void;
  onImportSample: () => void;
  onSave: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onPreviewModeChange: (mode: PreviewMode) => void;
}

export function TopBar({
  currentName,
  dirty,
  previewMode,
  viewMode,
  warningCount,
  onOpenAdvanced,
  onOpenFile,
  onImportSample,
  onSave,
  onViewModeChange,
  onPreviewModeChange
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar__cluster">
        <div>
          <p className="eyebrow">DESIGN.md Studio</p>
          <h1>{currentName}</h1>
        </div>
        <div className="status-pills">
          <span className={`pill ${dirty ? "pill--dirty" : ""}`}>{dirty ? "Unsaved changes" : "Saved state"}</span>
          <span className="pill">{warningCount} warnings</span>
        </div>
      </div>

      <div className="topbar__controls">
        <div className="button-row">
          <button type="button" onClick={onOpenFile}>
            Open file
          </button>
          <button type="button" onClick={onImportSample}>
            Import sample
          </button>
          <button type="button" onClick={onOpenAdvanced}>
            Advanced
          </button>
          <button type="button" className="button--primary" onClick={onSave}>
            Save DESIGN.md
          </button>
        </div>

        <div className="button-row">
          <div className="segmented">
            {(["canvas", "split", "design"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={viewMode === mode ? "is-active" : ""}
                onClick={() => onViewModeChange(mode)}
              >
                {mode === "canvas" ? "Canvas" : mode === "split" ? "Split" : "DESIGN.md"}
              </button>
            ))}
          </div>

          <div className="segmented">
            {(["light", "dark"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={previewMode === mode ? "is-active" : ""}
                onClick={() => onPreviewModeChange(mode)}
              >
                {mode === "light" ? "Light preview" : "Dark preview"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
