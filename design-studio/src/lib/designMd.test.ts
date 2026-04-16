import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { importDesignMd, serializeDesignMd } from "./designMd";
import { previewThemeVars } from "./previewTheme";

function loadSample(slug: string) {
  const filePath = new URL(`../../../design-md/${slug}/DESIGN.md`, import.meta.url);
  return readFileSync(filePath, "utf8");
}

describe("DESIGN.md import pipeline", () => {
  it("imports the Framer sample into editable tokens", () => {
    const result = importDesignMd(loadSample("framer"), {
      sourceKind: "sample",
      sourceName: "Framer"
    });

    expect(result.spec.meta.title).toContain("Framer");
    expect(result.spec.colors.accent.toLowerCase()).toBe("#0099ff");
    expect(result.spec.theme.themeMode).toBe("dark");
    expect(result.spec.typography.displayFont.length).toBeGreaterThan(0);
  });

  it("preserves imported notes when serializing back to markdown", () => {
    const result = importDesignMd(loadSample("claude"), {
      sourceKind: "sample",
      sourceName: "Claude"
    });
    const markdown = serializeDesignMd(result.spec);

    expect(markdown).toContain("# Design System: Claude (Anthropic)");
    expect(markdown).toContain("### Imported Notes");
    expect(markdown).toContain("Terracotta Brand");
  });

  it("derives preview variables for the canvas", () => {
    const result = importDesignMd(loadSample("claude"));
    const vars = previewThemeVars(result.spec, "dark", "lavender");

    expect(vars["--studio-accent"]).toBe(result.spec.colors.accent);
    expect(vars["--studio-page"]).toBeTruthy();
    expect(vars["--studio-shadow"]).toBeTruthy();
    expect(vars["--studio-board"]).toBeTruthy();
  });

  it("maps small pixel radii into HeroUI-style presets", () => {
    const result = importDesignMd(
      `# Design System: Test

## 1. Visual Theme & Atmosphere

Neutral.

## 4. Component Stylings

- Maintain a consistent radius system using \`2px\` for cards and \`16px\` for form controls.
`
    );

    expect(result.spec.shape.radius).toBe("extra-small");
    expect(result.spec.shape.formRadius).toBe("extra-large");
  });
});
