import type { ChangeEvent } from "react";
import type { DesignSpec } from "../types/design";

interface StyleLabPanelProps {
  spec: DesignSpec;
  status: string;
  onImportFile: (file: File) => void;
  onEnterGenerate: () => void;
}

export function StyleLabPanel({
  spec,
  status,
  onImportFile,
  onEnterGenerate
}: StyleLabPanelProps) {
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (file) {
      onImportFile(file);
    }
    event.currentTarget.value = "";
  }

  return (
    <section className="style-lab-panel">
      <div className="style-lab-panel__header">
        <div>
          <h2>Start from your design.md standard</h2>
          <p>Import your standard or tune the starter tokens, then generate a draft.</p>
        </div>
      </div>

      <div className="style-lab-step style-lab-step--open">
        <div className="style-lab-step__title">
          <span className="step-badge">1</span>
          <strong>Load standard</strong>
        </div>
        <div className="selected-style">
          <span>Current standard</span>
          <strong>{spec.meta.title}</strong>
        </div>
        <label className="style-lab-panel__secondary style-lab-panel__file-import">
          Import local DESIGN.md
          <input type="file" accept=".md,text/markdown,text/plain" onChange={handleInputChange} />
        </label>
        <p className="style-lab-status">{status}</p>
      </div>

      <div className="style-lab-step">
        <div className="style-lab-step__title">
          <span className="step-badge">2</span>
          <strong>Tune tokens</strong>
        </div>
        <p>Use the Style Controls below to adjust accent, base tone, font, heading scale, radius, density, and elevation.</p>
      </div>

      <div className="style-lab-step">
        <div className="style-lab-step__title">
          <span className="step-badge">3</span>
          <strong>Generate draft</strong>
        </div>
        <p>Move to the brief only when the style already feels close enough.</p>
      </div>

      <button type="button" className="style-lab-panel__primary" onClick={onEnterGenerate}>
        Generate with this style
      </button>

      <span className="sr-only" aria-live="polite">{status}</span>
    </section>
  );
}
