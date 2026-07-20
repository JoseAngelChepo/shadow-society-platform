"use client"

type Props = {
  label: string
  tagColor: string
  className?: string
}

/** Floating light + label (no panel background). */
export function CylinderWindowTag({ label, tagColor, className }: Props) {
  return (
    <div className={className ?? "ss-role-viewport-tag"}>
      <span className="ss-role-name" style={{ color: tagColor }}>
        {label}
      </span>
      <span
        className="ss-role-swatch"
        style={{ backgroundColor: tagColor, color: tagColor }}
        aria-hidden
      />
    </div>
  )
}
