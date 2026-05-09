import { useState, type CSSProperties } from "react";
import avatarJohn from "../assets/avatars/avatar-john.png";
import avatarKate from "../assets/avatars/avatar-kate.png";
import avatarMaya from "../assets/avatars/avatar-maya.png";
import avatarNoah from "../assets/avatars/avatar-noah.png";
import avatarSara from "../assets/avatars/avatar-sara.png";
import { previewThemeVars } from "../lib/previewTheme";
import type {
  DesignFlowStep,
  DesignSpec,
  GeneratedComponent,
  GeneratedDraft,
  GeneratedScreen,
  PreviewMode,
  PreviewSceneId,
  ThemePreset
} from "../types/design";

interface CanvasPreviewProps {
  spec: DesignSpec;
  generatedDrafts: GeneratedDraft[];
  flowStep: DesignFlowStep;
  activeScene: PreviewSceneId;
  previewMode: PreviewMode;
  themePreset: ThemePreset;
  baseTone: number;
  onSceneChange: (scene: PreviewSceneId) => void;
  onBackToStyle: () => void;
}

const CLASSIC_SCENES: Array<{ id: PreviewSceneId; label: string }> = [
  { id: "landing", label: "Landing" },
  { id: "dashboard", label: "Dashboard" },
  { id: "components", label: "Components" }
];

const TEAM_AVATARS = [
  { name: "Maya Chen", src: avatarMaya },
  { name: "Kate Moore", src: avatarKate },
  { name: "John Smith", src: avatarJohn },
  { name: "Sara Johnson", src: avatarSara },
  { name: "Noah Park", src: avatarNoah }
];

export function CanvasPreview({
  spec,
  generatedDrafts,
  flowStep,
  activeScene,
  previewMode,
  themePreset,
  baseTone,
  onSceneChange,
  onBackToStyle
}: CanvasPreviewProps) {
  const vars = previewThemeVars(spec, previewMode, themePreset, baseTone);
  const isStyleLab = flowStep === "style";

  return (
    <section className="canvas-shell">
      <div className="canvas-shell__top">
        <div className="canvas-shell__brand">
          <h2>{isStyleLab ? "Style Preview" : "Generation Canvas"}</h2>
          <p>
            {isStyleLab
              ? "Use fixed scenes to compare visual systems without changing the content."
              : "Generated drafts stay on the canvas so you can compare directions side by side."}
          </p>
        </div>
        {isStyleLab ? (
          <div className="top-tabs" aria-label="Classic preview scenes">
            {CLASSIC_SCENES.map((scene) => (
              <button
                key={scene.id}
                type="button"
                className={activeScene === scene.id ? "is-active" : ""}
                onClick={() => onSceneChange(scene.id)}
              >
                {scene.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="canvas-shell__meta">
            <span>Using {spec.meta.title}</span>
            <button type="button" className="canvas-shell__meta-action" onClick={onBackToStyle}>
              Back to style
            </button>
          </div>
        )}
      </div>

      <div className="theme-board" style={vars}>
        <div className="theme-board__canvas">
          {activeScene === "components" ? <ComponentsScene spec={spec} /> : null}
          {activeScene === "dashboard" ? <DashboardScene spec={spec} /> : null}
          {activeScene === "landing" ? <LandingScene spec={spec} /> : null}
          {activeScene === "generated" ? (
            <GeneratedCanvasScene drafts={generatedDrafts} previewMode={previewMode} themePreset={themePreset} />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function GeneratedCanvasScene({
  drafts,
  previewMode,
  themePreset
}: {
  drafts: GeneratedDraft[];
  previewMode: PreviewMode;
  themePreset: ThemePreset;
}) {
  const [zoom, setZoom] = useState(1);
  const zoomPercent = Math.round(zoom * 100);

  function updateZoom(next: number) {
    setZoom(Math.min(1.4, Math.max(0.55, next)));
  }

  return (
    <div className="generated-canvas">
      <div className="generated-canvas__toolbar" aria-label="Canvas zoom controls">
        <span>{drafts.length === 0 ? "No drafts yet" : `${drafts.length} draft${drafts.length === 1 ? "" : "s"}`}</span>
        <div>
          <button type="button" onClick={() => updateZoom(zoom - 0.1)} aria-label="Zoom out">
            -
          </button>
          <strong>{zoomPercent}%</strong>
          <button type="button" onClick={() => updateZoom(zoom + 0.1)} aria-label="Zoom in">
            +
          </button>
          <button type="button" onClick={() => updateZoom(1)}>
            Reset
          </button>
        </div>
      </div>

      <div className="generated-canvas__viewport">
        {drafts.length === 0 ? (
          <div className="generated-canvas__empty">
            <strong>No generated drafts yet</strong>
            <span>Fill the brief, then click Generate draft. New drafts will appear here for side-by-side review.</span>
          </div>
        ) : (
          <div
            className="generated-canvas__rail"
            aria-label="Generated draft canvas"
            style={{ "--generated-zoom": String(zoom) } as CSSProperties}
          >
            {drafts.map((draft) => (
              <article
                key={draft.id}
                className="generated-draft-card"
                style={previewThemeVars(draft.spec, previewMode, themePreset, draft.baseTone)}
              >
                <header className="generated-draft-card__header">
                  <div>
                    <span>{draft.label}</span>
                    <strong>{draft.screen.pageType}</strong>
                  </div>
                  <em>{draft.spec.meta.title}</em>
                </header>
                <div className="generated-draft-card__frame">
                  <GeneratedScene spec={draft.spec} screen={draft.screen} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GeneratedScene({ spec, screen }: { spec: DesignSpec; screen: GeneratedScreen }) {
  const heroComponents = screen.sections[0]?.components ?? [];
  const supportingSections = screen.sections.slice(1);

  return (
    <div className={`generated-screen generated-screen--${screen.pageType}`}>
      <section className="generated-hero">
        <div className="generated-hero__copy">
          <span className="landing-kicker">AI generated draft</span>
          <h3>{screen.title}</h3>
          <p>{screen.subtitle}</p>
          <div className="landing-cta-row">
            <button type="button" className="canvas-button canvas-button--primary">
              {screen.primaryAction}
            </button>
            <button type="button" className="canvas-button">
              {screen.secondaryAction}
            </button>
          </div>
        </div>

        <div className="generated-hero__panel">
          <div className="generated-meta-card">
            <span>Audience</span>
            <strong>{screen.audience}</strong>
          </div>
          <div className="generated-meta-card">
            <span>Style memory</span>
            <strong>{spec.meta.title}</strong>
          </div>
          <div className="generated-meta-card generated-meta-card--wide">
            <span>Layout intent</span>
            <strong>{screen.layoutIntent}</strong>
          </div>
        </div>
      </section>

      <section className="generated-component-grid">
        {heroComponents.map((component) => (
          <GeneratedComponentCard key={component.label} component={component} />
        ))}
      </section>

      {supportingSections.map((section) => (
        <section key={section.id} className="generated-section">
          <div className="generated-section__copy">
            <span className="landing-kicker">{section.kicker}</span>
            <h4>{section.title}</h4>
            <p>{section.body}</p>
          </div>
          <div className="generated-section__components">
            {section.components.map((component) => (
              <GeneratedComponentCard key={component.label} component={component} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function GeneratedComponentCard({ component }: { component: GeneratedComponent }) {
  return (
    <article className={`generated-component-card generated-component-card--${component.kind}`}>
      <span>{component.kind}</span>
      <strong>{component.label}</strong>
      <p>{component.body}</p>
    </article>
  );
}

function ComponentsScene({ spec }: { spec: DesignSpec }) {
  const scaleCards = [
    ["Primary", spec.colors.accent, "Action color"],
    ["Base", spec.colors.base, "Neutral system"],
    ["Surface", spec.colors.surface, "Card canvas"]
  ];

  return (
    <div className="sample-page sample-page--components">
      <section className="sample-components-hero">
        <div className="sample-stack">
          <span className="sample-kicker">Component benchmark</span>
          <h3>Theme-ready interface kit</h3>
          <p>
            A fixed component surface for judging buttons, forms, density, cards, avatars, and state treatment from the
            current design.md.
          </p>
        </div>
        <div className="sample-token-strip">
          {scaleCards.map(([label, value, helper]) => (
            <article key={label} className="sample-token">
              <span style={{ background: value }} />
              <div>
                <strong>{label}</strong>
                <small>{helper}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sample-component-grid">
        <article className="sample-card sample-card--controls">
          <header className="sample-card-header">
            <div>
              <span className="sample-kicker">Controls</span>
              <strong>Creation settings</strong>
            </div>
            <span className="sample-status-dot" />
          </header>

          <label className="sample-field">
            Project name
            <input placeholder="Launch system" />
          </label>
          <label className="sample-field">
            Audience
            <select defaultValue="Product teams">
              <option>Product teams</option>
              <option>Design systems</option>
            </select>
          </label>

          <div className="sample-segmented" aria-label="Preview density">
            <button type="button" className="is-active">
              Compact
            </button>
            <button type="button">Comfort</button>
            <button type="button">Spacious</button>
          </div>

          <div className="sample-slider">
            <div>
              <strong>Similarity</strong>
              <span>72%</span>
            </div>
            <i />
          </div>
        </article>

        <article className="sample-card sample-card--actions">
          <header className="sample-card-header">
            <div>
              <span className="sample-kicker">Actions</span>
              <strong>Button language</strong>
            </div>
          </header>
          <button type="button" className="canvas-button canvas-button--primary canvas-button--wide">
            Generate theme
          </button>
          <button type="button" className="canvas-button canvas-button--wide">
            Preview sample UI
          </button>
          <button type="button" className="canvas-button canvas-button--ghost canvas-button--wide">
            Export DESIGN.md
          </button>
          <div className="sample-action-note">
            <strong>{spec.elevation.preset}</strong>
            <span>Elevation preset applied to every card.</span>
          </div>
        </article>

        <article className="sample-card sample-card--profile">
          <header className="sample-card-header">
            <div>
              <span className="sample-kicker">People</span>
              <strong>Review queue</strong>
            </div>
            <span className="sample-badge">5 online</span>
          </header>
          <div className="sample-avatar-row">
            {TEAM_AVATARS.map((avatar) => (
              <img key={avatar.name} src={avatar.src} alt={`${avatar.name} avatar`} />
            ))}
          </div>
          <div className="sample-message">
            <img src={TEAM_AVATARS[0].src} alt={`${TEAM_AVATARS[0].name} avatar`} />
            <div>
              <strong>Maya Chen</strong>
              <p>The current radius and base tone feel ready for dashboard screens.</p>
            </div>
          </div>
        </article>

        <article className="sample-card sample-card--metrics">
          <header className="sample-card-header">
            <div>
              <span className="sample-kicker">Tokens</span>
              <strong>Design DNA</strong>
            </div>
          </header>
          <div className="sample-metric-list">
            <span>
              <b>{spec.shape.radius}</b>
              Radius
            </span>
            <span>
              <b>{spec.layout.density}</b>
              Density
            </span>
            <span>
              <b>{spec.typography.scalePreset}</b>
              Type scale
            </span>
          </div>
        </article>

        <article className="sample-card sample-card--table">
          <header className="sample-card-header">
            <div>
              <span className="sample-kicker">States</span>
              <strong>Theme checks</strong>
            </div>
            <button type="button" className="canvas-button">
              View all
            </button>
          </header>
          {[
            ["Hero contrast", "Ready", "96"],
            ["Form surface", "Review", "82"],
            ["Chart accent", "Ready", "91"]
          ].map(([name, state, score]) => (
            <div key={name} className="sample-check-row">
              <span>{name}</span>
              <b>{state}</b>
              <strong>{score}</strong>
            </div>
          ))}
        </article>
      </section>
    </div>
  );
}

function DashboardScene({ spec }: { spec: DesignSpec }) {
  return (
    <div className="sample-app sample-app--dashboard" aria-label={`${spec.meta.title} dashboard benchmark`}>
      <aside className="sample-sidebar">
        <div className="sample-sidebar-brand">
          <span className="sample-mark" aria-hidden="true" />
          <div>
            <strong>Northstar</strong>
            <span>Operations</span>
          </div>
        </div>

        <nav className="sample-sidebar-nav" aria-label="Dashboard navigation">
          {["Overview", "Campaigns", "Customers", "Reports", "Settings"].map((item, index) => (
            <button key={item} type="button" className={index === 0 ? "is-active" : ""}>
              <span>{item}</span>
              {index === 1 ? <b>12</b> : null}
            </button>
          ))}
        </nav>

        <div className="sample-sidebar-profile">
          <img src={TEAM_AVATARS[1].src} alt={`${TEAM_AVATARS[1].name} avatar`} />
          <div>
            <strong>Kate Moore</strong>
            <span>Design ops lead</span>
          </div>
        </div>
      </aside>

      <main className="sample-dashboard-main">
        <header className="sample-dashboard-header">
          <div>
            <span className="sample-kicker">Benchmark dashboard</span>
            <h3>Launch health</h3>
            <p>Use this screen to judge product density, information hierarchy, tables, charts, and accent usage.</p>
          </div>
          <div className="sample-dashboard-actions">
            <div className="sample-segmented">
              <button type="button" className="is-active">
                Week
              </button>
              <button type="button">Month</button>
              <button type="button">Quarter</button>
            </div>
            <button type="button" className="canvas-button canvas-button--primary">
              Export
            </button>
          </div>
        </header>

        <section className="sample-kpi-row">
          {[
            ["Revenue", "$248.9k", "+12.4%"],
            ["Activation", "64.8%", "+8.1%"],
            ["Pipeline", "1,284", "+18.6%"],
            ["Open risk", "7", "-3.2%"]
          ].map(([label, value, delta]) => (
            <article key={label} className="sample-card sample-kpi">
              <span>{label}</span>
              <strong>{value}</strong>
              <em className={delta.startsWith("-") ? "is-negative" : "is-positive"}>{delta}</em>
            </article>
          ))}
        </section>

        <section className="sample-dashboard-grid">
          <article className="sample-card sample-chart-card">
            <header className="sample-card-header">
              <div>
                <span className="sample-kicker">Performance</span>
                <strong>Conversion trend</strong>
              </div>
              <span className="sample-badge">Live</span>
            </header>
            <svg className="sample-line-chart" viewBox="0 0 560 220" aria-hidden="true">
              <path d="M12 176 L70 132 L128 152 L186 88 L244 112 L302 72 L360 112 L418 84 L476 92 L548 44" />
              <path d="M12 190 L70 164 L128 172 L186 138 L244 148 L302 124 L360 146 L418 118 L476 136 L548 104" />
              <circle cx="548" cy="44" r="7" />
            </svg>
            <div className="sample-chart-axis">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </article>

          <article className="sample-card sample-review-card">
            <header className="sample-card-header">
              <div>
                <span className="sample-kicker">Approvals</span>
                <strong>Review queue</strong>
              </div>
              <button type="button" className="canvas-button">
                Open
              </button>
            </header>
            {[
              { avatar: TEAM_AVATARS[0], name: "Maya Chen", task: "Hero copy and pricing cards" },
              { avatar: TEAM_AVATARS[2], name: "John Smith", task: "Checkout state language" },
              { avatar: TEAM_AVATARS[3], name: "Sara Johnson", task: "Dashboard card density" }
            ].map(({ avatar, name, task }) => (
              <div key={name} className="sample-review-row">
                <img src={avatar.src} alt={`${name} avatar`} />
                <div>
                  <strong>{name}</strong>
                  <span>{task}</span>
                </div>
              </div>
            ))}
          </article>

          <article className="sample-card sample-table-card">
            <header className="sample-card-header">
              <div>
                <span className="sample-kicker">Projects</span>
                <strong>Active launches</strong>
              </div>
              <input aria-label="Search launches" placeholder="Search" />
            </header>
            <div className="sample-table">
              <div className="sample-table-head">
                <span>Name</span>
                <span>Owner</span>
                <span>Status</span>
                <span>Score</span>
              </div>
              {[
                ["AI Workbench", "Maya", "On track", "94"],
                ["Billing refresh", "John", "Review", "82"],
                ["Analytics v2", "Sara", "Ready", "91"]
              ].map(([name, owner, status, score]) => (
                <div key={name} className="sample-table-row">
                  <strong>{name}</strong>
                  <span>{owner}</span>
                  <b>{status}</b>
                  <em>{score}</em>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

function LandingScene({ spec }: { spec: DesignSpec }) {
  const proofLogos = ["Chime", "Serval", "Lightspeed", "Sully", "Sapion", "Ambrook", "Unusual", "Stellic"];
  const featureItems = [
    {
      title: "Search that goes beyond filters",
      copy: "Describe the interface direction in natural language and keep every screen grounded in the selected design.md."
    },
    {
      title: "Theme memory for every draft",
      copy: "Accent, base tone, typography, radius, density, and elevation stay consistent across generated UI ideas."
    },
    {
      title: "Visual QA before generation",
      copy: "Use the fixed landing, dashboard, and component scenes to judge whether the style is ready."
    },
    {
      title: "Exportable design DNA",
      copy: "When the sample page feels right, export the adjusted design.md as the shared style contract."
    }
  ];
  const moreFeatures = [
    ["Live theme insights", "Inspect color, spacing, radius, and type without switching contexts.", "company"],
    ["Continuous design copilot", "Chat through new directions while keeping the current style rules intact.", "copilot"],
    ["Deep visual analysis", "Compare screenshots, references, and generated drafts against one theme.", "research"],
    ["Reusable collections", "Save tuned theme directions and return to them for later product surfaces.", "table"],
    ["Sequence-ready drafts", "Carry the same visual language from landing pages into tools and dashboards.", "email"]
  ];
  const relatedArticles = [
    ["Jan 10, 2026", "Introducing search by visual calibration", "How fixed benchmark pages make style decisions easier."],
    ["Jan 10, 2026", "Introducing design.md for your workspace", "A shared style contract for AI-generated interface drafts."],
    ["Dec 29, 2025", "Interview note templates and AI answers", "How structured UI notes improve downstream generation."]
  ];
  const footerColumns = [
    ["Platform", "Style Lab", "Tweaker", "Generation", "Visual references"],
    ["Solutions", "Theme builder", "Design systems", "AI product teams", "Vibe coding"],
    ["Company", "Roadmap", "Pricing", "Case studies"],
    ["Resources", "Docs", "Blog", "Changelog"]
  ];

  return (
    <div className="sample-page sample-page--landing" aria-label={`${spec.meta.title} landing benchmark`}>
      <header className="sample-landing-nav">
        <div className="sample-wordmark">
          <span className="sample-mark" aria-hidden="true" />
          <strong>Atlas</strong>
        </div>
        <nav aria-label="Landing navigation">
          <span>Product</span>
          <span>Solutions</span>
          <span>Pricing</span>
        </nav>
        <div className="sample-nav-actions">
          <button type="button" className="canvas-button canvas-button--plain">
            Get a demo
          </button>
          <button type="button" className="canvas-button canvas-button--plain">
            Sign in
          </button>
          <button type="button" className="canvas-button canvas-button--primary">
            Get started
          </button>
        </div>
      </header>

      <section className="sample-landing-hero">
        <span className="sample-announcement">Introducing design.md style memory</span>
        <h3>From design.md to polished UI in minutes.</h3>
        <p>
          Build a beautiful theme first, inspect it on a real product page, then use the same visual system when
          generating UI drafts.
        </p>
        <button type="button" className="canvas-button canvas-button--primary">
          Get started
        </button>
      </section>

      <section className="sample-hero-stage" aria-label="Product interface preview">
        <LandingProductFrame spec={spec} variant="hero" />
      </section>

      <section className="sample-proof-strip" aria-label="Trusted customers">
        <span>Trusted by design-led product teams</span>
        {proofLogos.map((logo) => (
          <b key={logo}>{logo}</b>
        ))}
      </section>

      <section className="sample-feature-split">
        <article className="sample-feature-copy">
          <span className="sample-kicker">Workflow</span>
          <h4>Your AI interface theme OS</h4>
          <p>
            A good theme builder needs one beautiful standard page. Every preset and imported design.md should be judged
            against the same product-grade landing structure.
          </p>
          <button type="button" className="canvas-button">
            Build this theme
          </button>
          <div className="sample-accordion">
            {featureItems.map((item, index) => (
              <details key={item.title} open={index === 0}>
                <summary>{item.title}</summary>
                <p>{item.copy}</p>
              </details>
            ))}
          </div>
        </article>

        <div className="sample-feature-visual">
          <LandingProductFrame spec={spec} variant="feature" />
        </div>
      </section>

      <section className="sample-testimonial-section">
        <h4>What teams say about Atlas</h4>
        <div className="sample-testimonial-grid">
          <article className="sample-proof-card sample-proof-card--metric">
            <strong>3x</strong>
            <span>Faster style decisions</span>
          </article>
          <article className="sample-proof-card sample-proof-card--metric">
            <strong>8x</strong>
            <span>More reusable theme checks</span>
          </article>
          <article className="sample-proof-card sample-proof-card--quote sample-proof-card--wide">
            <b>KOS</b>
            <p>
              "Atlas made design.md feel concrete. We could judge the theme on real sections before generating any
              final screens."
            </p>
            <span>Kai Werner - Design systems lead</span>
          </article>
          <article className="sample-proof-card sample-proof-card--quote sample-proof-card--large">
            <b>Peregrine</b>
            <p>
              "The long benchmark page exposes weak themes immediately. Hero, product UI, proof, content, and footer all
              have to hold together."
            </p>
            <span>Mike Lee - Founder</span>
          </article>
          <article className="sample-proof-card sample-proof-card--metric">
            <strong>95%</strong>
            <span>Theme recall relevance</span>
          </article>
          <article className="sample-proof-card sample-proof-card--metric">
            <strong>$25k</strong>
            <span>Saved per design cycle</span>
          </article>
        </div>
      </section>

      <section className="sample-more-section">
        <h4>More features</h4>
        <div className="sample-more-grid">
          {moreFeatures.map(([title, copy, variant], index) => (
            <article key={title} className={`sample-more-card ${index > 2 ? "sample-more-card--wide" : ""}`}>
              <div>
                <strong>{title}</strong>
                <p>{copy}</p>
              </div>
              <div className={`sample-mini-ui sample-mini-ui--${variant}`} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sample-faq-panel">
        <h4>Frequently asked questions</h4>
        <div className="sample-faq-list">
          {[
            [
              "How do I get started?",
              "Import or tune a design.md, inspect this benchmark page, then move to generation once the style feels close."
            ],
            ["Can I work with my whole team?", "Yes. The exported design.md can become the shared style memory."],
            ["Where can I use the theme?", "Use it across landing pages, dashboards, product tools, and generated drafts."],
            ["Will there be more updates?", "The benchmark page can keep expanding as new UI surfaces become important."],
            ["Who does Atlas work best for?", "Designers and builders exploring AI-generated UI with consistent taste."]
          ].map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="sample-related-section">
        <div>
          <h4>Related content</h4>
          <p>Use these editorial cards to test image blocks, metadata, titles, and card rhythm.</p>
          <button type="button" className="canvas-button">
            Read more
          </button>
        </div>
        <div className="sample-related-grid">
          {relatedArticles.map(([date, title, copy], index) => (
            <article key={title} className="sample-related-card">
              <div className={`sample-article-thumb sample-article-thumb--${index + 1}`}>
                <LandingProductFrame spec={spec} variant="feature" />
              </div>
              <span>{date} - 5 min read</span>
              <strong>{title}</strong>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sample-final-cta">
        <div>
          <span className="sample-kicker">Ready to get started?</span>
          <strong>Keep this theme and move to Generate.</strong>
          <p>Create a draft with the selected design.md, or return to Style Lab to tune it further.</p>
        </div>
        <button type="button" className="canvas-button canvas-button--primary">
          Generate with this style
        </button>
      </section>

      <footer className="sample-footer">
        <span className="sample-mark" aria-hidden="true" />
        {footerColumns.map(([title, ...items]) => (
          <div key={title}>
            <strong>{title}</strong>
            {items.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        ))}
        <p>All systems normal</p>
      </footer>
    </div>
  );
}

function LandingProductFrame({ spec, variant }: { spec: DesignSpec; variant: "hero" | "feature" }) {
  const lanes =
    variant === "hero"
      ? ["Landing page", "Dashboard", "Component kit", "Generated draft"]
      : ["Theme import", "Token tuning", "Visual QA", "Export"];

  return (
    <article className={`sample-product-frame sample-product-frame--${variant}`}>
      <aside className="sample-product-sidebar">
        <div className="sample-product-sidebar__brand">
          <span className="sample-mark" aria-hidden="true" />
          <strong>Atlas</strong>
        </div>
        {lanes.map((lane, index) => (
          <span key={lane} className={index === 0 ? "is-active" : ""}>
            {lane}
          </span>
        ))}
      </aside>

      <main className="sample-product-main">
        <header className="sample-product-topbar">
          <div>
            <span>Style Lab</span>
            <strong>{variant === "hero" ? "Design system preview" : "Generated benchmark"}</strong>
          </div>
          <div className="sample-product-actions">
            <span>{spec.shape.radius}</span>
            <span>{spec.layout.density}</span>
            <button type="button">Preview</button>
          </div>
        </header>

        <section className="sample-product-workspace">
          <article className="sample-prompt-panel">
            <span className="sample-kicker">Current brief</span>
            <p>
              Create a polished AI product landing page. Keep content fixed while the theme changes through design.md
              tokens.
            </p>
            <div className="sample-prompt-list">
              <span>Accent and base applied</span>
              <span>Typography scale checked</span>
              <span>Radius and elevation visible</span>
            </div>
          </article>

          <article className="sample-result-panel">
            <header>
              <div>
                <strong>{spec.meta.title}</strong>
                <span>{spec.theme.visualTheme}</span>
              </div>
              <span className="sample-badge">{spec.elevation.preset}</span>
            </header>
            <svg className="sample-line-chart" viewBox="0 0 560 220" aria-hidden="true">
              <path d="M12 172 L68 138 L124 150 L180 104 L236 120 L292 86 L348 104 L404 70 L460 82 L548 48" />
              <path d="M12 190 L68 172 L124 162 L180 148 L236 156 L292 128 L348 142 L404 118 L460 132 L548 96" />
              <circle cx="548" cy="48" r="7" />
            </svg>
            <div className="sample-result-tabs">
              <span>Hero hierarchy</span>
              <span>Product mock</span>
              <span>CTA states</span>
            </div>
          </article>

          <article className="sample-inspector-panel">
            <div className="sample-avatar-row">
              {TEAM_AVATARS.slice(0, 3).map((avatar) => (
                <img key={avatar.name} src={avatar.src} alt={`${avatar.name} avatar`} />
              ))}
            </div>
            <div>
              <span>Visual QA</span>
              <strong>9.4</strong>
            </div>
            <div>
              <span>Theme memory</span>
              <strong>{spec.typography.scalePreset}</strong>
            </div>
            <button type="button" className="canvas-button canvas-button--primary">
              Generate
            </button>
          </article>
        </section>
      </main>
    </article>
  );
}
