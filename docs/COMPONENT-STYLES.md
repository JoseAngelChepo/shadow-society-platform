# Component styling guide

How to build UI in this app: **design tokens globally**, **styles colocated in each component** (styled-jsx), and **small shared wrappers** when the same markup repeats.

Related: [COMPONENTS.md](./COMPONENTS.md) (folder layout), [LANDING.md](./LANDING.md) (marketing page), [FONTS.md](./FONTS.md) (typography).

---

## Typography first (agents)

Before changing colors or landing sections on a fork:

1. **Choose** a primary font from [FONTS.md](./FONTS.md).
2. **Configure** `src/config/fonts.ts`, `appFont.variable` on `<body>` in `layout.tsx`, and a **literal** `--app-font: "Your Font", system-ui, ...` in `globals.css` (not `var(--font-*)` on `:root` — see FONTS.md).

All styled-jsx and auth UI use `font-family: var(--app-font)` and inherit from `html`/`body`.

---

## Architecture (three layers)

| Layer | Where | Purpose |
|-------|--------|---------|
| **Tokens** | `src/app/globals.css` (`:root` `--app-*`) | Colors, radius, shadows, font stack. Never put feature-specific layout here. |
| **Component styles** | `<style jsx>` at the bottom of the same `.tsx` | Scoped layout and look for that component only. |
| **Shared primitives** | `ui/`, or domain helpers (e.g. `landing/LandingButton.tsx`) | Reused markup + styles when 3+ call sites need the same thing. |

**Do not** add new global class blocks to `globals.css` for pages or features. If you need a one-off screen, style it in that screen’s component.

---

## Default pattern: styled-jsx in the component file

This matches `Button`, `Loader`, `GoogleAuthButton`, and landing sections.

### Minimal example (`ui/`)

```tsx
type Props = { label: string }

export default function Badge({ label }: Props) {
  return (
    <>
      <span className="badge">{label}</span>
      <style jsx>{`
        .badge {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          color: var(--app-text-muted);
          background: var(--app-surface);
          border: 1px solid var(--app-border);
          border-radius: 999px;
        }
      `}</style>
    </>
  )
}
```

### Rules

1. **Use `var(--app-*)` tokens** for colors, borders, radius, and shadows — not hardcoded hex (except rare one-offs like pure white on a dark CTA).
2. **Place `<style jsx>` after the JSX** in the same `return` (wrap in a fragment if you need multiple roots).
3. **Class names are local** to the file (styled-jsx hashes them). Use simple names: `.title`, `.card`, `.grid`.
4. **Modifiers** via extra classes: `className="btn btn--primary"`, not separate CSS files.
5. **Pseudo-elements and nested tags** — use `:global()` when targeting raw HTML inside a wrapper:

```tsx
.checklist :global(li::before) {
  content: "";
  /* ... */
}
```

Reference: `src/components/landing/sections/SolutionSection.tsx`.

---

## Client vs Server Components (App Router)

**styled-jsx only works in Client Components.**

| Area | Boundary | Notes |
|------|-----------|--------|
| Landing | `"use client"` on `LandingPage.tsx` | All landing sections imported there run as client UI. |
| Auth forms | `"use client"` on forms | `SignInForm`, `SignUpForm`. |
| `Button`, `Loader` | Used inside client trees | Already compatible. |

If the build fails with *"styled-jsx cannot be imported from a Server Component"*, add `"use client"` to the nearest parent that owns the tree.

---

## When to extract a shared component

Extract to `ui/` or `<feature>/Helper.tsx` when:

- The same **markup + styles** appear in **3+ places** (e.g. `LandingButton`, `LandingContainer`).
- You need a **stable public API** (`variant`, `size`, `href`).

Landing primitives (reuse these before copying):

| Component | Role |
|-----------|------|
| `LandingSection` | `<section>` padding, borders, variants: `default` \| `muted` \| `hero` \| `cta` |
| `LandingContainer` | Centered max-width column; `narrow` prop for FAQ-width |
| `LandingButton` | Link styled as CTA; `variant`, `size`, `inverted` (dark CTA band) |

---

## Creating a new landing section

1. **Copy** in `src/content/landing.ts` (keys + types).
2. **Create** `src/components/landing/sections/YourSection.tsx`.
3. **Compose** primitives + local markup; **styles only for what’s unique** to that section.
4. **Register** in `LandingPage.tsx` (order matters for narrative).
5. Optional: `header.nav` anchor → `#your-id` on `LandingSection`.

**Copy** stays in `landing.ts` — never hardcode marketing strings in the section file.

Full example: `src/components/landing/sections/FeaturesSection.tsx`.

---

## Auth and layout (globals.css classnames)

Auth and dashboard shell use **scoped classnames** in `globals.css` (`.auth-*`, `.home-*`):

| Area | Styles |
|------|--------|
| Auth forms | `.auth-page`, `.auth-card`, `.auth-input`, … in `globals.css` |
| Dashboard shell | `.home-shell`, `.home-card`, … in `globals.css` |

You may migrate these to styled-jsx later; follow the same token rules.

---

## Third-party / animated UI (21st.dev, etc.)

1. Add an **isolated wrapper** under `ui/` or `<feature>/` (e.g. `AnimatedHeroBackground.tsx`).
2. Put vendor CSS and markup **inside** that wrapper.
3. Expose a small props API (`className`, `children`, `variant`).
4. Import **only the wrapper** from pages/sections.

Never paste large snippets into `globals.css` or spread vendor classes across auth/providers.

---

## Checklist for a new component

- [ ] Lives in the right folder (`ui/`, `auth/`, `layout/`, `landing/`, `<feature>/`).
- [ ] Uses `--app-*` tokens for themeable values.
- [ ] Styles in the same `.tsx` (`<style jsx>`) or existing auth/home globals — not new page-level globals.
- [ ] `"use client"` only if the file uses styled-jsx, hooks, or browser APIs.
- [ ] Copy in `content/` or `messages/` — not inline product strings (landing/auth).
- [ ] Shared pieces extracted only when reused 3+ times.

---

## Anti-patterns

| Avoid | Prefer |
|-------|--------|
| Growing `globals.css` with `.landing-*` or `.feature-*` pages | styled-jsx in the feature component |
| One `landing.css` for all sections | Per-section `<style jsx>` + `LandingSection` / `LandingContainer` |
| Pasting 21st.dev blocks into `page.tsx` | Wrapper component under `components/` |
| Hardcoded brand hex everywhere | `var(--app-primary)` and other `--app-*` tokens |
