import { useState } from "react";
import type { SampleDesignPack } from "../types/design";

interface SampleBrowserProps {
  open: boolean;
  packs: SampleDesignPack[];
  onClose: () => void;
  onSelect: (pack: SampleDesignPack) => void;
}

export function SampleBrowser({ open, packs, onClose, onSelect }: SampleBrowserProps) {
  const [query, setQuery] = useState("");

  if (!open) return null;

  const visible = packs.filter((pack) => {
    const haystack = `${pack.name} ${pack.slug}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal__header">
          <div>
            <p className="eyebrow">Sample import</p>
            <h2>Load a design pack from the library</h2>
          </div>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="modal__toolbar">
          <input
            className="studio-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by brand or slug"
          />
        </div>

        <div className="sample-grid">
          {visible.map((pack) => (
            <button key={pack.slug} type="button" className="sample-card" onClick={() => onSelect(pack)}>
              <span className="sample-card__eyebrow">{pack.slug}</span>
              <strong>{pack.name}</strong>
              <span>{pack.fileName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
