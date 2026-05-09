import type { GeneratedComponent, GeneratedScreen } from "../types/design";

export const CODEX_TEST_DRAFT_JSON = JSON.stringify(
  {
    title: "Design system tuning before AI generation",
    subtitle:
      "A focused workspace for UI designers to choose a design.md style, tune global tokens, then generate comparable product screen directions.",
    pageType: "landing",
    audience: "UI designers building AI products",
    layoutIntent:
      "Start with a calm style lab, keep token controls visible only during styling, and place generated drafts on a review canvas for comparison.",
    primaryAction: "Tune style",
    secondaryAction: "Generate draft",
    sections: [
      {
        id: "style-lab",
        kicker: "Style first",
        title: "Pick the visual language before asking AI for screens",
        body:
          "The first step should feel like a design-system tasting room: fixed benchmark pages, preset design.md styles, and global controls for accent, base tone, type, radius, density, and elevation.",
        components: [
          {
            label: "Preset design.md",
            body: "Start from recognizable product-style presets so users understand what changed.",
            kind: "primary"
          },
          {
            label: "Global Tweaker",
            body: "Keep the controls scoped to Style Lab so Generate stays focused on review.",
            kind: "secondary"
          },
          {
            label: "Benchmark pages",
            body: "Use landing, dashboard, and component scenes to judge one style against the same structure.",
            kind: "metric"
          }
        ]
      },
      {
        id: "generation-canvas",
        kicker: "Draft review",
        title: "Generated screens should accumulate like visual options",
        body:
          "The Generate step should not look like another settings page. It should behave like a lightweight canvas where each AI result becomes a comparable draft card.",
        components: [
          {
            label: "Empty start",
            body: "No default draft. The canvas begins empty until the user asks for a screen.",
            kind: "primary"
          },
          {
            label: "Side-by-side",
            body: "Each generation stays on the canvas so users can compare directions instead of replacing context.",
            kind: "secondary"
          },
          {
            label: "Zoomable review",
            body: "Basic zoom controls make the draft area feel closer to a real design review surface.",
            kind: "action"
          }
        ]
      },
      {
        id: "handoff",
        kicker: "Design DNA",
        title: "The output should still resolve back to design.md",
        body:
          "Generated screens are experiments. The stable artifact remains the design.md style memory that can guide coding agents and future iterations.",
        components: [
          {
            label: "Reusable style",
            body: "Preserve the chosen style tokens across every generated option.",
            kind: "note"
          },
          {
            label: "Export path",
            body: "Keep DESIGN.md export visible as the durable design-system handoff.",
            kind: "action"
          }
        ]
      }
    ]
  },
  null,
  2
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function parseComponent(value: unknown, index: number): GeneratedComponent {
  const input = isRecord(value) ? value : {};
  const kind = input.kind === "primary" || input.kind === "secondary" || input.kind === "metric" || input.kind === "action" || input.kind === "note"
    ? input.kind
    : "secondary";

  return {
    label: asString(input.label, `Component ${index + 1}`),
    body: asString(input.body, "AI-generated component guidance."),
    kind
  };
}

export function parseCodexDraftJson(value: string): GeneratedScreen {
  const parsed: unknown = JSON.parse(value);
  if (!isRecord(parsed)) {
    throw new Error("Codex draft must be a JSON object.");
  }

  const pageType = parsed.pageType === "dashboard" || parsed.pageType === "tool" || parsed.pageType === "landing" ? parsed.pageType : "landing";
  const rawSections = Array.isArray(parsed.sections) ? parsed.sections : [];
  const sections = rawSections.map((section, index) => {
    const input = isRecord(section) ? section : {};
    const rawComponents = Array.isArray(input.components) ? input.components : [];

    return {
      id: asString(input.id, `section-${index + 1}`),
      kicker: asString(input.kicker, "AI section"),
      title: asString(input.title, `Generated section ${index + 1}`),
      body: asString(input.body, "AI-generated section direction."),
      components: rawComponents.map(parseComponent).slice(0, 4)
    };
  });

  if (sections.length === 0) {
    throw new Error("Codex draft needs at least one section.");
  }

  return {
    title: asString(parsed.title, "AI generated interface direction"),
    subtitle: asString(parsed.subtitle, "Generated with Codex test bridge."),
    pageType,
    audience: asString(parsed.audience, "Product designers"),
    layoutIntent: asString(parsed.layoutIntent, "AI-generated layout intent."),
    primaryAction: asString(parsed.primaryAction, "Review draft"),
    secondaryAction: asString(parsed.secondaryAction, "Export DESIGN.md"),
    sections
  };
}
