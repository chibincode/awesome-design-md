import type { DragEvent } from "react";
import { Tldraw, type Editor } from "tldraw";
import "tldraw/tldraw.css";
import type { VisualCanvasAsset, VisualReferenceAnalysis } from "../types/design";

interface VisualRefCanvasProps {
  assets: VisualCanvasAsset[];
  analysis: VisualReferenceAnalysis | null;
  onEditorMount: (editor: Editor) => void;
  onFilesAdded: (files: File[]) => void;
}

function filesFromDrop(event: DragEvent<HTMLDivElement>) {
  return Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
}

export function VisualRefCanvas({ assets, analysis, onEditorMount, onFilesAdded }: VisualRefCanvasProps) {
  function handleDrop(event: DragEvent<HTMLDivElement>) {
    const files = filesFromDrop(event);
    if (files.length === 0) return;
    event.preventDefault();
    onFilesAdded(files);
  }

  return (
    <section className="visual-ref-canvas" onDrop={handleDrop} onDragOver={(event) => event.preventDefault()}>
      <div className="visual-ref-canvas__header">
        <div>
          <h2>Visual Ref Canvas</h2>
          <p>Drop or upload images, reference them with @, then convert the visual direction into design.md.</p>
        </div>
        <span>{assets.length} image refs</span>
      </div>

      <div className="visual-ref-canvas__stage">
        <Tldraw hideUi persistenceKey="design-md-visual-ref-canvas" onMount={onEditorMount} />
        {assets.length === 0 ? (
          <div className="visual-ref-canvas__empty">
            <strong>Drop a reference image</strong>
            <span>Use screenshots, mood references, or image-model explorations.</span>
          </div>
        ) : null}
      </div>

      <div className="visual-ref-canvas__footer">
        <div>
          <span>Canvas hand feel</span>
          <strong>Pan, zoom, select, arrange image references.</strong>
        </div>
        {analysis ? (
          <div>
            <span>Latest analysis</span>
            <strong>{analysis.layoutRhythm}</strong>
          </div>
        ) : (
          <div>
            <span>Waiting for analysis</span>
            <strong>Use @Image in the prompt to target a reference.</strong>
          </div>
        )}
      </div>
    </section>
  );
}
