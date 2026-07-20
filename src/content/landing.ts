/**
 * Landing page copy — replace when forking. Sections follow a typical YC-style narrative.
 * Wire to i18n (`src/messages/*.json`) when you need multiple locales.
 */

export type LandingNavItem = { label: string; href: string }

export type LandingBullet = { title: string; description: string }

export type LandingStep = { step: string; title: string; description: string }

export type LandingFaqItem = { question: string; answer: string }

export const landingContent = {
  brand: {
    name: "YourApp",
  },
  header: {
    nav: [
      { label: "Problem", href: "#problem" },
      { label: "Solution", href: "#solution" },
      { label: "How it works", href: "#how-it-works" },
      { label: "FAQ", href: "#faq" },
    ] satisfies LandingNavItem[],
    loginLabel: "Log in",
    signupLabel: "Sign up",
    dashboardLabel: "Dashboard",
  },
  hero: {
    eyebrow: "Now accepting early access",
    title: "Ship multi-agent debate simulations with clarity",
    lede:
      "A Next.js + auth starter with a public landing, protected dashboard, and API wiring — so you can focus on the problem you actually solve.",
    primaryCta: { label: "Get started", href: "/sign-up" },
    secondaryCta: { label: "See how it works", href: "#how-it-works" },
  },
  problem: {
    id: "problem",
    eyebrow: "The problem",
    title: "Building the same foundation over and over slows you down",
    lede:
      "Every new product still needs auth, routing, API clients, and a credible landing page before you can validate the idea.",
    items: [
      {
        title: "Weeks lost on boilerplate",
        description:
          "Sign-up, sessions, guards, and env wiring eat time that should go to your core workflow.",
      },
      {
        title: "Landing and app feel disconnected",
        description:
          "Marketing pages and the signed-in product often diverge in tone, tokens, and navigation.",
      },
      {
        title: "Hard to iterate with investors or users",
        description:
          "Without a clear narrative on the homepage, early conversations start with explaining infra instead of value.",
      },
    ] satisfies LandingBullet[],
  },
  solution: {
    id: "solution",
    eyebrow: "The solution",
    title: "One flow from config to debate results",
    lede:
      "Public landing at `/`, dashboard at `/dashboard`, and a services API you control — structured so teams can fork and ship.",
    highlights: [
      "Auth flows and session handling out of the box",
      "Light UI tokens you can rebrand in one place",
      "Paired with shadow-society-services for the debate API",
    ],
  },
  howItWorks: {
    id: "how-it-works",
    eyebrow: "How it works",
    title: "From fork to first user in three steps",
    steps: [
      {
        step: "01",
        title: "Fork and rename",
        description: "Clone shadow-society-platform and shadow-society-services; set env vars.",
      },
      {
        step: "02",
        title: "Customize the landing",
        description: "Edit `src/content/landing.ts`, tokens in globals.css, and your hero narrative.",
      },
      {
        step: "03",
        title: "Build your dashboard",
        description: "Replace the dashboard shell with your core experience and grow API modules as needed.",
      },
    ] satisfies LandingStep[],
  },
  features: {
    id: "features",
    eyebrow: "Why teams use it",
    title: "Everything you need to look credible on day one",
    items: [
      {
        title: "Public marketing shell",
        description: "Hero, problem, solution, FAQ, and CTAs — the sections investors expect to scan.",
      },
      {
        title: "Auth that matches the UI",
        description: "Email/password, Google OAuth, and guarded routes with consistent forms and toasts.",
      },
      {
        title: "Typed API client",
        description: "ServicesProvider and axios interceptors ready for your backend contracts.",
      },
      {
        title: "Clear folder conventions",
        description: "Components grouped by ui, auth, layout, and feature domains as you scale.",
      },
    ] satisfies LandingBullet[],
  },
  socialProof: {
    eyebrow: "Traction",
    title: "Replace with your metrics when you have them",
    stats: [
      { value: "10×", label: "Faster time to first deploy" },
      { value: "2 repos", label: "Platform + services monorepo" },
      { value: "<1 day", label: "Typical fork-to-demo timeline" },
    ],
    quote: {
      text: "We stopped rebuilding auth and shipped our MVP narrative the same week.",
      attribution: "Founder name — Company",
    },
  },
  faq: {
    id: "faq",
    eyebrow: "FAQ",
    title: "Questions founders ask before forking",
    items: [
      {
        question: "Is this production-ready?",
        answer:
          "Shadow Society: config, live simulation, and Judge results for the Agent Society hackathon.",
      },
      {
        question: "Can I change the landing sections?",
        answer:
          "Yes. Each section is a component under `src/components/landing/sections/` with copy in `src/content/landing.ts`.",
      },
      {
        question: "Where does the user land after sign-in?",
        answer: "Authenticated users are redirected to `/dashboard` by default.",
      },
    ] satisfies LandingFaqItem[],
  },
  finalCta: {
    title: "Ready to replace this copy with your pitch?",
    lede: "Run the platform UI and point it at shadow-society-services.",
    primaryCta: { label: "Create free account", href: "/sign-up" },
    secondaryCta: { label: "Log in", href: "/sign-in" },
  },
  footer: {
    tagline: "Shadow Society — Qwen Cloud Global AI Hackathon 2026.",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Contact", href: "#" },
    ] satisfies LandingNavItem[],
    copyright: "© {year} YourApp. All rights reserved.",
  },
} as const
