import {
  DENSITY_COPY,
  ELEVATION_COPY,
  FORM_RADIUS_VALUES,
  RADIUS_VALUES,
  SCALE_PRESET_LABELS,
  TYPOGRAPHY_SCALE
} from "./presets";
import { contrastText, luminance, parseColor, saturation, toHex } from "./color";
import type {
  DesignSpec,
  DensityPreset,
  ElevationPreset,
  ImportResult,
  PaletteReference,
  RadiusPreset,
  ScalePreset,
  SectionId,
  ThemeMode
} from "../types/design";

const SECTION_TITLES: Array<{ id: SectionId; title: string }> = [
  { id: "theme", title: "Visual Theme & Atmosphere" },
  { id: "colors", title: "Color Palette & Roles" },
  { id: "typography", title: "Typography Rules" },
  { id: "components", title: "Component Stylings" },
  { id: "layout", title: "Layout Principles" },
  { id: "elevation", title: "Depth & Elevation" },
  { id: "dosDonts", title: "Do's and Don'ts" },
  { id: "responsive", title: "Responsive Behavior" },
  { id: "agentPrompts", title: "Agent Prompt Guide" }
];

const SECTION_LOOKUP = new Map(
  SECTION_TITLES.map((section) => [section.title.toLowerCase(), section.id])
);

const DEFAULT_SPEC: DesignSpec = {
  meta: {
    title: "Untitled System",
    description: "A polished interface system focused on clarity, hierarchy, and confident interaction details.",
    sourceName: "Untitled System"
  },
  theme: {
    visualTheme:
      "A calm, product-forward system with clean spacing, restrained ornament, and a strong emphasis on component legibility.",
    atmosphere: "Confident, structured, and quietly premium.",
    themeMode: "light"
  },
  colors: {
    accent: "#4f7cff",
    base: "#eef1f6",
    surface: "#ffffff",
    textPrimary: "#121926",
    textSecondary: "#566173",
    border: "#d9dfeb",
    palette: []
  },
  typography: {
    displayFont: "Manrope",
    bodyFont: "IBM Plex Sans",
    monoFont: "IBM Plex Mono",
    scalePreset: "balanced",
    fontNotes: []
  },
  shape: {
    radius: "medium",
    formRadius: "large"
  },
  elevation: {
    preset: "soft",
    notes: []
  },
  layout: {
    density: "comfortable",
    notes: []
  },
  components: {
    notes: []
  },
  responsive: {
    notes: []
  },
  notes: {
    sourceKind: "manual",
    importedSections: {},
    warnings: [],
    misc: []
  }
};

interface ExtractedSections {
  mapped: Partial<Record<SectionId, string>>;
  misc: string[];
}

function normalizeMarkdown(markdown: string) {
  return markdown.replace(/\r\n/g, "\n").trim();
}

function humanize(value: string) {
  return value
    .replace(/[-_.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getTitle(markdown: string) {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (!match) return DEFAULT_SPEC.meta.title;
  return match[1].replace(/^Design System:\s*/i, "").trim();
}

function stripImportedNotes(sectionBody: string) {
  const marker = /^###\s+Imported Notes\s*$/im;
  const match = marker.exec(sectionBody);
  if (!match || match.index === undefined) {
    return { core: sectionBody.trim(), imported: "" };
  }
  const core = sectionBody.slice(0, match.index).trim();
  const imported = sectionBody.slice(match.index + match[0].length).trim();
  return { core, imported };
}

function extractSections(markdown: string): ExtractedSections {
  const sections = Array.from(markdown.matchAll(/^##\s+\d+\.\s+(.+)$/gm));
  const mapped: Partial<Record<SectionId, string>> = {};
  const misc: string[] = [];

  sections.forEach((section, index) => {
    const heading = section[1].trim();
    const start = section.index! + section[0].length;
    const end = index + 1 < sections.length ? sections[index + 1].index! : markdown.length;
    const body = markdown.slice(start, end).trim();
    const id = SECTION_LOOKUP.get(heading.toLowerCase());
    if (id) {
      mapped[id] = body;
    } else {
      misc.push(`## ${heading}\n\n${body}`);
    }
  });

  return { mapped, misc };
}

function firstParagraph(sectionBody: string) {
  const paragraphs = sectionBody
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return paragraphs.find((paragraph) => !paragraph.startsWith("-") && !paragraph.startsWith("|")) ?? "";
}

function findCodeToken(line: string) {
  const match = line.match(/`([^`]+)`/);
  return match?.[1]?.trim() ?? "";
}

function findFont(sectionBody: string, label: string) {
  const regex = new RegExp(`-\\s*\\*\\*${label}\\*\\*:\\s*(.+)$`, "im");
  const line = sectionBody.match(regex)?.[1];
  if (!line) return "";
  const codeToken = findCodeToken(line);
  if (codeToken) return codeToken;
  return line
    .replace(/\*+/g, "")
    .split(",")[0]
    .replace(/^["']|["']$/g, "")
    .trim();
}

function detectScalePreset(sectionBody: string): ScalePreset {
  const value = sectionBody.toLowerCase();
  if (/(editorial|magazine|book|serif|literary)/.test(value)) return "editorial";
  if (/(dashboard|terminal|product|ui text|code-first|compact)/.test(value)) return "product";
  return "balanced";
}

function detectDensity(sectionBody: string): DensityPreset {
  const value = sectionBody.toLowerCase();
  if (/(dense|tight|compressed|code-centric|compact)/.test(value)) return "compact";
  if (/(generous|breath|spacious|editorial pacing|dramatic pauses)/.test(value)) return "spacious";
  return "comfortable";
}

function detectElevation(sectionBody: string): ElevationPreset {
  const value = sectionBody.toLowerCase();
  if (/(ring|glow|outline)/.test(value)) return "ring";
  if (/(dramatic|deep ambient|floating|30px|40px|cinematic)/.test(value)) return "dramatic";
  if (/(no shadow|flat)/.test(value)) return "flat";
  return "soft";
}

function radiusFromValues(values: number[]): RadiusPreset {
  if (!values.length) return "medium";
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (average < 1) return "none";
  if (average < 3) return "extra-small";
  if (average < 6) return "small";
  if (average < 10) return "medium";
  if (average < 14) return "large";
  return "extra-large";
}

function detectRadius(sectionBody: string, fallback: RadiusPreset) {
  const matches = Array.from(sectionBody.matchAll(/(\d+(?:\.\d+)?)px/g)).map((match) => Number.parseFloat(match[1]));
  if (!matches.length) return fallback;
  return radiusFromValues(matches);
}

function detectRadiusFromKeywords(sectionBody: string, keywords: string[]) {
  const normalizedKeywords = keywords.map((keyword) => keyword.toLowerCase());
  const lineMatch = sectionBody
    .split("\n")
    .map((line) => line.trim())
    .find((line) => normalizedKeywords.some((keyword) => line.toLowerCase().includes(keyword)));

  if (!lineMatch) return null;
  return detectRadius(lineMatch, "medium");
}

function detectStructuredRadiusPair(sectionBody: string) {
  const lines = sectionBody
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const pairMatch = line.match(
      /`?(\d+(?:\.\d+)?)px`?\s+for\s+.+?\s+and\s+`?(\d+(?:\.\d+)?)px`?\s+for\s+form/i
    );
    if (pairMatch) {
      return {
        radius: radiusFromValues([Number.parseFloat(pairMatch[1])]),
        formRadius: radiusFromValues([Number.parseFloat(pairMatch[2])])
      };
    }
  }

  return null;
}

function detectThemeMode(sectionBody: string, baseColor: string) {
  const value = sectionBody.toLowerCase();
  if (/(alternates between|light and dark|dark\/light|hybrid)/.test(value)) return "hybrid";
  if (/(dark canvas|void|pure black|black background|dark theme)/.test(value) || luminance(baseColor) < 0.22) {
    return "dark";
  }
  return "light";
}

function parsePalette(sectionBody: string): PaletteReference[] {
  const entries: PaletteReference[] = [];
  const regex = /^-\s+\*\*(.+?)\*\*\s+\(`([^`]+)`\):\s*(.+)$/gm;
  for (const match of sectionBody.matchAll(regex)) {
    entries.push({
      name: match[1].trim(),
      value: match[2].trim(),
      role: match[3].split("—")[0].trim(),
      description: match[3].trim()
    });
  }
  return entries;
}

function scoreEntry(entry: PaletteReference, keywords: string[]) {
  const haystack = `${entry.name} ${entry.role} ${entry.description}`.toLowerCase();
  return keywords.reduce((score, keyword) => score + (haystack.includes(keyword) ? 3 : 0), 0);
}

function choosePaletteValue(
  palette: PaletteReference[],
  keywords: string[],
  fallback: string,
  filter?: (entry: PaletteReference) => boolean
) {
  let winner = fallback;
  let winnerScore = -1;
  for (const entry of palette) {
    if (filter && !filter(entry)) continue;
    const score = scoreEntry(entry, keywords);
    if (score > winnerScore) {
      winner = entry.value;
      winnerScore = score;
    }
  }
  if (winnerScore > 0) return toHex(winner);

  const vivid = palette
    .filter((entry) => !/(error|focus|link|border|ring)/i.test(`${entry.name} ${entry.description}`))
    .sort((a, b) => saturation(b.value) - saturation(a.value));
  return vivid[0] ? toHex(vivid[0].value) : fallback;
}

function uniquePalette(palette: PaletteReference[]) {
  const seen = new Set<string>();
  return palette.filter((entry) => {
    const key = `${entry.name}|${entry.value}|${entry.role}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function deriveDescription(title: string, themeSection: string) {
  const paragraph = firstParagraph(themeSection);
  if (paragraph) return paragraph;
  return `${title} focuses on strong component clarity, expressive hierarchy, and reusable design tokens.`;
}

function importedNoteBlock(content?: string) {
  if (!content) return "";
  return `\n### Imported Notes\n\n${content.trim()}\n`;
}

function buildTypographyTable(spec: DesignSpec) {
  const rows = TYPOGRAPHY_SCALE[spec.typography.scalePreset]
    .map(
      (row) =>
        `| ${row.role} | ${row.role.includes("Body") || row.role === "Caption" ? spec.typography.bodyFont : spec.typography.displayFont} | ${row.size} | ${row.weight} | ${row.lineHeight} | ${row.letterSpacing} |`
    )
    .join("\n");

  return [
    "| Role | Font | Size | Weight | Line Height | Letter Spacing |",
    "|------|------|------|--------|-------------|----------------|",
    rows
  ].join("\n");
}

function generatedThemeParagraph(spec: DesignSpec) {
  const accentText = contrastText(spec.colors.accent);
  const themeFlavor =
    spec.theme.themeMode === "dark"
      ? "dark-led system"
      : spec.theme.themeMode === "hybrid"
        ? "dual-surface system"
        : "light-led system";

  return `${spec.meta.title} is a ${themeFlavor} built around ${spec.theme.atmosphere.toLowerCase()}. The core canvas starts from \`${spec.colors.base}\`, surfaces land on \`${spec.colors.surface}\`, and the main accent \`${spec.colors.accent}\` is calibrated for strong interaction contrast with ${accentText === "#10151d" ? "dark" : "light"} foreground pairings.`;
}

function generatedComponentCopy(spec: DesignSpec) {
  const radius = RADIUS_VALUES[spec.shape.radius];
  const formRadius = FORM_RADIUS_VALUES[spec.shape.formRadius];
  return [
    `- **Buttons**: Primary actions use \`${spec.colors.accent}\` on high-contrast text with a shared radius of \`${radius}\`. Secondary buttons rely on \`${spec.colors.surface}\` and \`${spec.colors.border}\` for definition.`,
    `- **Inputs & Selectors**: Form controls use \`${formRadius}\` radius, \`${spec.colors.surface}\` fill, and \`${spec.colors.border}\` borders. Focus states should reinforce the accent color rather than introduce a second hue.`,
    `- **Cards & Panels**: Surfaces stack from page to card using subtle tone separation and the \`${spec.elevation.preset}\` elevation preset.`,
    `- **Navigation & Tabs**: Segmented controls, tab bars, and top-level navigation should feel structurally aligned with the current density preset: ${spec.layout.density}.`
  ].join("\n");
}

function generatedDoDont(spec: DesignSpec) {
  return [
    "### Do",
    `- Keep interaction accents anchored to \`${spec.colors.accent}\` and avoid introducing unrelated highlight colors.`,
    `- Maintain a consistent radius system using \`${RADIUS_VALUES[spec.shape.radius]}\` for general components and \`${FORM_RADIUS_VALUES[spec.shape.formRadius]}\` for form controls.`,
    `- Preserve the ${SCALE_PRESET_LABELS[spec.typography.scalePreset].toLowerCase()} typography rhythm across screens.`,
    "",
    "### Don't",
    "- Mix multiple surface languages or competing shadow systems in the same screen.",
    "- Let utility copy become louder than the display hierarchy.",
    "- Break density rules by packing some screens tightly and letting others drift without intention."
  ].join("\n");
}

function generatedResponsive(spec: DesignSpec) {
  return [
    "| Breakpoint | Behavior |",
    "|------------|----------|",
    `| Mobile | Collapse multi-column cards into a single stack, preserve primary actions, and keep vertical rhythm ${spec.layout.density}. |`,
    "| Tablet | Allow two-column compositions where content pairs naturally with media or settings panels. |",
    "| Desktop | Use full canvas width, keep the component rhythm consistent, and preserve generous breathing room around hero or showcase cards. |"
  ].join("\n");
}

function generatedPromptGuide(spec: DesignSpec) {
  return [
    "### Quick Tokens",
    `- Accent: \`${spec.colors.accent}\``,
    `- Base / Page: \`${spec.colors.base}\``,
    `- Surface: \`${spec.colors.surface}\``,
    `- Text Primary: \`${spec.colors.textPrimary}\``,
    `- Border: \`${spec.colors.border}\``,
    "",
    "### Example Prompt",
    `- "Create a ${spec.theme.themeMode} product workspace using ${spec.typography.displayFont} for display moments, ${spec.typography.bodyFont} for UI copy, ${spec.colors.accent} for primary actions, and a ${spec.elevation.preset} elevation system."`
  ].join("\n");
}

export function createDefaultSpec(title = DEFAULT_SPEC.meta.title): DesignSpec {
  return {
    ...DEFAULT_SPEC,
    meta: {
      ...DEFAULT_SPEC.meta,
      title,
      sourceName: title
    }
  };
}

export function importDesignMd(markdown: string, metadata?: Partial<DesignSpec["meta"]> & { sourceKind?: DesignSpec["notes"]["sourceKind"] }): ImportResult {
  const normalized = normalizeMarkdown(markdown);
  const title = metadata?.title || getTitle(normalized);
  const { mapped, misc } = extractSections(normalized);
  const themeSplit = stripImportedNotes(mapped.theme ?? "");
  const colorSplit = stripImportedNotes(mapped.colors ?? "");
  const typographySplit = stripImportedNotes(mapped.typography ?? "");
  const componentSplit = stripImportedNotes(mapped.components ?? "");
  const layoutSplit = stripImportedNotes(mapped.layout ?? "");
  const elevationSplit = stripImportedNotes(mapped.elevation ?? "");
  const responsiveSplit = stripImportedNotes(mapped.responsive ?? "");
  const dosSplit = stripImportedNotes(mapped.dosDonts ?? "");
  const promptSplit = stripImportedNotes(mapped.agentPrompts ?? "");

  const palette = uniquePalette(parsePalette(colorSplit.core));
  const accent = choosePaletteValue(
    palette,
    ["accent", "brand", "cta", "coral", "terracotta", "primary accent"],
    DEFAULT_SPEC.colors.accent
  );
  const base = choosePaletteValue(
    palette,
    ["page background", "canvas", "background", "parchment", "void black"],
    DEFAULT_SPEC.colors.base,
    (entry) => !/(text|border|ring)/i.test(`${entry.name} ${entry.description}`)
  );
  const surface = choosePaletteValue(
    palette,
    ["surface", "card", "container", "elevated", "ivory", "white surface"],
    DEFAULT_SPEC.colors.surface
  );
  const textPrimary = choosePaletteValue(
    palette,
    ["primary text", "heading text", "foreground", "near black", "pure white"],
    DEFAULT_SPEC.colors.textPrimary,
    (entry) => /(text|white|black|foreground)/i.test(`${entry.name} ${entry.description}`)
  );
  const textSecondary = choosePaletteValue(
    palette,
    ["secondary text", "body text", "muted", "tertiary text", "olive gray"],
    DEFAULT_SPEC.colors.textSecondary,
    (entry) => /(text|gray|muted|silver|secondary)/i.test(`${entry.name} ${entry.description}`)
  );
  const border = choosePaletteValue(
    palette,
    ["border", "divider", "ring", "outline"],
    DEFAULT_SPEC.colors.border,
    (entry) => /(border|ring|divider)/i.test(`${entry.name} ${entry.description}`)
  );

  const displayFont = findFont(typographySplit.core, "Display") || findFont(typographySplit.core, "Headline") || DEFAULT_SPEC.typography.displayFont;
  const bodyFont = findFont(typographySplit.core, "Body / UI") || findFont(typographySplit.core, "Body/UI") || findFont(typographySplit.core, "Body") || DEFAULT_SPEC.typography.bodyFont;
  const monoFont = findFont(typographySplit.core, "Monospace") || findFont(typographySplit.core, "Code") || DEFAULT_SPEC.typography.monoFont;

  const themeMode = detectThemeMode(themeSplit.core, base);
  const radiusSection = `${layoutSplit.core}\n${componentSplit.core}`;
  const structuredRadiusPair = detectStructuredRadiusPair(radiusSection);
  const radius =
    structuredRadiusPair?.radius ??
    detectRadiusFromKeywords(radiusSection, ["core radius", "general components", "overall ui", "menus and modals"]) ??
    detectRadius(radiusSection, DEFAULT_SPEC.shape.radius);
  const inputSection = componentSplit.core.match(/###\s+Inputs[\s\S]*?(?=###|$)/i)?.[0] ?? componentSplit.core;
  const formRadius =
    structuredRadiusPair?.formRadius ??
    detectRadiusFromKeywords(inputSection, ["form radius", "form controls", "form elements", "inputs", "selects"]) ??
    detectRadius(inputSection, radius);
  const density = detectDensity(layoutSplit.core);
  const elevation = detectElevation(elevationSplit.core);

  const warnings: string[] = [];
  for (const section of SECTION_TITLES) {
    if (!mapped[section.id]) {
      warnings.push(`Missing section: ${section.title}`);
    }
  }
  if (!palette.length) warnings.push("No structured color tokens were detected. The studio is using safe defaults.");
  if (!findFont(typographySplit.core, "Headline") && !findFont(typographySplit.core, "Display")) {
    warnings.push("Display font was not detected. A studio default font bundle is active.");
  }

  const spec: DesignSpec = {
    meta: {
      title,
      description: metadata?.description || deriveDescription(title, themeSplit.core),
      sourceName: metadata?.sourceName || title,
      sourcePath: metadata?.sourcePath
    },
    theme: {
      visualTheme: firstParagraph(themeSplit.core) || DEFAULT_SPEC.theme.visualTheme,
      atmosphere: themeSplit.core.includes("**Key Characteristics:**")
        ? "Structured and characterful."
        : DEFAULT_SPEC.theme.atmosphere,
      themeMode
    },
    colors: {
      accent,
      base: toHex(base),
      surface: toHex(surface),
      textPrimary: toHex(textPrimary),
      textSecondary: toHex(textSecondary),
      border: toHex(border),
      palette
    },
    typography: {
      displayFont,
      bodyFont,
      monoFont,
      scalePreset: detectScalePreset(typographySplit.core),
      fontNotes: typographySplit.core ? [firstParagraph(typographySplit.core)].filter(Boolean) : []
    },
    shape: {
      radius,
      formRadius
    },
    elevation: {
      preset: elevation,
      notes: elevationSplit.core ? [firstParagraph(elevationSplit.core)].filter(Boolean) : []
    },
    layout: {
      density,
      notes: layoutSplit.core ? [firstParagraph(layoutSplit.core)].filter(Boolean) : []
    },
    components: {
      notes: componentSplit.core ? [firstParagraph(componentSplit.core)].filter(Boolean) : []
    },
    responsive: {
      notes: responsiveSplit.core ? [firstParagraph(responsiveSplit.core)].filter(Boolean) : []
    },
    notes: {
      sourceKind: metadata?.sourceKind ?? "manual",
      importedSections: {
        theme: themeSplit.imported || themeSplit.core,
        colors: colorSplit.imported || colorSplit.core,
        typography: typographySplit.imported || typographySplit.core,
        components: componentSplit.imported || componentSplit.core,
        layout: layoutSplit.imported || layoutSplit.core,
        elevation: elevationSplit.imported || elevationSplit.core,
        responsive: responsiveSplit.imported || responsiveSplit.core,
        dosDonts: dosSplit.imported || dosSplit.core,
        agentPrompts: promptSplit.imported || promptSplit.core
      },
      warnings,
      misc
    }
  };

  return { spec, warnings };
}

export function serializeDesignMd(spec: DesignSpec) {
  const paletteRows = [
    "| Token | Value | Role |",
    "|-------|-------|------|",
    `| Accent | \`${spec.colors.accent}\` | Primary interaction, CTA, selection highlights |`,
    `| Base / Page | \`${spec.colors.base}\` | Overall canvas and shell background |`,
    `| Surface | \`${spec.colors.surface}\` | Cards, panes, form surfaces |`,
    `| Text Primary | \`${spec.colors.textPrimary}\` | Headlines and high-emphasis copy |`,
    `| Text Secondary | \`${spec.colors.textSecondary}\` | Supporting copy, helper text, metadata |`,
    `| Border | \`${spec.colors.border}\` | Divider, outlines, containment |`
  ].join("\n");

  const paletteReferences = spec.colors.palette.length
    ? `\n### Imported Palette References\n\n${spec.colors.palette
        .map((entry) => `- **${entry.name}** (\`${entry.value}\`): ${entry.description}`)
        .join("\n")}\n`
    : "";

  const sections = [
    `# Design System: ${spec.meta.title}`,
    "",
    "## 1. Visual Theme & Atmosphere",
    "",
    generatedThemeParagraph(spec),
    importedNoteBlock(spec.notes.importedSections.theme),
    "",
    "## 2. Color Palette & Roles",
    "",
    paletteRows,
    paletteReferences,
    importedNoteBlock(spec.notes.importedSections.colors),
    "",
    "## 3. Typography Rules",
    "",
    "### Font Family",
    "",
    `- **Display**: \`${spec.typography.displayFont}\``,
    `- **Body / UI**: \`${spec.typography.bodyFont}\``,
    `- **Monospace**: \`${spec.typography.monoFont}\``,
    "",
    `### Hierarchy (${SCALE_PRESET_LABELS[spec.typography.scalePreset]})`,
    "",
    buildTypographyTable(spec),
    importedNoteBlock(spec.notes.importedSections.typography),
    "",
    "## 4. Component Stylings",
    "",
    generatedComponentCopy(spec),
    importedNoteBlock(spec.notes.importedSections.components),
    "",
    "## 5. Layout Principles",
    "",
    `- **Density preset**: ${spec.layout.density}`,
    `- **Rhythm**: ${DENSITY_COPY[spec.layout.density]}`,
    `- **Core radius**: \`${RADIUS_VALUES[spec.shape.radius]}\``,
    `- **Form radius**: \`${FORM_RADIUS_VALUES[spec.shape.formRadius]}\``,
    importedNoteBlock(spec.notes.importedSections.layout),
    "",
    "## 6. Depth & Elevation",
    "",
    `| Preset | Description |`,
    `|--------|-------------|`,
    `| ${spec.elevation.preset} | ${ELEVATION_COPY[spec.elevation.preset]} |`,
    importedNoteBlock(spec.notes.importedSections.elevation),
    "",
    "## 7. Do's and Don'ts",
    "",
    generatedDoDont(spec),
    importedNoteBlock(spec.notes.importedSections.dosDonts),
    "",
    "## 8. Responsive Behavior",
    "",
    generatedResponsive(spec),
    importedNoteBlock(spec.notes.importedSections.responsive),
    "",
    "## 9. Agent Prompt Guide",
    "",
    generatedPromptGuide(spec),
    importedNoteBlock(spec.notes.importedSections.agentPrompts)
  ];

  if (spec.notes.misc.length) {
    sections.push("", "## Appendix", "", spec.notes.misc.join("\n\n"));
  }

  return sections.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
