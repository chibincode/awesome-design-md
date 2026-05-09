export type ThemeMode = "light" | "dark" | "hybrid";
export type DensityPreset = "compact" | "comfortable" | "spacious";
export type ElevationPreset = "flat" | "soft" | "ring" | "dramatic";
export type ScalePreset = "editorial" | "balanced" | "product";
export type RadiusPreset =
  | "none"
  | "extra-small"
  | "small"
  | "medium"
  | "large"
  | "extra-large";
export type ViewMode = "canvas" | "split" | "design";
export type PreviewMode = "light" | "dark";
export type PreviewSceneId = "generated" | "components" | "dashboard" | "landing";
export type DesignFlowStep = "style" | "generate";
export type SourceKind = "sample" | "file" | "manual";
export type BriefPageType = "landing" | "dashboard" | "tool";
export type ThemePreset =
  | "default"
  | "sky"
  | "lavender"
  | "mint"
  | "netflix"
  | "uber"
  | "spotify"
  | "coinbase"
  | "airbnb"
  | "discord"
  | "rabbit";

export type SectionId =
  | "theme"
  | "colors"
  | "typography"
  | "components"
  | "layout"
  | "elevation"
  | "shapes"
  | "responsive"
  | "dosDonts"
  | "agentPrompts";

export interface PaletteReference {
  name: string;
  value: string;
  role: string;
  description: string;
}

export interface DesignSpec {
  meta: {
    title: string;
    description: string;
    sourceName: string;
    sourcePath?: string;
  };
  theme: {
    visualTheme: string;
    atmosphere: string;
    themeMode: ThemeMode;
  };
  colors: {
    accent: string;
    base: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    palette: PaletteReference[];
  };
  typography: {
    displayFont: string;
    bodyFont: string;
    monoFont: string;
    scalePreset: ScalePreset;
    fontNotes: string[];
  };
  shape: {
    radius: RadiusPreset;
    formRadius: RadiusPreset;
  };
  elevation: {
    preset: ElevationPreset;
    notes: string[];
  };
  layout: {
    density: DensityPreset;
    notes: string[];
  };
  components: {
    notes: string[];
  };
  responsive: {
    notes: string[];
  };
  notes: {
    sourceKind: SourceKind;
    importedSections: Partial<Record<SectionId, string>>;
    warnings: string[];
    misc: string[];
  };
}

export interface ImportResult {
  spec: DesignSpec;
  warnings: string[];
}

export interface FontOption {
  label: string;
  value: string;
  css: string;
}

export interface FontBundle {
  id: string;
  label: string;
  displayFont: string;
  bodyFont: string;
  monoFont: string;
}

export interface DesignBrief {
  pageType: BriefPageType;
  audience: string;
  goal: string;
  keyContent: string;
  referenceStyle: string;
}

export interface GeneratedComponent {
  label: string;
  body: string;
  kind: "primary" | "secondary" | "metric" | "action" | "note";
}

export interface GeneratedSection {
  id: string;
  title: string;
  kicker: string;
  body: string;
  components: GeneratedComponent[];
}

export interface GeneratedScreen {
  title: string;
  subtitle: string;
  pageType: BriefPageType;
  audience: string;
  layoutIntent: string;
  primaryAction: string;
  secondaryAction: string;
  sections: GeneratedSection[];
}

export interface GeneratedDraft {
  id: string;
  label: string;
  screen: GeneratedScreen;
  spec: DesignSpec;
  baseTone: number;
}

export interface VisualCanvasAsset {
  id: string;
  type: "image";
  name: string;
  url: string;
  mimeType: string;
  label: string;
}

export interface VisualReferenceMention {
  id: string;
  assetId: string;
  label: string;
}

export interface VisualReferenceAnalysis {
  id: string;
  sourceAssetIds: string[];
  summary: string;
  palette: Array<{
    role: string;
    value: string;
    note: string;
  }>;
  typography: string;
  surfaces: string;
  layoutRhythm: string;
  componentLanguage: string;
  designMdPatch: {
    visualTheme: string;
    atmosphere: string;
    density: DensityPreset;
    elevation: ElevationPreset;
    radius: RadiusPreset;
    notes: string[];
  };
}
