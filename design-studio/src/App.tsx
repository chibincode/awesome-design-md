import { useEffect, useState } from "react";
import { AdvancedSettingsModal } from "./components/AdvancedSettingsModal";
import { CanvasPreview } from "./components/CanvasPreview";
import { MarkdownPanel } from "./components/MarkdownPanel";
import { SampleBrowser } from "./components/SampleBrowser";
import { TokenDock } from "./components/TokenDock";
import { TopBar } from "./components/TopBar";
import { saveDesignFile, openDesignFile, supportsFileSystemAccess, type FileSession } from "./lib/fileSystem";
import { FONT_BUNDLES, THEME_PRESET_BASES } from "./lib/presets";
import { createDefaultSpec, importDesignMd, serializeDesignMd } from "./lib/designMd";
import { SAMPLE_PACKS } from "./lib/samplePacks";
import type {
  DensityPreset,
  DesignSpec,
  ElevationPreset,
  PreviewMode,
  PreviewSceneId,
  RadiusPreset,
  SampleDesignPack,
  ScalePreset,
  ThemeMode,
  ThemePreset,
  ViewMode
} from "./types/design";

type FontField = "displayFont" | "bodyFont" | "monoFont" | "scalePreset";

export default function App() {
  const [spec, setSpec] = useState<DesignSpec>(() => createDefaultSpec("Design Studio"));
  const [warnings, setWarnings] = useState<string[]>([]);
  const [sampleBrowserOpen, setSampleBrowserOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("light");
  const [scene, setScene] = useState<PreviewSceneId>("components");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [themePreset, setThemePreset] = useState<ThemePreset>("default");
  const [baseTone, setBaseTone] = useState<number>(THEME_PRESET_BASES.default);
  const [session, setSession] = useState<FileSession>({ handle: null, name: "DESIGN.md" });
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    const bootstrap = async () => {
      const starter = SAMPLE_PACKS.find((pack) => pack.slug === "framer") ?? SAMPLE_PACKS[0];
      if (!starter) return;
      await handleSampleImport(starter, false);
    };
    void bootstrap();
  }, []);

  const markdown = serializeDesignMd(spec);

  async function handleSampleImport(pack: SampleDesignPack, markDirty = true) {
    const markdownText = await pack.load();
    const imported = importDesignMd(markdownText, {
      sourceKind: "sample",
      sourceName: pack.name,
      sourcePath: pack.fileName,
      title: pack.name
    });
    setSpec(imported.spec);
    setWarnings(imported.warnings);
    setSession({ handle: null, name: `${pack.slug}.DESIGN.md`, pathHint: pack.fileName });
    setDirty(markDirty);
    setSampleBrowserOpen(false);
    setStatus(`Imported ${pack.name}`);
  }

  async function handleOpenFile() {
    try {
      const result = await openDesignFile();
      if (!result) {
        setStatus("Direct file open is only available in Chromium-based browsers.");
        return;
      }
      const imported = importDesignMd(result.content, {
        sourceKind: "file",
        sourceName: result.session.name,
        sourcePath: result.session.pathHint
      });
      setSpec(imported.spec);
      setWarnings(imported.warnings);
      setSession(result.session);
      setDirty(false);
      setStatus(`Opened ${result.session.name}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not open the selected file.");
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
    setDirty(true);
  }

  return (
    <div className="app-shell">
      {!supportsFileSystemAccess() ? (
        <div className="runtime-banner">
          Open this tool in Chromium if you want direct file open/save. The rest of the studio still works.
        </div>
      ) : null}

      <TopBar
        currentName={session.name || spec.meta.title}
        dirty={dirty}
        previewMode={previewMode}
        viewMode={viewMode}
        warningCount={warnings.length}
        onOpenAdvanced={() => setAdvancedOpen(true)}
        onOpenFile={handleOpenFile}
        onImportSample={() => setSampleBrowserOpen(true)}
        onSave={handleSave}
        onViewModeChange={setViewMode}
        onPreviewModeChange={setPreviewMode}
      />

      <div className={`workspace workspace--${viewMode}`}>
        {viewMode !== "design" ? (
          <CanvasPreview
            spec={spec}
            previewMode={previewMode}
            scene={scene}
            themePreset={themePreset}
            baseTone={baseTone}
            onSceneChange={setScene}
          />
        ) : null}
        {viewMode !== "canvas" ? <MarkdownPanel spec={spec} markdown={markdown} warnings={warnings} /> : null}
      </div>

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
          onShapeChange={(key, value) =>
            updateSpec({
              ...spec,
              shape: {
                ...spec.shape,
                [key]: value as RadiusPreset
              }
            })
          }
          themePreset={themePreset}
          onThemePresetChange={(value) => {
            setThemePreset(value);
            setBaseTone(THEME_PRESET_BASES[value]);
          }}
        />
      </footer>

      <SampleBrowser
        open={sampleBrowserOpen}
        packs={SAMPLE_PACKS}
        onClose={() => setSampleBrowserOpen(false)}
        onSelect={(pack) => {
          void handleSampleImport(pack);
        }}
      />

      <AdvancedSettingsModal
        open={advancedOpen}
        spec={spec}
        onClose={() => setAdvancedOpen(false)}
        onColorChange={(key, value) =>
          updateSpec({
            ...spec,
            colors: {
              ...spec.colors,
              [key]: value
            }
          })
        }
        onFontChange={(key: FontField, value) =>
          updateSpec({
            ...spec,
            typography: {
              ...spec.typography,
              [key]: key === "scalePreset" ? (value as ScalePreset) : value
            }
          })
        }
        onApplyFontBundle={(bundleId) => {
          const bundle = FONT_BUNDLES.find((item) => item.id === bundleId);
          if (!bundle) return;
          updateSpec({
            ...spec,
            typography: {
              ...spec.typography,
              displayFont: bundle.displayFont,
              bodyFont: bundle.bodyFont,
              monoFont: bundle.monoFont
            }
          });
        }}
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
        onThemeModeChange={(value: ThemeMode) =>
          updateSpec({
            ...spec,
            theme: {
              ...spec.theme,
              themeMode: value
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
      />
    </div>
  );
}
