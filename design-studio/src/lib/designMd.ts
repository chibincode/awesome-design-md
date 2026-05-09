import {
  DENSITY_COPY,
  ELEVATION_COPY,
  FORM_RADIUS_VALUES,
  RADIUS_VALUES,
  SCALE_PRESET_LABELS,
  TYPOGRAPHY_SCALE
} from "./presets";
import { contrastText, darken, lighten, luminance, mix, parseColor, saturation, toHex } from "./color";
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
  { id: "shapes", title: "Shapes" },
  { id: "dosDonts", title: "Do's and Don'ts" },
  { id: "responsive", title: "Responsive Behavior" },
  { id: "agentPrompts", title: "Agent Prompt Guide" }
];

const SECTION_ALIASES: Array<{ id: SectionId; titles: string[] }> = [
  { id: "theme", titles: ["Overview", "Brand & Style", "Visual Theme & Atmosphere"] },
  { id: "colors", titles: ["Colors", "Color Palette & Roles"] },
  { id: "typography", titles: ["Typography", "Typography Rules"] },
  { id: "layout", titles: ["Layout", "Layout & Spacing", "Layout Principles"] },
  { id: "elevation", titles: ["Elevation & Depth", "Elevation", "Depth & Elevation"] },
  { id: "shapes", titles: ["Shapes"] },
  { id: "components", titles: ["Components", "Component Stylings"] },
  { id: "dosDonts", titles: ["Do's and Don'ts", "Dos and Donts"] },
  { id: "responsive", titles: ["Responsive Behavior", "Responsive"] },
  { id: "agentPrompts", titles: ["Agent Prompt Guide"] }
];

const SECTION_LOOKUP = new Map(SECTION_ALIASES.flatMap((section) => section.titles.map((title) => [title.toLowerCase(), section.id])));

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

interface ParsedFrontmatter {
  name?: string;
  colors: Record<string, string>;
  typography: Record<
    string,
    Partial<{
      fontFamily: string;
      fontSize: string;
      fontWeight: string;
      lineHeight: string;
      letterSpacing: string;
    }>
  >;
  rounded: Record<string, string>;
  spacing: Record<string, string>;
}

function normalizeMarkdown(markdown: string) {
  return markdown.replace(/\r\n/g, "\n").trim();
}

function getYamlFrontmatter(markdown: string) {
  if (!markdown.startsWith("---\n")) return "";
  const end = markdown.indexOf("\n---", 4);
  if (end === -1) return "";
  return markdown.slice(4, end).trim();
}

function stripYamlFrontmatter(markdown: string) {
  if (!markdown.startsWith("---\n")) return markdown;
  const end = markdown.indexOf("\n---", 4);
  if (end === -1) return markdown;
  return markdown.slice(end + 4).trim();
}

function cleanYamlScalar(value: string) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function topLevelYamlValue(frontmatter: string, key: string) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match ? cleanYamlScalar(match[1]) : undefined;
}

function parseFlatYamlMap(frontmatter: string, sectionName: string) {
  const result: Record<string, string> = {};
  let active = false;

  for (const line of frontmatter.split("\n")) {
    const topLevel = line.match(/^([a-zA-Z0-9_-]+):\s*$/);
    if (topLevel) {
      active = topLevel[1] === sectionName;
      continue;
    }

    if (!active) continue;
    if (/^\S/.test(line)) break;

    const entry = line.match(/^\s{2}([a-zA-Z0-9_-]+|DEFAULT):\s*(.+)$/);
    if (entry) {
      result[entry[1]] = cleanYamlScalar(entry[2]);
    }
  }

  return result;
}

function parseTypographyYaml(frontmatter: string): ParsedFrontmatter["typography"] {
  const typography: ParsedFrontmatter["typography"] = {};
  let active = false;
  let currentRole = "";

  for (const line of frontmatter.split("\n")) {
    const topLevel = line.match(/^([a-zA-Z0-9_-]+):\s*$/);
    if (topLevel) {
      active = topLevel[1] === "typography";
      currentRole = "";
      continue;
    }

    if (!active) continue;
    if (/^\S/.test(line)) break;

    const role = line.match(/^\s{2}([a-zA-Z0-9_-]+):\s*$/);
    if (role) {
      currentRole = role[1];
      typography[currentRole] = {};
      continue;
    }

    const property = line.match(/^\s{4}([a-zA-Z0-9_-]+):\s*(.+)$/);
    if (currentRole && property) {
      typography[currentRole][property[1] as keyof ParsedFrontmatter["typography"][string]] = cleanYamlScalar(property[2]);
    }
  }

  return typography;
}

function parseFrontmatter(markdown: string): ParsedFrontmatter {
  const frontmatter = getYamlFrontmatter(markdown);
  return {
    name: frontmatter ? topLevelYamlValue(frontmatter, "name") : undefined,
    colors: frontmatter ? parseFlatYamlMap(frontmatter, "colors") : {},
    typography: frontmatter ? parseTypographyYaml(frontmatter) : {},
    rounded: frontmatter ? parseFlatYamlMap(frontmatter, "rounded") : {},
    spacing: frontmatter ? parseFlatYamlMap(frontmatter, "spacing") : {}
  };
}

function yamlString(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function yamlToken(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
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
  const sections = Array.from(markdown.matchAll(/^##\s+(?:\d+\.\s+)?(.+)$/gm));
  const mapped: Partial<Record<SectionId, string>> = {};
  const misc: string[] = [];

  sections.forEach((section, index) => {
    const heading = section[1].trim();
    const start = section.index! + section[0].length;
    const end = index + 1 < sections.length ? sections[index + 1].index! : markdown.length;
    const body = markdown.slice(start, end).trim();
    const id = SECTION_LOOKUP.get(heading.toLowerCase());
    if (id && !mapped[id]) {
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

function paletteFromFrontmatterColors(colors: Record<string, string>): PaletteReference[] {
  return Object.entries(colors)
    .filter(([, value]) => parseColor(value))
    .map(([name, value]) => ({
      name: humanize(name),
      value: toHex(value),
      role: humanize(name),
      description: `${humanize(name)} token from Stitch frontmatter.`
    }));
}

function frontmatterColor(colors: Record<string, string>, keys: string[], fallback: string) {
  const value = keys.map((key) => colors[key]).find(Boolean);
  return value ? toHex(value) : fallback;
}

function frontmatterFont(typography: ParsedFrontmatter["typography"], roles: string[]) {
  for (const role of roles) {
    const fontFamily = typography[role]?.fontFamily;
    if (fontFamily) return fontFamily;
  }
  return "";
}

function tokenLengthToPx(value?: string) {
  if (!value) return null;
  const px = value.match(/^(-?\d+(?:\.\d+)?)px$/i);
  if (px) return Number.parseFloat(px[1]);
  const rem = value.match(/^(-?\d+(?:\.\d+)?)rem$/i);
  if (rem) return Number.parseFloat(rem[1]) * 16;
  return null;
}

function radiusFromToken(value?: string) {
  const px = tokenLengthToPx(value);
  return px === null ? null : radiusFromValues([px]);
}

function deriveDescription(title: string, themeSection: string) {
  const paragraph = firstParagraph(themeSection);
  if (paragraph) return paragraph;
  return `${title} focuses on strong component clarity, expressive hierarchy, and reusable design tokens.`;
}

function generatedThemeParagraph(spec: DesignSpec) {
  const accentText = luminance(spec.colors.accent) > 0.18 ? "#10151d" : "#ffffff";
  const themeFlavor =
    spec.theme.themeMode === "dark"
      ? "dark-led system"
      : spec.theme.themeMode === "hybrid"
        ? "dual-surface system"
        : "light-led system";

  return `${spec.meta.title} is a ${themeFlavor} built around ${spec.theme.atmosphere.toLowerCase()}. The core canvas starts from \`${spec.colors.base}\`, surfaces land on \`${spec.colors.surface}\`, and the main accent \`${spec.colors.accent}\` is calibrated for strong interaction contrast with ${accentText === "#10151d" ? "dark" : "light"} foreground pairings.`;
}

function paletteToken(spec: DesignSpec, keywords: string[], fallback: string) {
  const entry = spec.colors.palette.find((item) => {
    const haystack = `${item.name} ${item.role} ${item.description}`.toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword));
  });
  return entry ? toHex(entry.value) : fallback;
}

function generatedFrontmatter(spec: DesignSpec) {
  const radius = RADIUS_VALUES[spec.shape.radius];
  const formRadius = FORM_RADIUS_VALUES[spec.shape.formRadius];
  const [displayType, sectionType, cardType, bodyType, captionType] = TYPOGRAPHY_SCALE[spec.typography.scalePreset];
  const base = toHex(spec.colors.base);
  const surface = toHex(spec.colors.surface);
  const accent = toHex(spec.colors.accent);
  const textPrimary = toHex(spec.colors.textPrimary);
  const textSecondary = toHex(spec.colors.textSecondary);
  const border = toHex(spec.colors.border);
  const isDark = spec.theme.themeMode === "dark" || luminance(base) < 0.35;
  const secondary = paletteToken(spec, ["secondary", "purple", "violet"], mix(accent, textPrimary, 0.28));
  const tertiary = paletteToken(spec, ["tertiary", "neutral", "silver", "gray"], mix(textSecondary, surface, 0.18));
  const error = "#ffb4ab";
  const onAccent = contrastText(accent, "#10151d", "#ffffff");

  return [
    "---",
    `name: ${yamlToken(spec.meta.title)}`,
    "colors:",
    `  surface: ${yamlToken(base)}`,
    `  surface-dim: ${yamlToken(isDark ? darken(base, 0.05) : darken(base, 0.08))}`,
    `  surface-bright: ${yamlToken(isDark ? lighten(base, 0.16) : lighten(base, 0.08))}`,
    `  surface-container-lowest: ${yamlToken(isDark ? darken(base, 0.1) : lighten(surface, 0.2))}`,
    `  surface-container-low: ${yamlToken(isDark ? lighten(base, 0.04) : darken(surface, 0.02))}`,
    `  surface-container: ${yamlToken(surface)}`,
    `  surface-container-high: ${yamlToken(isDark ? lighten(surface, 0.07) : darken(surface, 0.04))}`,
    `  surface-container-highest: ${yamlToken(isDark ? lighten(surface, 0.12) : darken(surface, 0.07))}`,
    `  on-surface: ${yamlToken(textPrimary)}`,
    `  on-surface-variant: ${yamlToken(textSecondary)}`,
    `  inverse-surface: ${yamlToken(isDark ? textPrimary : "#303030")}`,
    `  inverse-on-surface: ${yamlToken(isDark ? "#303030" : "#f8fbff")}`,
    `  outline: ${yamlToken(border)}`,
    `  outline-variant: ${yamlToken(isDark ? darken(border, 0.22) : lighten(border, 0.22))}`,
    `  surface-tint: ${yamlToken(accent)}`,
    `  primary: ${yamlToken(accent)}`,
    `  on-primary: ${yamlToken(onAccent)}`,
    `  primary-container: ${yamlToken(mix(accent, surface, isDark ? 0.18 : 0.28))}`,
    `  on-primary-container: ${yamlToken(contrastText(mix(accent, surface, isDark ? 0.18 : 0.28), "#10151d", "#ffffff"))}`,
    `  inverse-primary: ${yamlToken(darken(accent, 0.22))}`,
    `  secondary: ${yamlToken(secondary)}`,
    `  on-secondary: ${yamlToken(contrastText(secondary, "#10151d", "#ffffff"))}`,
    `  secondary-container: ${yamlToken(mix(secondary, surface, 0.22))}`,
    `  on-secondary-container: ${yamlToken(contrastText(mix(secondary, surface, 0.22), "#10151d", "#ffffff"))}`,
    `  tertiary: ${yamlToken(tertiary)}`,
    `  on-tertiary: ${yamlToken(contrastText(tertiary, "#10151d", "#ffffff"))}`,
    `  tertiary-container: ${yamlToken(mix(tertiary, surface, 0.2))}`,
    `  on-tertiary-container: ${yamlToken(contrastText(mix(tertiary, surface, 0.2), "#10151d", "#ffffff"))}`,
    `  error: ${yamlToken(error)}`,
    `  on-error: ${yamlToken("#690005")}`,
    `  error-container: ${yamlToken("#93000a")}`,
    `  on-error-container: ${yamlToken("#ffdad6")}`,
    `  primary-fixed: ${yamlToken(lighten(accent, 0.55))}`,
    `  primary-fixed-dim: ${yamlToken(lighten(accent, 0.28))}`,
    `  on-primary-fixed: ${yamlToken(contrastText(lighten(accent, 0.55), "#10151d", "#ffffff"))}`,
    `  on-primary-fixed-variant: ${yamlToken(darken(accent, 0.32))}`,
    `  secondary-fixed: ${yamlToken(lighten(secondary, 0.55))}`,
    `  secondary-fixed-dim: ${yamlToken(lighten(secondary, 0.28))}`,
    `  on-secondary-fixed: ${yamlToken(contrastText(lighten(secondary, 0.55), "#10151d", "#ffffff"))}`,
    `  on-secondary-fixed-variant: ${yamlToken(darken(secondary, 0.32))}`,
    `  tertiary-fixed: ${yamlToken(lighten(tertiary, 0.55))}`,
    `  tertiary-fixed-dim: ${yamlToken(lighten(tertiary, 0.28))}`,
    `  on-tertiary-fixed: ${yamlToken(contrastText(lighten(tertiary, 0.55), "#10151d", "#ffffff"))}`,
    `  on-tertiary-fixed-variant: ${yamlToken(darken(tertiary, 0.32))}`,
    `  background: ${yamlToken(base)}`,
    `  on-background: ${yamlToken(textPrimary)}`,
    `  surface-variant: ${yamlToken(isDark ? lighten(surface, 0.1) : darken(surface, 0.08))}`,
    "typography:",
    "  display:",
    `    fontFamily: ${yamlString(spec.typography.displayFont)}`,
    `    fontSize: ${displayType.size}`,
    `    fontWeight: '${displayType.weight}'`,
    `    lineHeight: '${displayType.lineHeight}'`,
    `    letterSpacing: ${displayType.letterSpacing}`,
    "  headline-lg:",
    `    fontFamily: ${yamlString(spec.typography.displayFont)}`,
    `    fontSize: ${sectionType.size}`,
    `    fontWeight: '${sectionType.weight}'`,
    `    lineHeight: '${sectionType.lineHeight}'`,
    `    letterSpacing: ${sectionType.letterSpacing}`,
    "  headline-md:",
    `    fontFamily: ${yamlString(spec.typography.displayFont)}`,
    `    fontSize: ${cardType.size}`,
    `    fontWeight: '${cardType.weight}'`,
    `    lineHeight: '${cardType.lineHeight}'`,
    `    letterSpacing: ${cardType.letterSpacing}`,
    "  body-lg:",
    `    fontFamily: ${yamlString(spec.typography.bodyFont)}`,
    `    fontSize: ${bodyType.size}`,
    `    fontWeight: '${bodyType.weight}'`,
    `    lineHeight: '${bodyType.lineHeight}'`,
    `    letterSpacing: ${bodyType.letterSpacing}`,
    "  body-sm:",
    `    fontFamily: ${yamlString(spec.typography.bodyFont)}`,
    `    fontSize: ${bodyType.size}`,
    `    fontWeight: '${bodyType.weight}'`,
    `    lineHeight: '${bodyType.lineHeight}'`,
    `    letterSpacing: ${bodyType.letterSpacing}`,
    "  label-caps:",
    `    fontFamily: ${yamlString(spec.typography.bodyFont)}`,
    `    fontSize: ${captionType.size}`,
    `    fontWeight: '${captionType.weight}'`,
    `    lineHeight: '${captionType.lineHeight}'`,
    `    letterSpacing: ${captionType.letterSpacing}`,
    "rounded:",
    `  sm: ${radius}`,
    `  DEFAULT: ${radius}`,
    `  md: ${formRadius}`,
    `  lg: ${FORM_RADIUS_VALUES["extra-large"]}`,
    `  xl: ${FORM_RADIUS_VALUES["extra-large"]}`,
    "  full: 9999px",
    "spacing:",
    "  base: 8px",
    "  xs: 4px",
    "  sm: 12px",
    "  md: 24px",
    "  lg: 48px",
    "  xl: 80px",
    "  container-max: 1200px",
    "  gutter: 24px",
    "---"
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
  const normalizedInput = normalizeMarkdown(markdown);
  const frontmatter = parseFrontmatter(normalizedInput);
  const normalized = stripYamlFrontmatter(normalizedInput);
  const title = metadata?.title || frontmatter.name || getTitle(normalized);
  const { mapped, misc } = extractSections(normalized);
  const themeSplit = stripImportedNotes(mapped.theme ?? "");
  const colorSplit = stripImportedNotes(mapped.colors ?? "");
  const typographySplit = stripImportedNotes(mapped.typography ?? "");
  const componentSplit = stripImportedNotes(mapped.components ?? "");
  const layoutSplit = stripImportedNotes(mapped.layout ?? "");
  const elevationSplit = stripImportedNotes(mapped.elevation ?? "");
  const shapesSplit = stripImportedNotes(mapped.shapes ?? "");
  const responsiveSplit = stripImportedNotes(mapped.responsive ?? "");
  const dosSplit = stripImportedNotes(mapped.dosDonts ?? "");
  const promptSplit = stripImportedNotes(mapped.agentPrompts ?? "");

  const palette = uniquePalette([...parsePalette(colorSplit.core), ...paletteFromFrontmatterColors(frontmatter.colors)]);
  const accent = frontmatterColor(
    frontmatter.colors,
    ["primary", "primary-container", "surface-tint"],
    choosePaletteValue(
      palette,
      ["accent", "brand", "cta", "coral", "terracotta", "primary accent"],
      DEFAULT_SPEC.colors.accent
    )
  );
  const base = frontmatterColor(
    frontmatter.colors,
    ["background", "surface", "surface-container-lowest"],
    choosePaletteValue(
      palette,
      ["page background", "canvas", "background", "parchment", "void black"],
      DEFAULT_SPEC.colors.base,
      (entry) => !/(text|border|ring)/i.test(`${entry.name} ${entry.description}`)
    )
  );
  const surface = frontmatterColor(
    frontmatter.colors,
    ["surface-container", "surface", "surface-container-low"],
    choosePaletteValue(
      palette,
      ["surface", "card", "container", "elevated", "ivory", "white surface"],
      DEFAULT_SPEC.colors.surface
    )
  );
  const textPrimary = frontmatterColor(
    frontmatter.colors,
    ["on-surface", "on-background"],
    choosePaletteValue(
      palette,
      ["primary text", "heading text", "foreground", "near black", "pure white"],
      DEFAULT_SPEC.colors.textPrimary,
      (entry) => /(text|white|black|foreground)/i.test(`${entry.name} ${entry.description}`)
    )
  );
  const textSecondary = frontmatterColor(
    frontmatter.colors,
    ["on-surface-variant"],
    choosePaletteValue(
      palette,
      ["secondary text", "body text", "muted", "tertiary text", "olive gray"],
      DEFAULT_SPEC.colors.textSecondary,
      (entry) => /(text|gray|muted|silver|secondary)/i.test(`${entry.name} ${entry.description}`)
    )
  );
  const border = frontmatterColor(
    frontmatter.colors,
    ["outline", "outline-variant"],
    choosePaletteValue(
      palette,
      ["border", "divider", "ring", "outline"],
      DEFAULT_SPEC.colors.border,
      (entry) => /(border|ring|divider)/i.test(`${entry.name} ${entry.description}`)
    )
  );

  const displayFont =
    frontmatterFont(frontmatter.typography, ["display", "headline-lg", "headline-md"]) ||
    findFont(typographySplit.core, "Display") ||
    findFont(typographySplit.core, "Headline") ||
    DEFAULT_SPEC.typography.displayFont;
  const bodyFont =
    frontmatterFont(frontmatter.typography, ["body-lg", "body-sm"]) ||
    findFont(typographySplit.core, "Body / UI") ||
    findFont(typographySplit.core, "Body/UI") ||
    findFont(typographySplit.core, "Body") ||
    DEFAULT_SPEC.typography.bodyFont;
  const monoFont = findFont(typographySplit.core, "Monospace") || findFont(typographySplit.core, "Code") || DEFAULT_SPEC.typography.monoFont;

  const themeMode = detectThemeMode(themeSplit.core, base);
  const radiusSection = `${shapesSplit.core}\n${layoutSplit.core}\n${componentSplit.core}`;
  const structuredRadiusPair = detectStructuredRadiusPair(radiusSection);
  const frontmatterRadius = radiusFromToken(frontmatter.rounded.DEFAULT ?? frontmatter.rounded.md ?? frontmatter.rounded.sm);
  const frontmatterFormRadius = radiusFromToken(frontmatter.rounded.md ?? frontmatter.rounded.DEFAULT ?? frontmatter.rounded.sm);
  const radius =
    structuredRadiusPair?.radius ??
    frontmatterRadius ??
    detectRadiusFromKeywords(radiusSection, ["core radius", "general components", "overall ui", "menus and modals"]) ??
    detectRadius(radiusSection, DEFAULT_SPEC.shape.radius);
  const inputSection = componentSplit.core.match(/###\s+Inputs[\s\S]*?(?=###|$)/i)?.[0] ?? componentSplit.core;
  const formRadius =
    structuredRadiusPair?.formRadius ??
    frontmatterFormRadius ??
    detectRadiusFromKeywords(inputSection, ["form radius", "form controls", "form elements", "inputs", "selects"]) ??
    detectRadius(inputSection, radius);
  const density = detectDensity(layoutSplit.core);
  const elevation = detectElevation(elevationSplit.core);

  const warnings: string[] = [];
  for (const section of SECTION_TITLES.filter((item) => ["theme", "colors", "typography", "components", "layout", "elevation", "shapes"].includes(item.id))) {
    if (!mapped[section.id]) {
      warnings.push(`Missing section: ${section.title}`);
    }
  }
  if (!palette.length) warnings.push("No structured color tokens were detected. The studio is using safe defaults.");
  if (!frontmatterFont(frontmatter.typography, ["display", "headline-lg", "headline-md"]) && !findFont(typographySplit.core, "Headline") && !findFont(typographySplit.core, "Display")) {
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
        shapes: shapesSplit.imported || shapesSplit.core,
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

function stitchSection(imported: string | undefined, generated: string) {
  return imported?.trim() || generated.trim();
}

function generatedStitchColors(spec: DesignSpec) {
  const references = spec.colors.palette.length
    ? `\n\nToken references: ${spec.colors.palette
        .slice(0, 8)
        .map((entry) => `${entry.name} ${entry.value}`)
        .join(", ")}.`
    : "";

  return [
    `The palette is anchored by \`${spec.colors.base}\` as the page background and \`${spec.colors.surface}\` as the main component surface.`,
    "",
    `- **Primary & Secondary:** \`${spec.colors.accent}\` drives primary actions, selected states, and the strongest brand moments.`,
    `- **Neutrals:** \`${spec.colors.textPrimary}\` is used for high-emphasis copy, while \`${spec.colors.textSecondary}\` supports body text, helper text, and metadata.`,
    `- **Surface Logic:** \`${spec.colors.border}\` defines dividers and containment so cards, inputs, and panels remain readable across generated drafts.${references}`
  ].join("\n");
}

function generatedStitchTypography(spec: DesignSpec) {
  return [
    `This system uses **${spec.typography.displayFont}** for display and headline moments, with **${spec.typography.bodyFont}** for interface copy.`,
    "",
    `The hierarchy follows a ${SCALE_PRESET_LABELS[spec.typography.scalePreset].toLowerCase()} scale. Large headings should carry the main product promise, while body copy stays compact enough for product screens and generated drafts. Labels use uppercase styling sparingly for metadata, tabs, and small control groups.`
  ].join("\n");
}

function generatedStitchLayout(spec: DesignSpec) {
  return [
    `The layout uses a ${spec.layout.density} density preset: ${DENSITY_COPY[spec.layout.density]}`,
    "",
    "Spacing should stay on an 8px-based rhythm. Major sections receive larger vertical gaps, while component groups use smaller repeated spacing so the same style can be compared across landing pages, dashboards, and tool surfaces."
  ].join("\n");
}

function generatedStitchElevation(spec: DesignSpec) {
  return [
    `Depth follows the **${spec.elevation.preset}** preset: ${ELEVATION_COPY[spec.elevation.preset]}`,
    "",
    "Use elevation to clarify hierarchy, not to decorate every element. Primary panels, popovers, and selected cards can receive stronger separation; routine list rows and control groups should stay quieter."
  ].join("\n");
}

function generatedStitchShapes(spec: DesignSpec) {
  return [
    `The shape language uses \`${RADIUS_VALUES[spec.shape.radius]}\` for core components and \`${FORM_RADIUS_VALUES[spec.shape.formRadius]}\` for form controls.`,
    "",
    "Full-radius pills are reserved for compact buttons, chips, badges, and circular icon controls. Large containers should keep the same radius family so generated screens feel like one coherent system."
  ].join("\n");
}

function generatedStitchComponents(spec: DesignSpec) {
  return [
    "### Buttons",
    `Primary buttons use \`${spec.colors.accent}\` with high-contrast text. Secondary buttons stay neutral, using surface fills and border definition rather than a competing color.`,
    "",
    "### Cards",
    `Cards use \`${spec.colors.surface}\` over the page background with \`${spec.colors.border}\` for containment and the ${spec.elevation.preset} elevation preset for hierarchy.`,
    "",
    "### Input Fields",
    `Inputs use \`${FORM_RADIUS_VALUES[spec.shape.formRadius]}\` radius, neutral fills, and accent-colored focus states. Field chrome should stay quiet until interaction.`,
    "",
    "### Chips & Badges",
    "Chips and badges are compact, pill-shaped elements used for status, filters, and metadata. They should feel secondary to primary actions.",
    "",
    "### Lists",
    "List rows use subtle dividers and restrained hover states. Dense screens should preserve scanability through alignment, spacing, and consistent row height."
  ].join("\n");
}

export function serializeDesignMd(spec: DesignSpec) {
  const sections = [
    generatedFrontmatter(spec),
    "",
    "## Brand & Style",
    "",
    stitchSection(spec.notes.importedSections.theme, generatedThemeParagraph(spec)),
    "",
    "## Colors",
    "",
    stitchSection(spec.notes.importedSections.colors, generatedStitchColors(spec)),
    "",
    "## Typography",
    "",
    stitchSection(spec.notes.importedSections.typography, generatedStitchTypography(spec)),
    "",
    "## Layout & Spacing",
    "",
    stitchSection(spec.notes.importedSections.layout, generatedStitchLayout(spec)),
    "",
    "## Elevation & Depth",
    "",
    stitchSection(spec.notes.importedSections.elevation, generatedStitchElevation(spec)),
    "",
    "## Shapes",
    "",
    stitchSection(spec.notes.importedSections.shapes, generatedStitchShapes(spec)),
    "",
    "## Components",
    "",
    stitchSection(spec.notes.importedSections.components, generatedStitchComponents(spec))
  ];

  if (spec.notes.misc.length) {
    sections.push("", "## Appendix", "", spec.notes.misc.join("\n\n"));
  }

  return sections.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
