import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createDefaultSpec } from "../lib/designMd";
import { TokenDock } from "./TokenDock";

describe("TokenDock", () => {
  it("keeps Base as a core global token control instead of a competing style preset", () => {
    const markup = renderToStaticMarkup(
      createElement(TokenDock, {
        spec: createDefaultSpec("Test"),
        baseTone: 0.0015,
        onBaseToneChange: () => undefined,
        onColorChange: () => undefined,
        onFontFamilyChange: () => undefined,
        onScaleChange: () => undefined,
        onShapeChange: () => undefined,
        onDensityChange: () => undefined,
        onElevationChange: () => undefined
      })
    );

    expect(markup).toContain("Base tone");
    expect(markup).toContain("Base");
    expect(markup).toContain("Accent");
    expect(markup).toContain("Font");
    expect(markup).toContain("Scale");
    expect(markup).toContain("Editorial");
    expect(markup).toContain("Balanced");
    expect(markup).toContain("Product");
    expect(markup).toContain("Radius");
    expect(markup).toContain("Density");
    expect(markup).toContain("Elevation");
    expect(markup).not.toContain("Global Tweaker");
    expect(markup).not.toContain("Tune, then preview");
    expect(markup).not.toContain(">Theme<");
    expect(markup).not.toContain("Spotify");
  });
});
