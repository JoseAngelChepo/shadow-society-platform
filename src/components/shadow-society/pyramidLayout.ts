import type { CylinderWindowSpec } from "./cylinder-window/types"

export type PyramidCell = {
  windowIndex: number
  id: string
  /** CSS pixels from left */
  x: number
  /** CSS pixels from top */
  y: number
  w: number
  h: number
}

/** Apex → base (ids must match {@link CylinderWindowSpec.id}) */
export const PYRAMID_ROWS: string[][] = [
  ["judge"],
  ["defender", "mediator", "accuser"],
  ["public-1", "public-2", "public-3", "public-4", "public-5"],
]

/**
 * Centered pyramid of compact square viewports.
 * Cell size shrinks so the widest row still fits the stage width.
 */
export function layoutPyramid(
  windows: Array<Pick<CylinderWindowSpec, "id">>,
  width: number,
  height: number,
): PyramidCell[] {
  const byId = new Map(windows.map((w, i) => [w.id, i]))
  const rows = PYRAMID_ROWS.map((row) =>
    row.filter((id) => byId.has(id)),
  ).filter((row) => row.length > 0)

  if (!rows.length || width < 1 || height < 1) return []

  const maxCols = Math.max(...rows.map((r) => r.length))
  const gap = Math.max(8, Math.min(width, height) * 0.014)
  const fitW = (width - gap * (maxCols - 1) - 16) / maxCols
  const fitH = (height - gap * (rows.length - 1) - 24) / rows.length
  const cell = Math.min(148, Math.max(64, Math.min(fitW, fitH, width * 0.18)))

  const totalH = rows.length * cell + (rows.length - 1) * gap
  // Bias upward so the bottom config dock does not cover the Public row
  const startY = Math.max(8, (height - totalH) * 0.22)

  const cells: PyramidCell[] = []
  rows.forEach((row, ri) => {
    const rowW = row.length * cell + (row.length - 1) * gap
    const startX = (width - rowW) / 2
    const y = startY + ri * (cell + gap)
    row.forEach((id, ci) => {
      cells.push({
        windowIndex: byId.get(id)!,
        id,
        x: startX + ci * (cell + gap),
        y,
        w: cell,
        h: cell,
      })
    })
  })
  return cells
}
