type Props = {
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  className?: string
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  /** Primary CTA; default is neutral secondary. */
  variant?: "default" | "primary"
}

export default function Button({
  children,
  loading = false,
  disabled = false,
  className = "",
  onClick,
  type = "button",
  variant = "default",
}: Props) {
  const variantClass = variant === "primary" ? "btn--primary" : "btn--secondary"
  return (
    <button
      className={`btn ${variantClass} ${className}`.trim()}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
    >
      {loading ? (
        <span className="btn__loading">
          <span className="btn__spinner" aria-hidden />
          {children}
        </span>
      ) : (
        children
      )}
      <style jsx>{`
        .btn {
          width: 100%;
          padding: 0.625rem 1rem;
          margin-top: 0.25rem;
          font-family: var(--app-font);
          font-size: 0.9375rem;
          font-weight: 500;
          line-height: 1.25;
          border-radius: var(--app-radius);
          cursor: pointer;
          transition:
            background 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease,
            box-shadow 0.15s ease;
        }
        .btn--secondary {
          background: var(--app-surface);
          color: var(--app-text);
          border: 1px solid var(--app-border-strong);
        }
        .btn--secondary:hover:not(:disabled) {
          background: var(--app-surface-muted);
          border-color: var(--app-border-strong);
        }
        .btn--primary {
          margin-top: 0.5rem;
          background: var(--app-primary);
          color: #ffffff;
          border: 1px solid var(--app-primary);
        }
        .btn--primary:hover:not(:disabled) {
          background: var(--app-primary-hover);
          border-color: var(--app-primary-hover);
        }
        .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .btn__loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .btn__spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          opacity: 0.85;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </button>
  )
}
