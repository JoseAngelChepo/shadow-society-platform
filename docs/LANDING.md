# Landing page

Public route: **`/`**. Authenticated app home: **`/dashboard`**.

## Section order (YC-style narrative)

| # | Section | Component | Content key |
|---|---------|-----------|-------------|
| — | Header | `LandingHeader.tsx` | `landingContent.header`, `brand` |
| 1 | Hero | `sections/HeroSection.tsx` | `hero` |
| 2 | Problem | `sections/ProblemSection.tsx` | `problem` |
| 3 | Solution | `sections/SolutionSection.tsx` | `solution` |
| 4 | How it works | `sections/HowItWorksSection.tsx` | `howItWorks` |
| 5 | Features | `sections/FeaturesSection.tsx` | `features` |
| 6 | Social proof | `sections/SocialProofSection.tsx` | `socialProof` |
| 7 | FAQ | `sections/FaqSection.tsx` | `faq` |
| 8 | Final CTA | `sections/FinalCtaSection.tsx` | `finalCta` |
| — | Footer | `sections/LandingFooter.tsx` | `footer` |

Composer: `src/components/landing/LandingPage.tsx` (`"use client"`).

## Shared landing primitives

| File | Purpose |
|------|---------|
| `LandingSection.tsx` | Section shell — variants: `default`, `muted`, `hero`, `cta` |
| `LandingContainer.tsx` | Max-width column; `narrow` for FAQ |
| `LandingButton.tsx` | CTA links — `variant`, `size`, `inverted` |

## Edit copy

All placeholder text lives in **`src/content/landing.ts`**. Replace brand name, headlines, metrics, and FAQ when forking.

Header actions:

- **Log in** → `/sign-in`
- **Sign up** → `/sign-up`
- **Dashboard** (when session exists) → `/dashboard`

## Edit styles

1. **Choose a font** and wire it in `src/config/fonts.ts`, `src/app/layout.tsx`, and `--app-font` in `globals.css` — see **[FONTS.md](./FONTS.md)** (agents: do this first).
2. Rebrand **`--app-*` tokens** in `src/app/globals.css`.
3. Tweak section-specific layout in each section’s `<style jsx>` block.
4. Adjust shared primitives (`LandingButton`, `LandingSection`) only when the change applies everywhere.

Do **not** add `.landing-*` classes to `globals.css`. See **[COMPONENT-STYLES.md](./COMPONENT-STYLES.md)**.

## Add or remove a section

1. Add content to `src/content/landing.ts`.
2. Create `src/components/landing/sections/YourSection.tsx` (follow `FeaturesSection.tsx`).
3. Import and render it in `LandingPage.tsx`.
4. Optional: add a nav anchor in `header.nav` pointing to `#your-id`.

## i18n

Copy is English-only in `landing.ts` for now. To localize, move strings to `src/messages/en.json` / `es.json` and read them in each section (or pass a typed messages object into `LandingPage`).
