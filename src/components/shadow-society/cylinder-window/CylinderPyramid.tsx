"use client"

import { CylinderWindowsStage } from "./CylinderWindowsStage"
import type { CylinderWindowSpec } from "./types"

export type CylinderPyramidWindow = CylinderWindowSpec

type Props = {
  /** Independent window specs — one object per cylinder. */
  windows: CylinderWindowSpec[]
  className?: string
}

/**
 * Pyramid layout (Judge → Defender/Accuser → Mediator/Public)
 * backed by a single efficient WebGL stage.
 */
export function CylinderPyramid({ windows, className }: Props) {
  return <CylinderWindowsStage windows={windows} className={className} />
}
