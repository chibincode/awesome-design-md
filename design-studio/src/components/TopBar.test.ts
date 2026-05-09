import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TopBar } from "./TopBar";

describe("TopBar", () => {
  it("keeps the primary flow focused on style tuning before generation", () => {
    const markup = renderToStaticMarkup(
      createElement(TopBar, {
        flowStep: "style",
        previewMode: "light",
        onFlowStepChange: () => undefined,
        onPreviewModeChange: () => undefined
      })
    );

    expect(markup).toContain("Style Lab");
    expect(markup).toContain("Generate");
    expect(markup).not.toContain("Visual Ref");
  });
});
