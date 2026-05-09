import { describe, expect, it } from "vitest";
import { CODEX_TEST_DRAFT_JSON, parseCodexDraftJson } from "./codexDraft";

describe("Codex draft bridge", () => {
  it("parses the bundled Codex test draft into a generated screen", () => {
    const screen = parseCodexDraftJson(CODEX_TEST_DRAFT_JSON);

    expect(screen.title).toContain("Design system tuning");
    expect(screen.pageType).toBe("landing");
    expect(screen.sections.length).toBeGreaterThan(1);
    expect(screen.sections[0].components.length).toBeGreaterThan(0);
  });

  it("rejects JSON without sections", () => {
    expect(() => parseCodexDraftJson("{\"title\":\"Broken\"}")).toThrow("at least one section");
  });
});
