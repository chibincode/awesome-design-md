import type { SampleDesignPack } from "../types/design";

const modules = import.meta.glob("../../../design-md/*/DESIGN.md", {
  query: "?raw",
  import: "default"
});

function humanize(slug: string) {
  return slug
    .replace(/\.(app|ai)$/i, (_, suffix) => ` ${suffix.toUpperCase()}`)
    .replace(/[-_.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const SAMPLE_PACKS: SampleDesignPack[] = Object.entries(modules)
  .map(([path, loader]) => {
    const slug = path.match(/design-md\/([^/]+)\//)?.[1] ?? path;
    return {
      slug,
      name: humanize(slug),
      fileName: `${slug}/DESIGN.md`,
      load: () => loader() as Promise<string>
    };
  })
  .sort((left, right) => left.name.localeCompare(right.name));
