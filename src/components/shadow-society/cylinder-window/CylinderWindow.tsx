"use client"

import type { CylinderWindowSpec } from "./types"
import { CylinderWindowTag } from "./CylinderWindowTag"
import { toCssHex } from "./types"

type Props = CylinderWindowSpec & {
  className?: string
  style?: React.CSSProperties
}

/**
 * Declarative window unit (props only).
 * Visual rendering of many windows is handled efficiently by {@link CylinderWindowsStage}.
 * This component is useful for previews / single-window UI chrome.
 */
export function CylinderWindow({
  label,
  tagColor,
  className,
  style,
}: Props) {
  return (
    <div className={className ?? "ss-cylinder-window"} style={style}>
      <CylinderWindowTag label={label} tagColor={toCssHex(tagColor)} />
    </div>
  )
}
