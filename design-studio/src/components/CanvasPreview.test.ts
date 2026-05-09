import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createDefaultSpec } from "../lib/designMd";
import { CanvasPreview } from "./CanvasPreview";

describe("CanvasPreview", () => {
  it("starts the generation canvas empty until the user generates a draft", () => {
    const spec = createDefaultSpec("Test");
    const markup = renderToStaticMarkup(
      createElement(CanvasPreview, {
        spec,
        generatedDrafts: [],
        flowStep: "generate",
        activeScene: "generated",
        previewMode: "light",
        themePreset: "default",
        baseTone: 0,
        onSceneChange: () => undefined,
        onBackToStyle: () => undefined
      })
    );

    expect(markup).toContain("No generated drafts yet");
    expect(markup).not.toContain("Draft 1");
  });

  it("renders polished style benchmark scenes instead of placeholder UI", () => {
    const spec = createDefaultSpec("Test");
    const markup = renderToStaticMarkup(
      createElement(CanvasPreview, {
        spec,
        generatedDrafts: [],
        flowStep: "style",
        activeScene: "landing",
        previewMode: "light",
        themePreset: "default",
        baseTone: 0,
        onSceneChange: () => undefined,
        onBackToStyle: () => undefined
      })
    );

    expect(markup).toContain("From design.md to polished UI in minutes.");
    expect(markup).toContain("Trusted by design-led product teams");
    expect(markup).toContain("What teams say about Atlas");
    expect(markup).toContain("Frequently asked questions");
    expect(markup).not.toContain("One style system. Every screen in sync.");
  });
});
