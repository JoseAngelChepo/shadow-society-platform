import type { DebateMode, Simulation } from "@/data/api/server/debate"

export type AgentRole =
  | "judge"
  | "defender"
  | "accuser"
  | "public"
  | "mediator"

/** Inclination in [-1, 1]: negative → defender lean, positive → accuser lean. */
export type AgentVisual = {
  id: string
  role: AgentRole
  label: string
  /** World position (centered per window; isolation via camera layers) */
  position: [number, number, number]
  /** Scale of the cylinder */
  scale: [number, number, number]
  /** Cylinder body color */
  color: number
  /** Label / pedestal accent (role identity, independent of lean tint) */
  badgeColor: number
  /** Extra tilt on X/Z from inclination (radians) */
  tiltX: number
  tiltZ: number
  /** Spin speed multiplier while active */
  spin: number
}

const ROLE_BASE: Record<
  AgentRole,
  {
    color: number
    badge: number
    /** Relative visual weight in its own window */
    scale: [number, number, number]
  }
> = {
  judge: {
    color: 0xc4b5fd,
    badge: 0xa78bfa,
    scale: [0.55, 1.15, 0.55],
  },
  defender: {
    color: 0x7dd3fc,
    badge: 0x60a5fa,
    scale: [0.5, 1.05, 0.5],
  },
  accuser: {
    color: 0xf9a8d4,
    badge: 0xf472b6,
    scale: [0.5, 1.05, 0.5],
  },
  public: {
    color: 0x6ee7b7,
    badge: 0x34d399,
    scale: [0.62, 0.85, 0.62],
  },
  mediator: {
    color: 0x67e8f9,
    badge: 0x38bdf8,
    scale: [0.42, 0.95, 0.42],
  },
}

export const ROLE_LABEL: Record<AgentRole, string> = {
  judge: "Agent Judge",
  defender: "Agent Defender",
  accuser: "Agent Accuser",
  public: "Agent Public",
  mediator: "Agent Mediator",
}

export const ROLE_BADGE_CSS: Record<AgentRole, string> = {
  judge: "#a78bfa",
  defender: "#60a5fa",
  accuser: "#f472b6",
  public: "#34d399",
  mediator: "#38bdf8",
}

/** Idle: one role-colored cylinder per window, default spin. */
export function idleAgentVisuals(mode: DebateMode): AgentVisual[] {
  const roles: AgentRole[] = ["judge", "defender", "accuser", "mediator", "public"]
  return roles.map((role) => {
    const base = ROLE_BASE[role]
    return {
      id: role,
      role,
      label: ROLE_LABEL[role],
      position: [0, 0, 0],
      scale: base.scale,
      color: base.color,
      badgeColor: base.badge,
      tiltX: 0,
      tiltZ: 0,
      spin: mode === "shadow" ? 1.15 : 1,
    }
  })
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function lerpColor(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff
  const ag = (a >> 8) & 0xff
  const ab = a & 0xff
  const br = (b >> 16) & 0xff
  const bg = (b >> 8) & 0xff
  const bb = b & 0xff
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return (r << 16) | (g << 8) | bl
}

/**
 * Active: keep role badge; cylinder lean-tints from scores / audience.
 */
export function simulationAgentVisuals(sim: Simulation): AgentVisual[] {
  const last = sim.judgments[sim.judgments.length - 1]
  const audienceLean =
    (sim.audience.accuser - sim.audience.defender) / 100

  const scoreLean = last
    ? clamp(
        (last.accuserScore.total - last.defenderScore.total) / 20,
        -1,
        1,
      )
    : 0

  const intensity = sim.config.mutations.intensity / 100
  const modeTint = sim.config.mode === "shadow" ? 0xa78bfa : 0x38bdf8

  const defenderIncl = clamp(-scoreLean - audienceLean * 0.35, -1, 1)
  const accuserIncl = clamp(scoreLean + audienceLean * 0.35, -1, 1)
  const publicIncl = clamp(audienceLean, -1, 1)
  const judgeIncl = clamp(scoreLean * 0.4, -1, 1)
  const mediatorIncl = clamp(audienceLean * 0.5 * intensity, -1, 1)

  const make = (
    role: AgentRole,
    inclination: number,
    leanToward: number,
  ): AgentVisual => {
    const base = ROLE_BASE[role]
    const lean = clamp(Math.abs(inclination), 0, 1)
    // Body shifts with lean; badge stays role identity
    const color = lerpColor(base.color, leanToward, lean * 0.55)
    const tiltAmp = 0.55 + intensity * 0.45
    return {
      id: role,
      role,
      label: ROLE_LABEL[role],
      position: [0, 0, 0],
      scale: base.scale,
      color: role === "judge" ? lerpColor(color, modeTint, 0.35) : color,
      badgeColor: base.badge,
      tiltX: inclination * tiltAmp * 0.35,
      tiltZ: -inclination * tiltAmp,
      spin: 0.55 + lean * 1.4 + (sim.status === "running" ? 0.4 : 0),
    }
  }

  return [
    make("judge", judgeIncl, modeTint),
    make("defender", defenderIncl, ROLE_BASE.defender.color),
    make("accuser", accuserIncl, ROLE_BASE.accuser.color),
    make("mediator", mediatorIncl, ROLE_BASE.mediator.color),
    make(
      "public",
      publicIncl,
      publicIncl >= 0 ? ROLE_BASE.accuser.color : ROLE_BASE.defender.color,
    ),
  ]
}
