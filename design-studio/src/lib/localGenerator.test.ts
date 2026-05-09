import { describe, expect, it } from "vitest";
import { createDefaultSpec } from "./designMd";
import { DEFAULT_BRIEF, generateScreen } from "./localGenerator";

describe("local screen generator", () => {
  it("creates a generated screen without network inputs", () => {
    const spec = createDefaultSpec("AI Studio");
    const screen = generateScreen(DEFAULT_BRIEF, spec);

    expect(screen.title).toContain("Turn a product idea");
    expect(screen.sections.length).toBeGreaterThan(0);
    expect(screen.sections[0].components.length).toBeGreaterThan(0);
    expect(screen.layoutIntent).toContain(spec.layout.density);
  });

  it("switches templates by page type", () => {
    const spec = createDefaultSpec("AI Studio");
    const screen = generateScreen({ ...DEFAULT_BRIEF, pageType: "dashboard" }, spec);

    expect(screen.pageType).toBe("dashboard");
    expect(screen.sections[0].id).toBe("command-center");
    expect(screen.primaryAction).toBe("Review signals");
  });
});
