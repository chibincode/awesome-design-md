import type {
  DensityPreset,
  ElevationPreset,
  FontBundle,
  FontOption,
  RadiusPreset,
  ScalePreset,
  ThemePreset
} from "../types/design";

export const FONT_OPTIONS: FontOption[] = [
  { label: "Inter", value: "Inter", css: '"Inter", sans-serif' },
  { label: "Figtree", value: "Figtree", css: '"Figtree", sans-serif' },
  { label: "Hanken Grotesk", value: "Hanken Grotesk", css: '"Hanken Grotesk", sans-serif' },
  { label: "Geist", value: "Geist", css: '"Geist", sans-serif' },
  { label: "DM Sans", value: "DM Sans", css: '"DM Sans", sans-serif' },
  { label: "Public Sans", value: "Public Sans", css: '"Public Sans", sans-serif' },
  { label: "Google Sans", value: "Google Sans", css: '"Google Sans", sans-serif' },
  { label: "Bricolage Grotesque", value: "Bricolage Grotesque", css: '"Bricolage Grotesque", sans-serif' },
  { label: "Varela Round", value: "Varela Round", css: '"Varela Round", sans-serif' },
  { label: "Fraunces", value: "Fraunces", css: '"Fraunces", Georgia, serif' },
  { label: "IBM Plex Mono", value: "IBM Plex Mono", css: '"IBM Plex Mono", monospace' },
  { label: "Fredoka", value: "Fredoka", css: '"Fredoka", sans-serif' },
  { label: "JetBrains Mono", value: "JetBrains Mono", css: '"JetBrains Mono", monospace' },
  { label: "Instrument Sans", value: "Instrument Sans", css: '"Instrument Sans", sans-serif' },
  { label: "Manrope", value: "Manrope", css: '"Manrope", "IBM Plex Sans", sans-serif' },
  { label: "Newsreader", value: "Newsreader", css: '"Newsreader", Georgia, serif' },
  { label: "IBM Plex Sans", value: "IBM Plex Sans", css: '"IBM Plex Sans", sans-serif' },
  { label: "Sora", value: "Sora", css: '"Sora", "IBM Plex Sans", sans-serif' },
  { label: "Azeret Mono", value: "Azeret Mono", css: '"Azeret Mono", "IBM Plex Mono", monospace' },
  { label: "Anthropic Serif", value: "Anthropic Serif", css: '"Anthropic Serif", Georgia, serif' },
  { label: "Anthropic Sans", value: "Anthropic Sans", css: '"Anthropic Sans", "IBM Plex Sans", sans-serif' },
  { label: "GT Walsheim", value: "GT Walsheim", css: '"GT Walsheim", "Sora", sans-serif' }
];

export const DOCK_FONT_OPTIONS = [
  "Inter",
  "Figtree",
  "Hanken Grotesk",
  "Geist",
  "DM Sans",
  "Public Sans",
  "Google Sans",
  "Bricolage Grotesque",
  "Varela Round",
  "Fraunces",
  "IBM Plex Mono",
  "Fredoka",
  "JetBrains Mono",
  "Instrument Sans"
] as const;

export const THEME_PRESET_OPTIONS: Array<{ id: ThemePreset; label: string }> = [
  { id: "default", label: "Default" },
  { id: "sky", label: "Sky" },
  { id: "lavender", label: "Lavender" },
  { id: "mint", label: "Mint" },
  { id: "netflix", label: "Netflix" },
  { id: "uber", label: "Uber" },
  { id: "spotify", label: "Spotify" },
  { id: "coinbase", label: "Coinbase" },
  { id: "airbnb", label: "Airbnb" },
  { id: "discord", label: "Discord" },
  { id: "rabbit", label: "Rabbit" }
];

export const THEME_PRESET_TINTS: Record<ThemePreset, string> = {
  default: "#ffffff",
  sky: "#7dd3fc",
  lavender: "#c4b5fd",
  mint: "#6ee7b7",
  netflix: "#ef4444",
  uber: "#111827",
  spotify: "#22c55e",
  coinbase: "#2563eb",
  airbnb: "#fb7185",
  discord: "#818cf8",
  rabbit: "#f59e0b"
};

export const THEME_PRESET_BASES: Record<ThemePreset, number> = {
  default: 0.0015,
  sky: 0.0015,
  lavender: 0.0015,
  mint: 0.0015,
  netflix: 0,
  uber: 0,
  spotify: 0.002,
  coinbase: 0.002,
  airbnb: 0,
  discord: 0.01,
  rabbit: 0.01
};

export const FONT_BUNDLES: FontBundle[] = [
  {
    id: "studio-modern",
    label: "Studio Modern",
    displayFont: "Manrope",
    bodyFont: "IBM Plex Sans",
    monoFont: "IBM Plex Mono"
  },
  {
    id: "editorial-soft",
    label: "Editorial Soft",
    displayFont: "Newsreader",
    bodyFont: "IBM Plex Sans",
    monoFont: "IBM Plex Mono"
  },
  {
    id: "product-sharp",
    label: "Product Sharp",
    displayFont: "Sora",
    bodyFont: "Inter",
    monoFont: "Azeret Mono"
  },
  {
    id: "framer-lean",
    label: "Framer Lean",
    displayFont: "GT Walsheim",
    bodyFont: "Inter",
    monoFont: "Azeret Mono"
  }
];

export function resolveFontBundle(input: {
  displayFont: string;
  bodyFont: string;
  monoFont: string;
}) {
  const exactMatch = FONT_BUNDLES.find(
    (bundle) =>
      bundle.displayFont === input.displayFont &&
      bundle.bodyFont === input.bodyFont &&
      bundle.monoFont === input.monoFont
  );
  if (exactMatch) return exactMatch;

  const displayAndBody = FONT_BUNDLES.find(
    (bundle) =>
      bundle.displayFont === input.displayFont &&
      bundle.bodyFont === input.bodyFont
  );
  if (displayAndBody) return displayAndBody;

  const bodyOnly = FONT_BUNDLES.find((bundle) => bundle.bodyFont === input.bodyFont);
  return bodyOnly ?? FONT_BUNDLES[0];
}

export const RADIUS_VALUES: Record<RadiusPreset, string> = {
  none: "0px",
  "extra-small": "2px",
  small: "4px",
  medium: "8px",
  large: "12px",
  "extra-large": "16px"
};

export const FORM_RADIUS_VALUES: Record<RadiusPreset, string> = {
  none: "0px",
  "extra-small": "2px",
  small: "4px",
  medium: "8px",
  large: "12px",
  "extra-large": "16px"
};

export const DENSITY_COPY: Record<DensityPreset, string> = {
  compact: "Tighter pacing, smaller vertical gaps, and denser groupings for dashboards and tool-heavy interfaces.",
  comfortable: "Balanced spacing that keeps UI crisp without feeling compressed.",
  spacious: "Generous section rhythm, larger card gutters, and more breathing room around content."
};

export const ELEVATION_COPY: Record<ElevationPreset, string> = {
  flat: "Relies on contrast and borders rather than shadows. Best for quiet, editorial systems.",
  soft: "Uses low-contrast ambient shadows and blurred edges for calm separation.",
  ring: "Uses ring outlines and soft glows to create precision without heavy weight.",
  dramatic: "Uses deeper shadow stacks and stronger separation for showcase moments."
};

export const SCALE_PRESET_LABELS: Record<ScalePreset, string> = {
  editorial: "Editorial",
  balanced: "Balanced",
  product: "Product"
};

export const TYPOGRAPHY_SCALE: Record<
  ScalePreset,
  Array<{ role: string; size: string; weight: string; lineHeight: string; letterSpacing: string }>
> = {
  editorial: [
    { role: "Display Hero", size: "68px", weight: "600", lineHeight: "1.02", letterSpacing: "-0.04em" },
    { role: "Section Heading", size: "44px", weight: "600", lineHeight: "1.08", letterSpacing: "-0.03em" },
    { role: "Card Title", size: "26px", weight: "600", lineHeight: "1.15", letterSpacing: "-0.02em" },
    { role: "Body", size: "17px", weight: "400", lineHeight: "1.7", letterSpacing: "normal" },
    { role: "Caption", size: "13px", weight: "500", lineHeight: "1.5", letterSpacing: "0.01em" }
  ],
  balanced: [
    { role: "Display Hero", size: "60px", weight: "700", lineHeight: "0.98", letterSpacing: "-0.05em" },
    { role: "Section Heading", size: "38px", weight: "700", lineHeight: "1.05", letterSpacing: "-0.04em" },
    { role: "Card Title", size: "22px", weight: "600", lineHeight: "1.2", letterSpacing: "-0.02em" },
    { role: "Body", size: "16px", weight: "400", lineHeight: "1.6", letterSpacing: "normal" },
    { role: "Caption", size: "12px", weight: "500", lineHeight: "1.4", letterSpacing: "0.02em" }
  ],
  product: [
    { role: "Display Hero", size: "56px", weight: "700", lineHeight: "0.96", letterSpacing: "-0.05em" },
    { role: "Section Heading", size: "34px", weight: "700", lineHeight: "1.03", letterSpacing: "-0.03em" },
    { role: "Card Title", size: "20px", weight: "600", lineHeight: "1.18", letterSpacing: "-0.015em" },
    { role: "Body", size: "15px", weight: "400", lineHeight: "1.55", letterSpacing: "normal" },
    { role: "Caption", size: "12px", weight: "500", lineHeight: "1.35", letterSpacing: "0.02em" }
  ]
};

export function getFontCss(fontName: string) {
  return FONT_OPTIONS.find((option) => option.value === fontName)?.css ?? `"${fontName}", sans-serif`;
}
