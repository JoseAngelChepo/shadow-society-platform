/** Visual + motion config for one independent cylinder window. */
export type CylinderMotionMode = "idle" | "active"

export type CylinderWindowSpec = {
  /** Stable id (also used for pyramid placement) */
  id: string
  /** Tag text above the pedestal */
  label: string
  /** Glowing tag / light color */
  tagColor: string
  /** Cylinder body (`#rrggbb` or 0xrrggbb) */
  cylinderColor: string | number
  /** Pedestal coin color — defaults to tagColor */
  pedestalColor?: string | number
  mode?: CylinderMotionMode
  tiltX?: number
  tiltZ?: number
  spin?: number
  scale?: [number, number, number]
}

/** @deprecated Prefer {@link CylinderWindowSpec} */
export type CylinderWindowProps = Omit<CylinderWindowSpec, "id"> & {
  id?: string
  className?: string
  style?: import("react").CSSProperties
}

export function toCssHex(color: string | number): string {
  if (typeof color === "string") return color
  return `#${color.toString(16).padStart(6, "0")}`
}

export function toThreeHex(color: string | number): number {
  if (typeof color === "number") return color
  const cleaned = color.trim().replace("#", "")
  return Number.parseInt(cleaned, 16)
}

export const DEFAULT_CYLINDER_SCALE: [number, number, number] = [0.5, 1.05, 0.5]
