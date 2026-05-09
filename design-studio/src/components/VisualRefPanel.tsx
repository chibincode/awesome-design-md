import type { VisualCanvasAsset, VisualReferenceAnalysis } from "../types/design";

interface VisualRefPanelProps {
  assets: VisualCanvasAsset[];
  mentionedAssetIds: string[];
  prompt: string;
  analysis: VisualReferenceAnalysis | null;
  status: string;
  onFilesAdded: (files: File[]) => void;
  onPromptChange: (value: string) => void;
  onMentionAsset: (assetId: string) => void;
  onAnalyze: () => void;
  onApplyAnalysis: () => void;
  onBackToStyle: () => void;
  onEnterGenerate: () => void;
}

function assetMention(asset: VisualCanvasAsset) {
  return `@${asset.label.replace(/\s+/g, "")}`;
}

export function VisualRefPanel({
  assets,
  mentionedAssetIds,
  prompt,
  analysis,
  status,
  onFilesAdded,
  onPromptChange,
  onMentionAsset,
  onAnalyze,
  onApplyAnalysis,
  onBackToStyle,
  onEnterGenerate
}: VisualRefPanelProps) {
  return (
    <section className="visual-ref-panel">
      <div className="visual-ref-panel__header">
        <div>
          <p className="eyebrow">Step 2</p>
          <h2>Use image references</h2>
          <p>Upload visual directions, reference them with @, and turn the result into design.md rules.</p>
        </div>
      </div>

      <div className="workflow-strip workflow-strip--three" aria-label="Design flow">
        <button type="button" className="workflow-strip__step is-complete" onClick={onBackToStyle}>
          1 Style
        </button>
        <span className="workflow-strip__step is-active">2 Visual Ref</span>
        <button type="button" className="workflow-strip__step" onClick={onEnterGenerate}>
          3 Generate
        </button>
      </div>

      <label className="visual-upload">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (files.length > 0) onFilesAdded(files);
            event.target.value = "";
          }}
        />
        <span>Upload reference images</span>
      </label>

      <div className="visual-asset-list" aria-label="Canvas image references">
        {assets.length === 0 ? (
          <p>No images yet. Drop one on the canvas or upload here.</p>
        ) : (
          assets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className={mentionedAssetIds.includes(asset.id) ? "is-mentioned" : ""}
              onClick={() => onMentionAsset(asset.id)}
            >
              <img src={asset.url} alt="" />
              <span>{assetMention(asset)}</span>
            </button>
          ))
        )}
      </div>

      <label className="visual-prompt">
        Prompt with @ references
        <textarea
          className="studio-field"
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          placeholder="Example: Use @Image1 to extract the layout rhythm and surface language."
        />
      </label>

      <div className="visual-ref-panel__actions">
        <button type="button" className="button--primary" onClick={onAnalyze}>
          Analyze reference
        </button>
        <button type="button" onClick={onEnterGenerate}>
          Skip to Generate
        </button>
      </div>

      {analysis ? (
        <div className="visual-analysis-card">
          <span>VisualReferenceAnalysis</span>
          <strong>{analysis.summary}</strong>
          <dl>
            <div>
              <dt>Palette</dt>
              <dd>{analysis.palette.map((color) => color.role).join(", ")}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{analysis.typography}</dd>
            </div>
            <div>
              <dt>Surfaces</dt>
              <dd>{analysis.surfaces}</dd>
            </div>
            <div>
              <dt>Components</dt>
              <dd>{analysis.componentLanguage}</dd>
            </div>
          </dl>
          <button type="button" className="button--primary" onClick={onApplyAnalysis}>
            Apply to design.md
          </button>
        </div>
      ) : null}

      <span className="sr-only" aria-live="polite">
        {status}
      </span>
    </section>
  );
}
