import type { DesignBrief, GeneratedScreen } from "../types/design";

interface AIBriefPanelProps {
  brief: DesignBrief;
  generatedScreen: GeneratedScreen;
  status: string;
  codexDraftJson: string;
  onBriefChange: (brief: DesignBrief) => void;
  onGenerate: () => void;
  onCodexDraftJsonChange: (value: string) => void;
  onImportCodexDraft: () => void;
  onBackToStyle: () => void;
}

const PAGE_TYPE_OPTIONS: Array<{ value: DesignBrief["pageType"]; label: string }> = [
  { value: "landing", label: "Landing" },
  { value: "dashboard", label: "Dashboard" },
  { value: "tool", label: "Tool / App" }
];

export function AIBriefPanel({
  brief,
  generatedScreen,
  status,
  codexDraftJson,
  onBriefChange,
  onGenerate,
  onCodexDraftJsonChange,
  onImportCodexDraft,
  onBackToStyle
}: AIBriefPanelProps) {
  function updateField<Key extends keyof DesignBrief>(key: Key, value: DesignBrief[Key]) {
    onBriefChange({ ...brief, [key]: value });
  }

  return (
    <section className="ai-brief-panel">
      <div className="ai-brief-panel__header">
        <div>
          <p className="eyebrow">Step 2</p>
          <h2>Describe the draft you need</h2>
        </div>
        <span className="pill">{generatedScreen.pageType}</span>
      </div>

      <div className="workflow-strip workflow-strip--two" aria-label="Design flow">
        <button type="button" className="workflow-strip__step is-complete" onClick={onBackToStyle}>
          1 Style Lab
        </button>
        <span className="workflow-strip__step is-active">2 Generate</span>
      </div>

      <div className="ai-brief-grid">
        <label>
          What are you making?
          <select
            className="studio-field"
            value={brief.pageType}
            onChange={(event) => updateField("pageType", event.target.value as DesignBrief["pageType"])}
          >
            {PAGE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Who is it for?
          <input
            className="studio-field"
            value={brief.audience}
            onChange={(event) => updateField("audience", event.target.value)}
            placeholder="e.g. indie founders, design teams, operators"
          />
        </label>

        <label>
          What should this page help them do?
          <textarea
            className="studio-field ai-brief-panel__textarea"
            value={brief.goal}
            onChange={(event) => updateField("goal", event.target.value)}
            placeholder="e.g. understand the product and book a demo"
          />
        </label>

        <label>
          What must be included?
          <textarea
            className="studio-field ai-brief-panel__textarea"
            value={brief.keyContent}
            onChange={(event) => updateField("keyContent", event.target.value)}
            placeholder="e.g. headline, value props, proof, pricing, CTA"
          />
        </label>

        <label>
          Extra style notes
          <input
            className="studio-field"
            value={brief.referenceStyle}
            onChange={(event) => updateField("referenceStyle", event.target.value)}
            placeholder="Optional: calmer, more premium, denser..."
          />
        </label>
      </div>

      <div className="ai-brief-panel__actions">
        <button type="button" onClick={onGenerate}>
          Generate local draft
        </button>
        <span>{status}</span>
      </div>

      <details className="ai-codex-bridge" open>
        <summary>
          <span>Codex AI test bridge</span>
          <strong>JSON</strong>
        </summary>
        <textarea
          className="studio-field ai-codex-bridge__textarea"
          value={codexDraftJson}
          onChange={(event) => onCodexDraftJsonChange(event.target.value)}
          spellCheck={false}
        />
        <div className="ai-brief-panel__actions">
          <button type="button" className="button--primary" onClick={onImportCodexDraft}>
            Import AI draft
          </button>
        </div>
      </details>

      <div className="ai-brief-summary">
        <span>Generation intent</span>
        <strong>{generatedScreen.layoutIntent}</strong>
      </div>
    </section>
  );
}
