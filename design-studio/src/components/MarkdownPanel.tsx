import type { DesignSpec } from "../types/design";

interface MarkdownPanelProps {
  spec: DesignSpec;
  markdown: string;
  warnings: string[];
}

export function MarkdownPanel({ spec, markdown, warnings }: MarkdownPanelProps) {
  return (
    <aside className="design-panel">
      <div className="design-panel__header">
        <div>
          <p className="eyebrow">Generated output</p>
          <h2>Normalized DESIGN.md</h2>
        </div>
        <span className="pill">{spec.theme.themeMode}</span>
      </div>

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
    </aside>
  );
}
