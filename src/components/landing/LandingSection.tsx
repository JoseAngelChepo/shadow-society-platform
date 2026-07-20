type Variant = "default" | "muted" | "hero" | "cta"

type Props = {
  children: React.ReactNode
  id?: string
  variant?: Variant
  "aria-labelledby"?: string
}

export default function LandingSection({
  children,
  id,
  variant = "default",
  "aria-labelledby": ariaLabelledby,
}: Props) {
  const className = ["section", variant !== "default" ? `section--${variant}` : ""]
    .filter(Boolean)
    .join(" ")

  return (
    <section id={id} className={className} aria-labelledby={ariaLabelledby}>
      {children}
      <style jsx>{`
        .section {
          padding: 5.5rem 0;
          border-bottom: 1px solid var(--app-border);
        }
        .section:last-of-type {
          border-bottom: none;
        }
        .section--muted {
          background: var(--app-surface-muted);
        }
        .section--hero {
          position: relative;
          padding-top: 5rem;
          padding-bottom: 6rem;
          overflow: hidden;
          text-align: center;
          background: var(--app-bg);
        }
        .section--cta {
          background: var(--app-text);
          border-bottom: none;
        }
        @media (min-width: 1024px) {
          .section {
            padding: 6.5rem 0;
          }
          .section--hero {
            padding-top: 7rem;
            padding-bottom: 8rem;
          }
        }
      `}</style>
    </section>
  )
}
