import { describe, expect, it } from "vitest";
import { createDefaultSpec } from "./designMd";
import { applyVisualReferenceAnalysis, createVisualReferenceAnalysis } from "./visualReference";
import type { VisualCanvasAsset } from "../types/design";

const assets: VisualCanvasAsset[] = [
  {
    id: "asset-a",
    type: "image",
    name: "hero.png",
    url: "blob:hero",
    mimeType: "image/png",
    label: "Image 1"
  },
  {
    id: "asset-b",
    type: "image",
    name: "dashboard.png",
    url: "blob:dashboard",
    mimeType: "image/png",
    label: "Image 2"
  }
];

describe("visual reference analysis", () => {
  it("uses mentioned image references before falling back to the first asset", () => {
    const spec = createDefaultSpec("Visual Test");
    const analysis = createVisualReferenceAnalysis("Use @Image2 for surface language.", assets, spec, ["asset-b"]);

    expect(analysis.sourceAssetIds).toEqual(["asset-b"]);
    expect(analysis.designMdPatch.visualTheme).toContain("@Image2");
    expect(analysis.palette[0].value).toBe(spec.colors.accent);
  });

  it("applies visual direction as design.md style rules", () => {
    const spec = createDefaultSpec("Visual Test");
    const analysis = createVisualReferenceAnalysis("Keep the image mood but preserve tokens.", assets, spec, []);
    const next = applyVisualReferenceAnalysis(spec, analysis);

    expect(next.theme.visualTheme).toContain("Image-referenced product UI direction");
    expect(next.theme.atmosphere).toBe("Reference-led, structured, calm, and production-ready.");
    expect(next.layout.density).toBe("comfortable");
    expect(next.elevation.preset).toBe("soft");
    expect(next.shape.radius).toBe("medium");
    expect(next.components.notes).toContain("Use uploaded images as visual references, not final design output.");
  });
});
