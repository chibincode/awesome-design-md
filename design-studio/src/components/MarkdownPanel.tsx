import type { DesignSpec } from "../types/design";

interface MarkdownPanelProps {
  spec: DesignSpec;
  markdown: string;
  warnings: string[];
  dirty: boolean;
  onSave: () => void;
}

export function MarkdownPanel({ spec, markdown, warnings, dirty, onSave }: MarkdownPanelProps) {
  return (
    <details className="design-panel export-panel">
      <summary className="design-panel__header">
        <div>
          <p className="eyebrow">Optional</p>
          <h2>Export DESIGN.md</h2>
        </div>
        <span className="pill">Expand</span>
      </summary>

      <div className="summary-grid">
        <div className="summary-card">
          <span>Title</span>
          <strong>{spec.meta.title}</strong>
        </div>
        <div className="summary-card">
          <span>Fonts</span>
          <strong>{spec.typography.displayFont}</strong>
        </div>
        <div className="summary-card">
          <span>Radius</span>
          <strong>{spec.shape.radius}</strong>
        </div>
        <div className="summary-card">
          <span>Elevation</span>
          <strong>{spec.elevation.preset}</strong>
        </div>
      </div>

      <div className="export-panel__actions">
        <button type="button" className="button--primary" onClick={onSave}>
          {dirty ? "Save DESIGN.md" : "Save again"}
        </button>
      </div>

      {warnings.length > 0 ? (
        <div className="warning-panel">
          <strong>Import warnings</strong>
          <ul>
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="markdown-card">
        <pre>{markdown}</pre>
      </div>
    </details>
  );
}
