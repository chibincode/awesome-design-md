import type { DesignBrief, DesignSpec, GeneratedComponent, GeneratedScreen, GeneratedSection } from "../types/design";

export const DEFAULT_BRIEF: DesignBrief = {
  pageType: "landing",
  audience: "UI designers building AI products",
  goal: "Turn a product idea into a polished interface direction quickly",
  keyContent: "AI brief, generated preview, DESIGN.md style memory, token controls, export workflow",
  referenceStyle: "Professional, calm, tool-like, and easy to scan"
};

function clean(value: string, fallback: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized || fallback;
}

function splitContent(value: string) {
  return clean(value, DEFAULT_BRIEF.keyContent)
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function titleFromGoal(goal: string) {
  const cleaned = clean(goal, DEFAULT_BRIEF.goal);
  if (cleaned.length <= 72) return cleaned;
  return `${cleaned.slice(0, 69).trim()}...`;
}

function createComponents(items: string[], fallbackPrefix: string): GeneratedComponent[] {
  return items
    .slice(0, 4)
    .map((item, index) => ({
      label: item,
      body:
        index === 0
          ? `Lead with ${item.toLowerCase()} so the experience has a clear first action.`
          : `Use ${item.toLowerCase()} as a visible proof point in the workflow.`,
      kind: (index === 0 ? "primary" : index === 1 ? "metric" : index === 2 ? "secondary" : "note") as GeneratedComponent["kind"]
    }))
    .concat(
      items.length >= 4
        ? []
        : [
            {
              label: `${fallbackPrefix} polish`,
              body: "Keep hierarchy, copy density, and interaction states aligned with the selected DESIGN.md.",
              kind: "action"
            }
          ]
    );
}

function sectionForPageType(brief: DesignBrief, spec: DesignSpec, items: string[]): GeneratedSection[] {
  const audience = clean(brief.audience, DEFAULT_BRIEF.audience);
  const style = clean(brief.referenceStyle, spec.theme.atmosphere);

  if (brief.pageType === "dashboard") {
    return [
      {
        id: "command-center",
        kicker: "Command view",
        title: "Decision dashboard",
        body: `A dense but readable surface for ${audience}, using ${style.toLowerCase()} as the visual direction.`,
        components: createComponents(items, "Dashboard")
      },
      {
        id: "signals",
        kicker: "Live signals",
        title: "What needs attention",
        body: "Prioritize a small set of high-signal metrics and make secondary details available without crowding the first view.",
        components: [
          { label: "Health score", body: "A single confidence readout anchors the top row.", kind: "metric" },
          { label: "Recent changes", body: "Surface the latest important shifts in a compact feed.", kind: "secondary" },
          { label: "Next action", body: "Keep the strongest operational action visible.", kind: "action" }
        ]
      }
    ];
  }

  if (brief.pageType === "tool") {
    return [
      {
        id: "workspace",
        kicker: "Creation flow",
        title: "Focused design workspace",
        body: `A practical tool surface for ${audience}, with the selected DESIGN.md driving spacing, type, color, and component tone.`,
        components: createComponents(items, "Workspace")
      },
      {
        id: "review",
        kicker: "Review loop",
        title: "Generate, inspect, adjust",
        body: "Keep the brief, preview, and exportable design language visible as one continuous iteration loop.",
        components: [
          { label: "Brief input", body: "Capture intent without forcing designers into rigid schemas.", kind: "primary" },
          { label: "Preview canvas", body: "Show generated UI in the active visual system.", kind: "secondary" },
          { label: "Export DESIGN.md", body: "Preserve the style memory for coding agents.", kind: "action" }
        ]
      }
    ];
  }

  return [
    {
      id: "hero",
      kicker: "First impression",
      title: "Clear product promise",
      body: `A landing surface for ${audience}, shaped by ${style.toLowerCase()} and the active token system.`,
      components: createComponents(items, "Landing")
    },
    {
      id: "proof",
      kicker: "Trust layer",
      title: "Proof before detail",
      body: "Use concise proof points and a visible next step so the page feels directed instead of decorative.",
      components: [
        { label: "Audience fit", body: `Make ${audience.toLowerCase()} feel immediately addressed.`, kind: "primary" },
        { label: "Workflow proof", body: "Show how the product moves from idea to interface.", kind: "secondary" },
        { label: "Try the flow", body: "Keep one primary CTA visually dominant.", kind: "action" }
      ]
    }
  ];
}

export function generateScreen(brief: DesignBrief, spec: DesignSpec): GeneratedScreen {
  const items = splitContent(brief.keyContent);
  const title = titleFromGoal(brief.goal);
  const audience = clean(brief.audience, DEFAULT_BRIEF.audience);
  const style = clean(brief.referenceStyle, spec.theme.atmosphere);

  return {
    title,
    subtitle: `${spec.meta.title} style applied to a ${brief.pageType} concept for ${audience}.`,
    pageType: brief.pageType,
    audience,
    layoutIntent: `${spec.layout.density} density, ${spec.shape.radius} radius, ${spec.elevation.preset} elevation, ${style.toLowerCase()}.`,
    primaryAction: brief.pageType === "dashboard" ? "Review signals" : brief.pageType === "tool" ? "Generate screen" : "Start designing",
    secondaryAction: "Export DESIGN.md",
    sections: sectionForPageType(brief, spec, items)
  };
}
