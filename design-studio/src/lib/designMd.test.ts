import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createDefaultSpec, importDesignMd, serializeDesignMd } from "./designMd";
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

    expect(markdown).toMatch(/^---\nname: /m);
    expect(markdown).not.toContain("version: alpha");
    expect(markdown).not.toContain("# Design System:");
    expect(markdown).toContain("## Brand & Style");
    expect(markdown).toContain("## Colors");
    expect(markdown).toContain("## Typography");
    expect(markdown).toContain("## Layout & Spacing");
    expect(markdown).toContain("## Elevation & Depth");
    expect(markdown).toContain("## Shapes");
    expect(markdown).toContain("## Components");
    expect(markdown).not.toContain("### Imported Notes");
    expect(markdown).toContain("Terracotta Brand");
  });

  it("serializes frontmatter typography from the active scale preset", () => {
    const base = createDefaultSpec("Scale");
    const editorial = serializeDesignMd({
      ...base,
      typography: { ...base.typography, scalePreset: "editorial" }
    });
    const product = serializeDesignMd({
      ...base,
      typography: { ...base.typography, scalePreset: "product" }
    });

    expect(editorial).toContain("fontSize: 68px");
    expect(editorial).toContain("fontSize: 44px");
    expect(product).toContain("fontSize: 56px");
    expect(product).toContain("fontSize: 34px");
    expect(editorial).not.toContain("fontSize: 56px");
  });

  it("imports Stitch-style frontmatter tokens", () => {
    const result = importDesignMd(`---
name: Midnight Spectrum
colors:
  surface: '#131313'
  surface-container: '#1f1f1f'
  on-surface: '#e2e2e2'
  on-surface-variant: '#bfc7d5'
  outline: '#89919e'
  primary: '#9fcaff'
  background: '#131313'
typography:
  display:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

Dark technical system.

## Colors

Dark surface with blue primary.

## Typography

Inter-driven hierarchy.

## Layout & Spacing

Strict 8px scale.

## Elevation & Depth

Glass layers and rings.

## Shapes

Rounded corners.

## Components

### Buttons
Primary actions use the primary color.
`);

    expect(result.spec.meta.title).toBe("Midnight Spectrum");
    expect(result.spec.colors.accent.toLowerCase()).toBe("#9fcaff");
    expect(result.spec.colors.base.toLowerCase()).toBe("#131313");
    expect(result.spec.colors.surface.toLowerCase()).toBe("#1f1f1f");
    expect(result.spec.colors.textPrimary.toLowerCase()).toBe("#e2e2e2");
    expect(result.spec.colors.textSecondary.toLowerCase()).toBe("#bfc7d5");
    expect(result.spec.colors.border.toLowerCase()).toBe("#89919e");
    expect(result.spec.typography.displayFont).toBe("Inter");
    expect(result.spec.typography.bodyFont).toBe("Inter");
    expect(result.spec.shape.radius).toBe("medium");
    expect(result.spec.shape.formRadius).toBe("large");
    expect(result.spec.theme.themeMode).toBe("dark");
  });

  it("imports the standard section names used by DESIGN.md", () => {
    const result = importDesignMd(
      `---
version: alpha
name: "Standard"
colors:
  primary: "#ff385c"
---

# Design System: Standard

## Overview

Warm and product-focused.

## Colors

- **Primary** (\`#ff385c\`): brand accent and primary CTA

## Typography

- **Display**: \`Manrope\`
- **Body / UI**: \`IBM Plex Sans\`

## Layout

Spacious marketing layout.

## Elevation & Depth

Soft shadows.

## Shapes

- Cards use \`12px\` and forms use \`16px\`.

## Components

Buttons use the primary accent.

## Do's and Don'ts

Keep it focused.
`
    );

    expect(result.spec.meta.title).toBe("Standard");
    expect(result.spec.colors.accent.toLowerCase()).toBe("#ff385c");
    expect(result.spec.typography.displayFont).toBe("Manrope");
    expect(result.warnings).not.toContain("Missing section: Visual Theme & Atmosphere");
  });

  it("derives preview variables for the canvas", () => {
    const result = importDesignMd(loadSample("claude"));
    const vars = previewThemeVars(result.spec, "dark", "lavender");

    expect(vars["--studio-accent"]).toBe(result.spec.colors.accent);
    expect(vars["--studio-page"]).toBeTruthy();
    expect(vars["--studio-shadow"]).toBeTruthy();
    expect(vars["--studio-board"]).toBeTruthy();
  });

  it("uses base tone as an independent neutral surface adjustment", () => {
    const result = importDesignMd(loadSample("framer"));
    const neutralVars = previewThemeVars(result.spec, "light", "default", 0);
    const tintedVars = previewThemeVars(result.spec, "light", "default", 0.012);

    expect(tintedVars["--studio-shell"]).not.toBe(neutralVars["--studio-shell"]);
    expect(tintedVars["--studio-board"]).not.toBe(neutralVars["--studio-board"]);
    expect(tintedVars["--studio-hero-surface"]).not.toBe(neutralVars["--studio-hero-surface"]);
    expect(tintedVars["--studio-hero-surface-strong"]).not.toBe(neutralVars["--studio-hero-surface-strong"]);
    expect(tintedVars["--studio-accent"]).toBe(neutralVars["--studio-accent"]);
  });

  it("maps density and elevation into visible preview variables", () => {
    const base = createDefaultSpec("Tweaker");
    const compactFlat = previewThemeVars(
      {
        ...base,
        layout: { ...base.layout, density: "compact" },
        elevation: { ...base.elevation, preset: "flat" }
      },
      "light"
    );
    const spaciousDrama = previewThemeVars(
      {
        ...base,
        layout: { ...base.layout, density: "spacious" },
        elevation: { ...base.elevation, preset: "dramatic" }
      },
      "light"
    );

    expect(compactFlat["--studio-density-gap"]).not.toBe(spaciousDrama["--studio-density-gap"]);
    expect(compactFlat["--studio-density-card-padding"]).not.toBe(spaciousDrama["--studio-density-card-padding"]);
    expect(compactFlat["--studio-card-shadow"]).toBe("none");
    expect(spaciousDrama["--studio-card-shadow"]).toContain("90px");
  });

  it("maps heading scale into visible preview variables", () => {
    const base = createDefaultSpec("Tweaker");
    const editorial = previewThemeVars(
      { ...base, typography: { ...base.typography, scalePreset: "editorial" } },
      "light"
    );
    const product = previewThemeVars(
      { ...base, typography: { ...base.typography, scalePreset: "product" } },
      "light"
    );

    expect(editorial["--studio-type-display-size"]).toBe("68px");
    expect(product["--studio-type-display-size"]).toBe("56px");
    expect(editorial["--studio-type-section-size"]).not.toBe(product["--studio-type-section-size"]);
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
