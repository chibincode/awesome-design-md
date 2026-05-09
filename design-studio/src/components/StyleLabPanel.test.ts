import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createDefaultSpec } from "../lib/designMd";
import { StyleLabPanel } from "./StyleLabPanel";

describe("StyleLabPanel", () => {
  it("uses a normal file input for local DESIGN.md import", () => {
    const markup = renderToStaticMarkup(
      createElement(StyleLabPanel, {
        spec: createDefaultSpec("Test"),
        status: "Ready",
        onImportFile: () => undefined,
        onEnterGenerate: () => undefined
      })
    );

    expect(markup).toContain('type="file"');
    expect(markup).toContain("Import local DESIGN.md");
    expect(markup).toContain("Ready");
  });
});
