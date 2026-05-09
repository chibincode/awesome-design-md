import { useState } from "react";
import { AIBriefPanel } from "./components/AIBriefPanel";
import { CanvasPreview } from "./components/CanvasPreview";
import { MarkdownPanel } from "./components/MarkdownPanel";
import { StyleLabPanel } from "./components/StyleLabPanel";
import { TokenDock } from "./components/TokenDock";
import { TopBar } from "./components/TopBar";
import { saveDesignFile, supportsFileSystemAccess, type FileSession } from "./lib/fileSystem";
import { THEME_PRESET_BASES } from "./lib/presets";
import { createDefaultSpec, importDesignMd, serializeDesignMd } from "./lib/designMd";
import { CODEX_TEST_DRAFT_JSON, parseCodexDraftJson } from "./lib/codexDraft";
import { DEFAULT_BRIEF, generateScreen } from "./lib/localGenerator";
import type {
  DensityPreset,
  DesignBrief,
  DesignFlowStep,
  DesignSpec,
  ElevationPreset,
  GeneratedDraft,
  GeneratedScreen,
  PreviewMode,
  PreviewSceneId,
  RadiusPreset,
  ScalePreset,
  ThemePreset
} from "./types/design";

export default function App() {
  const [spec, setSpec] = useState<DesignSpec>(() => createDefaultSpec("Design.md Standard"));
  const [brief, setBrief] = useState<DesignBrief>(DEFAULT_BRIEF);
  const [generatedScreen, setGeneratedScreen] = useState<GeneratedScreen>(() =>
    generateScreen(DEFAULT_BRIEF, createDefaultSpec("Design.md Standard"))
  );
  const [generatedDrafts, setGeneratedDrafts] = useState<GeneratedDraft[]>([]);
  const [hasGeneratedDrafts, setHasGeneratedDrafts] = useState(false);
  const [codexDraftJson, setCodexDraftJson] = useState(CODEX_TEST_DRAFT_JSON);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [flowStep, setFlowStep] = useState<DesignFlowStep>("style");
  const [styleScene, setStyleScene] = useState<PreviewSceneId>("landing");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("light");
  const themePreset: ThemePreset = "default";
  const [baseTone, setBaseTone] = useState<number>(THEME_PRESET_BASES.default);
  const [session, setSession] = useState<FileSession>({ handle: null, name: "DESIGN.md" });
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState("Ready");

  const markdown = serializeDesignMd(spec);
  const activeScene: PreviewSceneId = flowStep === "style" ? styleScene : "generated";

  function createDraft(screen: GeneratedScreen, draftIndex: number): GeneratedDraft {
    return {
      id: `draft-${Date.now()}-${draftIndex}`,
      label: `Draft ${draftIndex + 1}`,
      screen,
      spec,
      baseTone
    };
  }

  function applyImportedDesign(content: string, nextSession: FileSession) {
    const imported = importDesignMd(content, {
      sourceKind: "file",
      sourceName: nextSession.name,
      sourcePath: nextSession.pathHint
    });
    setSpec(imported.spec);
    setPreviewMode(imported.spec.theme.themeMode === "dark" ? "dark" : "light");
    setGeneratedScreen(generateScreen(brief, imported.spec));
    setWarnings(imported.warnings);
    setSession(nextSession);
    setDirty(false);
    setStatus(`Imported ${nextSession.name}`);
  }

  async function handleImportFile(file: File) {
    try {
      const content = await file.text();
      applyImportedDesign(content, { handle: null, name: file.name, pathHint: file.name });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not import this DESIGN.md.");
    }
  }

  async function handleSave() {
    try {
      const next = await saveDesignFile(session, markdown, session.name || "DESIGN.md");
      setSession(next);
      setDirty(false);
      setStatus(`Saved ${next.name}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save DESIGN.md.");
    }
  }

  function updateSpec(next: DesignSpec) {
    setSpec(next);
    setGeneratedScreen(generateScreen(brief, next));
    setDirty(true);
  }

  function handleBriefChange(next: DesignBrief) {
    setBrief(next);
    setGeneratedScreen(generateScreen(next, spec));
  }

  function handleEnterGenerate() {
    const nextScreen = generateScreen(brief, spec);
    setGeneratedScreen(nextScreen);
    if (flowStep !== "generate") {
      setGeneratedDrafts([]);
      setHasGeneratedDrafts(false);
    }
    setFlowStep("generate");
    setStatus("Ready. Generate a draft when the brief feels right.");
  }

  function handleBackToStyle() {
    setFlowStep("style");
    setStatus(`Tuning ${spec.meta.title}`);
  }

  function handleGenerateScreen() {
    const nextScreen = generateScreen(brief, spec);
    setGeneratedScreen(nextScreen);
    setHasGeneratedDrafts(true);
    setGeneratedDrafts((current) => {
      const baseDrafts = hasGeneratedDrafts ? current : [];
      return [...baseDrafts, createDraft(nextScreen, baseDrafts.length)];
    });
    setFlowStep("generate");
    setStatus(`Added draft ${(hasGeneratedDrafts ? generatedDrafts.length : 0) + 1} to the canvas`);
  }

  function handleImportCodexDraft() {
    try {
      const nextScreen = parseCodexDraftJson(codexDraftJson);
      setGeneratedScreen(nextScreen);
      setHasGeneratedDrafts(true);
      setGeneratedDrafts((current) => {
        const baseDrafts = hasGeneratedDrafts ? current : [];
        return [...baseDrafts, createDraft(nextScreen, baseDrafts.length)];
      });
      setFlowStep("generate");
      setStatus(`Imported AI draft ${(hasGeneratedDrafts ? generatedDrafts.length : 0) + 1} to the canvas`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not import this AI draft JSON.");
    }
  }

  return (
    <div className="app-shell">
      {!supportsFileSystemAccess() ? (
        <div className="runtime-banner">
          Import works in this browser. Direct overwrite save needs Chromium file access.
        </div>
      ) : null}

      <TopBar
        flowStep={flowStep}
        previewMode={previewMode}
        onFlowStepChange={(step) => {
          if (step === "generate") {
            handleEnterGenerate();
            return;
          }
          handleBackToStyle();
        }}
        onPreviewModeChange={setPreviewMode}
      />

      <div className="workspace workspace--split">
        <CanvasPreview
          spec={spec}
          generatedDrafts={hasGeneratedDrafts ? generatedDrafts : []}
          flowStep={flowStep}
          activeScene={activeScene}
          previewMode={previewMode}
          themePreset={themePreset}
          baseTone={baseTone}
          onSceneChange={setStyleScene}
          onBackToStyle={handleBackToStyle}
        />
        <div className="side-rail">
          {flowStep === "style" ? (
            <StyleLabPanel
              spec={spec}
              status={status}
              onImportFile={(file) => {
                void handleImportFile(file);
              }}
              onEnterGenerate={handleEnterGenerate}
            />
          ) : (
            <AIBriefPanel
              brief={brief}
              generatedScreen={generatedScreen}
              status={status}
              codexDraftJson={codexDraftJson}
              onBriefChange={handleBriefChange}
              onGenerate={handleGenerateScreen}
              onCodexDraftJsonChange={setCodexDraftJson}
              onImportCodexDraft={handleImportCodexDraft}
              onBackToStyle={handleBackToStyle}
            />
          )}
          <MarkdownPanel spec={spec} markdown={markdown} warnings={warnings} dirty={dirty} onSave={handleSave} />
        </div>
      </div>

      {flowStep === "style" ? (
        <footer className="dock-shell">
          <span className="sr-only" aria-live="polite">
            {status}
          </span>
          <TokenDock
            spec={spec}
            onColorChange={(key, value) =>
              updateSpec({
                ...spec,
                colors: {
                  ...spec.colors,
                  [key]: value
                }
              })
            }
            baseTone={baseTone}
            onBaseToneChange={setBaseTone}
            onFontFamilyChange={(value) => {
              updateSpec({
                ...spec,
                typography: {
                  ...spec.typography,
                  displayFont: value,
                  bodyFont: value
                }
              });
            }}
            onScaleChange={(value: ScalePreset) =>
              updateSpec({
                ...spec,
                typography: {
                  ...spec.typography,
                  scalePreset: value
                }
              })
            }
            onShapeChange={(key, value) =>
              updateSpec({
                ...spec,
                shape: {
                  ...spec.shape,
                  [key]: value as RadiusPreset
                }
              })
            }
            onDensityChange={(value: DensityPreset) =>
              updateSpec({
                ...spec,
                layout: {
                  ...spec.layout,
                  density: value
                }
              })
            }
            onElevationChange={(value: ElevationPreset) =>
              updateSpec({
                ...spec,
                elevation: {
                  ...spec.elevation,
                  preset: value
                }
              })
            }
          />
        </footer>
      ) : null}

    </div>
  );
}
