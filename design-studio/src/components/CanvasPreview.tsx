import { previewThemeVars } from "../lib/previewTheme";
import type { DesignSpec, PreviewMode, PreviewSceneId, ThemePreset } from "../types/design";

interface CanvasPreviewProps {
  spec: DesignSpec;
  previewMode: PreviewMode;
  scene: PreviewSceneId;
  themePreset: ThemePreset;
  baseTone: number;
  onSceneChange: (scene: PreviewSceneId) => void;
}

const SCENE_OPTIONS: Array<{ id: PreviewSceneId; label: string }> = [
  { id: "components", label: "Components" },
  { id: "dashboard", label: "Dashboard" },
  { id: "landing", label: "Landing" }
];

export function CanvasPreview({
  spec,
  previewMode,
  scene,
  themePreset,
  baseTone,
  onSceneChange
}: CanvasPreviewProps) {
  const vars = previewThemeVars(spec, previewMode, themePreset, baseTone);

  return (
    <section className="canvas-shell" style={vars}>
      <div className="canvas-shell__top">
        <div className="canvas-shell__brand">
          <div className="brand-mark">DS</div>
          <div>
            <p className="eyebrow">Theme playground</p>
            <h2>{spec.meta.title}</h2>
          </div>
        </div>

        <div className="canvas-shell__history" aria-hidden="true">
          <button type="button">↶</button>
          <button type="button">↷</button>
          <button type="button">⤢</button>
        </div>

        <div className="top-tabs" role="tablist" aria-label="Preview scenes">
          {SCENE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              className={scene === option.id ? "is-active" : undefined}
              aria-selected={scene === option.id}
              onClick={() => onSceneChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="canvas-shell__actions">
          <button type="button" aria-label="theme">
            ☼
          </button>
          <button type="button" aria-label="share">
            ↗
          </button>
          <button type="button" aria-label="code">
            &lt;/&gt;
          </button>
        </div>
      </div>

      <div className="theme-board">
        <div className="theme-board__toolbar">
          <div className="window-dots">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="theme-board__canvas">
          {scene === "components" ? <ComponentsScene spec={spec} /> : null}
          {scene === "dashboard" ? <DashboardScene spec={spec} /> : null}
          {scene === "landing" ? <LandingScene spec={spec} /> : null}
        </div>
      </div>
    </section>
  );
}

function ComponentsScene({ spec }: { spec: DesignSpec }) {
  return (
    <div className="canvas-grid canvas-grid--hero">
      <article className="preview-card preview-card--form">
        <label>
          Your email
          <input className="studio-field" placeholder="john@email.com" />
        </label>
        <label>
          State
          <select className="studio-field">
            <option>Select one</option>
            <option>Studio Team</option>
          </select>
        </label>

        <div className="toggle-row">
          <span className="toggle is-on" />
          <span className="toggle is-track" />
          <span className="toggle" />
          <span className="toggle is-ring" />
          <span className="toggle is-loader" />
        </div>

        <div className="range-line">
          <div>
            <strong>Price</strong>
            <span>$250.00</span>
          </div>
          <div className="range-track">
            <span />
          </div>
        </div>

        <div className="segmented segmented--canvas">
          <button type="button" className="is-active">
            1D
          </button>
          <button type="button">7D</button>
          <button type="button">1M</button>
          <button type="button">1Y</button>
          <button type="button">All</button>
        </div>

        <div className="segmented segmented--canvas segmented--wide">
          <button type="button" className="is-active">
            Chats
          </button>
          <button type="button">Emails</button>
        </div>
      </article>

      <article className="preview-card preview-card--verify">
        <div className="bubble-row">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span className="bubble-row__plus">+5</span>
        </div>

        <div className="mini-copy">
          <strong>Verify account</strong>
          <p>We sent a code to a***k@gmail.com</p>
        </div>

        <div className="otp-row">
          <span>4</span>
          <span>3</span>
          <span>2</span>
          <span>0</span>
          <span />
          <span />
        </div>

        <p className="inline-link">
          Didn&apos;t receive a code? <u>Resend</u>
        </p>

        <div className="button-grid">
          <button type="button" className="canvas-button canvas-button--primary">
            Click me
          </button>
          <button type="button" className="canvas-button canvas-button--ghost">
            Click me
          </button>
          <button type="button" className="canvas-button">
            Click me
          </button>
          <button type="button" className="canvas-button canvas-button--danger">
            Click me
          </button>
          <button type="button" className="canvas-button canvas-button--soft">
            Click me
          </button>
          <button type="button" className="canvas-button canvas-button--plain">
            Click me
          </button>
        </div>
      </article>

      <article className="preview-card preview-card--account">
        <div className="account-icon">◌</div>
        <div className="mini-copy mini-copy--center">
          <strong>Create an account</strong>
          <p>Start your free 7-day trial. No credit card required.</p>
        </div>
        <button type="button" className="canvas-button canvas-button--primary canvas-button--wide">
          Get Started
        </button>
        <div className="divider">OR</div>
        <button type="button" className="canvas-button canvas-button--wide">
          Continue with Google
        </button>
        <button type="button" className="canvas-button canvas-button--wide">
          Continue with Apple
        </button>
      </article>

      <article className="preview-card preview-card--profile">
        <div className="profile-chip">
          <div className="avatar">H</div>
          <div>
            <strong>{spec.meta.title}</strong>
            <span>@design-studio</span>
          </div>
        </div>

        <p className="lead-copy">
          {spec.theme.visualTheme || "A visual system with clear tokens, strong hierarchy, and polished interaction details."}
        </p>

        <div className="stat-grid">
          <div className="stat-card">
            <span>Theme</span>
            <strong>{spec.theme.themeMode}</strong>
          </div>
          <div className="stat-card">
            <span>Density</span>
            <strong>{spec.layout.density}</strong>
          </div>
          <div className="stat-card">
            <span>Scale</span>
            <strong>{spec.typography.scalePreset}</strong>
          </div>
        </div>
      </article>

      <article className="preview-card preview-card--community preview-card--communityA">
        <div className="community-thumb" />
        <strong>Indie Hackers</strong>
        <span>148 members</span>
        <p>By John</p>
      </article>

      <article className="preview-card preview-card--community preview-card--communityB">
        <div className="community-thumb community-thumb--alt" />
        <strong>AI Builders</strong>
        <span>362 members</span>
        <p>By Martha</p>
      </article>

      <article className="preview-card preview-card--notice">
        <div className="notice-row">
          <div>
            <strong>Allow notifications</strong>
            <p>Receive push notifications from the studio.</p>
          </div>
          <div className="switch is-on" />
        </div>
        <div className="notice-row notice-row--cta">
          <div>
            <strong>Unsaved changes</strong>
            <p>Do you want to save or discard changes?</p>
          </div>
          <div className="button-row button-row--canvas">
            <button type="button" className="canvas-button">
              Discard
            </button>
            <button type="button" className="canvas-button canvas-button--primary">
              Save changes
            </button>
          </div>
        </div>
      </article>

      <article className="preview-card preview-card--metrics">
        <div className="metric-bar">
          <span>Surface contrast</span>
          <strong>{spec.colors.surface}</strong>
        </div>
        <div className="progress">
          <span style={{ width: "71%" }} />
        </div>
        <div className="metric-bar">
          <span>Primary text</span>
          <strong>{spec.colors.textPrimary}</strong>
        </div>
        <div className="status-block">
          <strong>Prompt-ready</strong>
          <p>The generated DESIGN.md already includes reusable copy for agents.</p>
        </div>
      </article>
    </div>
  );
}

function DashboardScene({ spec }: { spec: DesignSpec }) {
  return (
    <div className="dashboard-benchmark">
      <aside className="dashboard-sidebar">
        <div className="dashboard-profile">
          <div className="dashboard-avatar" />
          <div>
            <strong>Kate Moore</strong>
            <span>Admin</span>
          </div>
        </div>

        <nav className="dashboard-nav">
          <button type="button" className="dashboard-nav__item is-active">
            Dashboard
          </button>
          <button type="button" className="dashboard-nav__item">
            Orders
          </button>
          <button type="button" className="dashboard-nav__item">
            Tracker
            <span className="dashboard-badge">New</span>
          </button>
          <button type="button" className="dashboard-nav__item">
            Analytics
          </button>
          <button type="button" className="dashboard-nav__item">
            Settings
          </button>
        </nav>

        <div className="dashboard-sidebar__footer">
          <button type="button" className="dashboard-sidebar__link">
            Help &amp; Information
          </button>
          <button type="button" className="dashboard-sidebar__link">
            Log out
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-kicker">Benchmark scene</p>
            <h3>Good morning, Kate</h3>
            <p>
              {spec.theme.visualTheme || "Measure how this DESIGN.md handles information density, hierarchy, and charts."}
            </p>
          </div>

          <div className="dashboard-header__actions">
            <div className="segmented segmented--canvas">
              <button type="button" className="is-active">
                Overview
              </button>
              <button type="button">Sales</button>
              <button type="button">Expenses</button>
            </div>
            <div className="dashboard-toolbar">
              <button type="button" className="dashboard-icon-button">
                ↻
              </button>
              <label className="dashboard-filter">
                <span>Monthly</span>
                <select>
                  <option>Monthly</option>
                  <option>Weekly</option>
                </select>
              </label>
              <button type="button" className="canvas-button canvas-button--primary">
                Download
              </button>
            </div>
          </div>
        </header>

        <div className="dashboard-kpis">
          {[
            ["Revenue", "$228,441", "+3.3%"],
            ["Expenses", "$25,108", "-3.3%"],
            ["Sales", "458", "+3.3%"],
            ["Profit", "$203,133", "+4.1%"]
          ].map(([label, value, delta]) => (
            <article key={label} className="dashboard-panel dashboard-panel--kpi">
              <span>{label}</span>
              <strong>{value}</strong>
              <em className={delta.startsWith("-") ? "is-negative" : "is-positive"}>{delta}</em>
            </article>
          ))}
        </div>

        <div className="dashboard-analytics">
          <article className="dashboard-panel dashboard-panel--chart">
            <div className="dashboard-panel__header">
              <div>
                <strong>Sales Performance</strong>
                <span>Weekly sales</span>
              </div>
              <label className="dashboard-filter">
                <span>Last 2 weeks</span>
                <select>
                  <option>Last 2 weeks</option>
                  <option>Last month</option>
                </select>
              </label>
            </div>

            <div className="dashboard-stat-row">
              <div>
                <strong>$28,441</strong>
                <span>Weekly sales</span>
              </div>
              <div>
                <strong>$4,063</strong>
                <span>Daily sales</span>
              </div>
              <div>
                <strong>278</strong>
                <span>Total sales</span>
              </div>
            </div>

            <div className="dashboard-bars" aria-hidden="true">
              {[30, 54, 36, 18, 44, 24, 26, 32, 10, 45, 39, 33].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="dashboard-axis">
              {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </article>

          <article className="dashboard-panel dashboard-panel--chart">
            <div className="dashboard-panel__header">
              <div>
                <strong>Traffic Source</strong>
                <span>Sessions</span>
              </div>
              <div className="dashboard-legend">
                <span>Organic</span>
                <span>Paid Ads</span>
              </div>
            </div>

            <div className="dashboard-stat-row dashboard-stat-row--single">
              <div>
                <strong>231,856</strong>
                <span>Sessions</span>
              </div>
            </div>

            <svg className="dashboard-lines" viewBox="0 0 320 140" aria-hidden="true">
              <path d="M0 118 L28 68 L56 90 L84 72 L112 68 L140 90 L168 54 L196 54 L224 44 L252 58 L280 36 L320 68" />
              <path d="M0 122 L28 92 L56 84 L84 74 L112 88 L140 82 L168 96 L196 104 L224 78 L252 96 L280 58 L320 96" />
            </svg>
            <div className="dashboard-axis">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </article>
        </div>

        <article className="dashboard-panel dashboard-panel--table">
          <div className="dashboard-table__header">
            <div>
              <strong>All Employees</strong>
              <span>32</span>
            </div>
            <div className="dashboard-table__toolbar">
              <button type="button" className="canvas-button">
                Filter
              </button>
              <button type="button" className="canvas-button">
                Sort
              </button>
              <button type="button" className="canvas-button">
                Columns
              </button>
              <input className="studio-field dashboard-search" placeholder="Search..." />
            </div>
          </div>

          <div className="dashboard-table">
            <div className="dashboard-table__head">
              <span>Worker ID</span>
              <span>Member</span>
              <span>Role</span>
              <span>Worker Type</span>
              <span>Action</span>
            </div>

            {[
              ["#4586932", "Kate Moore", "Chief Executive Officer", "Employee"],
              ["#4586933", "John Smith", "Chief Technology Officer", "Employee"],
              ["#4586934", "Sara Johnson", "Chief Marketing Officer", "Contract"]
            ].map(([id, name, role, type]) => (
              <div key={id} className="dashboard-table__row">
                <span>{id}</span>
                <span className="dashboard-table__member">
                  <i />
                  <b>{name}</b>
                </span>
                <span>{role}</span>
                <span>{type}</span>
                <span className="dashboard-table__actions">
                  <button type="button">◌</button>
                  <button type="button">✎</button>
                  <button type="button">⌫</button>
                </span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function LandingScene({ spec }: { spec: DesignSpec }) {
  return (
    <div className="landing-benchmark">
      <section className="landing-hero">
        <div className="landing-hero__copy">
          <span className="landing-kicker">Benchmark landing page</span>
          <h3>{spec.meta.title} for modern teams</h3>
          <p>
            {spec.theme.visualTheme ||
              "Use this scene to judge editorial hierarchy, CTA treatment, card density, and how well the system stretches across marketing surfaces."}
          </p>
          <div className="landing-cta-row">
            <button type="button" className="canvas-button canvas-button--primary">
              Start free trial
            </button>
            <button type="button" className="canvas-button">
              Book a demo
            </button>
          </div>
          <div className="landing-proof">
            <span>Trusted by product, design, and revenue teams</span>
            <div className="landing-avatars">
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>

        <div className="landing-hero__visual">
          <div className="landing-hero-card landing-hero-card--primary">
            <span>Pipeline velocity</span>
            <strong>+27%</strong>
            <p>Qualified opportunities moved faster this month.</p>
          </div>
          <div className="landing-hero-card landing-hero-card--accent">
            <span>Live collaboration</span>
            <strong>9.2 / 10</strong>
            <p>Teams align on roadmap, launches, and customer signals in one place.</p>
          </div>
        </div>
      </section>

      <section className="landing-logo-strip">
        {["Axiom", "Northstar", "Polaris", "Relay", "Heights"].map((logo) => (
          <span key={logo}>{logo}</span>
        ))}
      </section>

      <section className="landing-feature-grid">
        {[
          ["Shared workspace", "Keep briefs, experiments, and rollout notes in one visible workflow."],
          ["Clear reporting", "Token-aware dashboards stay readable across dense product surfaces."],
          ["Faster decisions", "Use fixed benchmark layouts to compare visual systems with less noise."],
          ["Launch polish", "Carry one design language from marketing pages through product screens."]
        ].map(([title, copy]) => (
          <article key={title} className="landing-feature-card">
            <span className="landing-feature-card__icon">✦</span>
            <strong>{title}</strong>
            <p>{copy}</p>
          </article>
        ))}
      </section>

      <section className="landing-story-grid">
        <article className="landing-quote">
          <span className="landing-kicker">Customer story</span>
          <blockquote>
            “We stopped guessing whether a new theme was production-ready. The benchmark scenes made the differences obvious in five
            minutes.”
          </blockquote>
          <div>
            <strong>Jade Lin</strong>
            <span>Design Systems Lead, Northstar</span>
          </div>
        </article>

        <article className="landing-pricing">
          <span className="landing-kicker">Pricing snapshot</span>
          <div className="landing-pricing__grid">
            <div className="landing-price-card">
              <strong>Starter</strong>
              <b>$19</b>
              <span>For solo builders</span>
            </div>
            <div className="landing-price-card is-featured">
              <strong>Growth</strong>
              <b>$79</b>
              <span>For product teams</span>
            </div>
            <div className="landing-price-card">
              <strong>Scale</strong>
              <b>Custom</b>
              <span>For multi-brand orgs</span>
            </div>
          </div>
        </article>
      </section>

      <section className="landing-footer-cta">
        <div>
          <span className="landing-kicker">Ready to compare another DESIGN.md?</span>
          <strong>Keep structure fixed. Change only the visual language.</strong>
        </div>
        <button type="button" className="canvas-button canvas-button--primary">
          Import next sample
        </button>
      </section>
    </div>
  );
}
