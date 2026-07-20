# Recommended fonts

Load fonts with [`next/font/google`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) for zero layout shift. The app ships **system-ui** in `globals.css` so builds work offline; **when you fork or rebrand, pick a font and wire all three places** (see below).

---

## For AI agents — choose a font first

When starting product branding (fork, rebrand, or new product), **choose one primary sans-serif** before editing landing or auth UI.

### Checklist (three files — same family name everywhere)

| Step | File | Action |
|------|------|--------|
| 1 | `src/config/fonts.ts` | `next/font/google` loader, `variable: "--font-<slug>"`, weights `400`–`700` |
| 2 | `src/app/layout.tsx` | `className={appFont.variable}` on `<body>` (loads font files) |
| 3 | `src/app/globals.css` | **`--app-font` with the literal family name** + system fallbacks |

### Critical: do not use `var(--font-*)` inside `:root` `--app-font`

`next/font` defines `--font-poppins` (etc.) **on `<body>`** via `appFont.variable`, not on `:root`.

If you write this in `:root`:

```css
/* Wrong — variable is undefined on :root, browser skips to fallback */
--app-font: var(--font-poppins), system-ui, sans-serif;
```

`--app-font` is resolved where it is defined (`:root`). At that scope `--font-poppins` does not exist yet, so the custom font is dropped and you only see system-ui.

**Correct pattern** — literal name in `globals.css`, loader + body class from `next/font`:

```css
/* :root in globals.css */
--app-font: "Poppins", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
```

`next/font` still injects `@font-face` and optimization through `appFont.variable` on `<body>`; the literal string must match the Google Fonts family name.

You may use `var(--font-poppins)` on **specific elements** under `<body>` (e.g. a hero title), but **not** when defining `--app-font` on `:root`.

### Example (Poppins)

`src/config/fonts.ts`:

```ts
import { Poppins } from "next/font/google"

/** Swap loader + match literal name in globals.css --app-font */
export const appFont = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})
```

`src/app/layout.tsx` (already wired):

```tsx
<body className={appFont.variable}>
```

`src/app/globals.css` (`:root`):

```css
/* Typography — Poppins (see src/config/fonts.ts, docs/FONTS.md)
   Keep literal; do not use var(--font-poppins) here. */
--app-font: "Poppins", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
```

### Example (Red Hat Display)

Same pattern (verified in production on agentfloors-platform):

```ts
import { Red_Hat_Display } from "next/font/google"

export const appFont = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-red-hat-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})
```

```css
--app-font: "Red Hat Display", system-ui, -apple-system, "Segoe UI", sans-serif;
```

---

## Poppins (recommended default for products)

- **Style:** geometric sans-serif  
- **Good for:** product UI, forms, dashboards, marketing blocks  
- **Pair with:** Playfair Display for display headings  

```ts
import { Poppins } from "next/font/google"

export const appFont = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})
```

`globals.css`: `--app-font: "Poppins", system-ui, ...`

---

## Raleway

- **Style:** elegant sans with open counters  
- **Good for:** landing pages, sign-in/sign-up, light headlines  

```ts
export const appFont = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})
```

`globals.css`: `--app-font: "Raleway", system-ui, ...`

---

## Plus Jakarta Sans

- **Style:** neutral contemporary sans  
- **Good for:** SaaS, B2B, dense tables and data UI  

```ts
export const appFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})
```

`globals.css`: `--app-font: "Plus Jakarta Sans", system-ui, ...`

---

## Playfair Display (display only — not for body)

- **Style:** high-contrast serif (display)  
- **Good for:** hero titles, quotes — not for `--app-font`  

Add a second loader; use `font-family: var(--font-playfair), Georgia, serif` on specific elements in styled-jsx (under `<body>` where the variable exists).

---

## Offline / CI builds

If Google Fonts must not run at build time, keep `src/config/fonts.ts` with `variable: ""` and a system stack only in `--app-font`. Document that choice for the user.
