import type { DesignSpec, VisualCanvasAsset, VisualReferenceAnalysis } from "../types/design";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function clampMentionedAssets(assets: VisualCanvasAsset[], mentionedAssetIds: string[]) {
  const mentioned = assets.filter((asset) => mentionedAssetIds.includes(asset.id));
  return mentioned.length > 0 ? mentioned : assets.slice(0, 1);
}

export function createVisualReferenceAnalysis(
  prompt: string,
  assets: VisualCanvasAsset[],
  spec: DesignSpec,
  mentionedAssetIds: string[]
): VisualReferenceAnalysis {
  const sources = clampMentionedAssets(assets, mentionedAssetIds);
  const sourceNames = sources.map((asset) => asset.label).join(", ") || "the reference image";
  const cleanedPrompt = prompt.trim();

  return {
    id: createId("analysis"),
    sourceAssetIds: sources.map((asset) => asset.id),
    summary: `Extract a calm product-interface direction from ${sourceNames}.`,
    palette: [
      {
        role: "Accent",
        value: spec.colors.accent,
        note: "Keep the current accent as the action and focus color."
      },
      {
        role: "Base",
        value: spec.colors.base,
        note: "Lean into quiet neutral surfaces so uploaded imagery guides structure, not noise."
      },
      {
        role: "Surface",
        value: spec.colors.surface,
        note: "Use layered panels with visible separation and low contrast borders."
      }
    ],
    typography: "Use a strong display headline with compact product UI labels.",
    surfaces: "Prefer soft panels, thin borders, and subtle elevation instead of heavy decorative cards.",
    layoutRhythm: "Hero first, proof band second, then grouped product sections with generous breathing room.",
    componentLanguage: "Use token chips, compact metrics, image-aware reference cards, and clear primary actions.",
    designMdPatch: {
      visualTheme: cleanedPrompt
        ? `Image-referenced product UI direction: ${cleanedPrompt}`
        : "Image-referenced product UI direction with calm hierarchy and reusable surfaces.",
      atmosphere: "Reference-led, structured, calm, and production-ready.",
      density: "comfortable",
      elevation: "soft",
      radius: "medium",
      notes: [
        "Use uploaded images as visual references, not final design output.",
        "Convert reference mood into reusable design.md tokens and section rules.",
        "Keep UI reconstruction editable and constrained by the current design system."
      ]
    }
  };
}

export function applyVisualReferenceAnalysis(spec: DesignSpec, analysis: VisualReferenceAnalysis): DesignSpec {
  const nextNotes = analysis.designMdPatch.notes.filter((note) => !spec.components.notes.includes(note));

  return {
    ...spec,
    theme: {
      ...spec.theme,
      visualTheme: analysis.designMdPatch.visualTheme,
      atmosphere: analysis.designMdPatch.atmosphere
    },
    layout: {
      ...spec.layout,
      density: analysis.designMdPatch.density,
      notes: [...nextNotes, ...spec.layout.notes]
    },
    elevation: {
      ...spec.elevation,
      preset: analysis.designMdPatch.elevation
    },
    shape: {
      ...spec.shape,
      radius: analysis.designMdPatch.radius
    },
    components: {
      ...spec.components,
      notes: [...nextNotes, ...spec.components.notes]
    }
  };
}
