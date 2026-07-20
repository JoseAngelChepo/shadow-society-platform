import Link from "next/link"

type Variant = "primary" | "secondary" | "ghost"
type Size = "md" | "lg"

type Props = {
  href: string
  children: React.ReactNode
  variant?: Variant
  size?: Size
  /** White buttons on dark CTA section */
  inverted?: boolean
}

export default function LandingButton({
  href,
  children,
  variant = "primary",
  size = "md",
  inverted = false,
}: Props) {
  const className = [
    "btn",
    `btn--${variant}`,
    size === "lg" ? "btn--lg" : "",
    inverted ? "btn--inverted" : "",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <Link href={href} className={className}>
      {children}
      <style jsx>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 0.875rem;
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.25;
          letter-spacing: -0.005em;
          border-radius: var(--app-radius);
          border: 1px solid transparent;
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            color 0.18s ease;
        }
        .btn:hover {
          text-decoration: none;
        }
        .btn--ghost {
          color: var(--app-text);
          background: transparent;
          border-color: transparent;
        }
        .btn--ghost:hover {
          background: var(--app-surface);
          border-color: var(--app-border);
        }
        .btn--secondary {
          color: var(--app-text);
          background: var(--app-surface);
          border-color: var(--app-border-strong);
        }
        .btn--secondary:hover {
          background: var(--app-surface-muted);
          border-color: var(--app-text);
        }
        .btn--primary {
          color: #ffffff;
          background: var(--app-primary);
          border-color: var(--app-primary);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            0 1px 2px rgba(10, 10, 10, 0.18);
        }
        .btn--primary:hover {
          background: var(--app-primary-hover);
          border-color: var(--app-primary-hover);
        }
        .btn--lg {
          padding: 0.75rem 1.25rem;
          font-size: 0.9375rem;
        }
        .btn--inverted.btn--primary {
          color: var(--app-text);
          background: #ffffff;
          border-color: #ffffff;
          box-shadow: none;
        }
        .btn--inverted.btn--primary:hover {
          background: var(--app-surface-muted);
          border-color: var(--app-surface-muted);
        }
        .btn--inverted.btn--secondary {
          color: #ffffff;
          background: transparent;
          border-color: rgba(255, 255, 255, 0.25);
        }
        .btn--inverted.btn--secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </Link>
  )
}
