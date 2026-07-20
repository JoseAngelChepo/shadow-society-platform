import type { DebateMode, Simulation } from "@/data/api/server/debate"
import type { CylinderWindowSpec } from "./cylinder-window"
import { ROLE_BADGE_CSS, ROLE_LABEL, type AgentRole } from "./agentVisuals"

const ROLE_BASE: Record<
  AgentRole,
  { color: number; badge: number; scale: [number, number, number] }
> = {
  judge: { color: 0xc4b5fd, badge: 0xa78bfa, scale: [0.55, 1.15, 0.55] },
  defender: { color: 0x7dd3fc, badge: 0x60a5fa, scale: [0.5, 1.05, 0.5] },
  accuser: { color: 0xf9a8d4, badge: 0xf472b6, scale: [0.5, 1.05, 0.5] },
  public: { color: 0x6ee7b7, badge: 0x34d399, scale: [0.62, 0.85, 0.62] },
  mediator: { color: 0x67e8f9, badge: 0x38bdf8, scale: [0.42, 0.95, 0.42] },
}

/** Five independent Public agent windows (crowd row). */
export const PUBLIC_AGENT_COUNT = 5

export function publicAgentId(index: number): string {
  return `public-${index + 1}`
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

/** Build one independent window spec — no nested props. */
export function cylinderWindow(spec: CylinderWindowSpec): CylinderWindowSpec {
  return spec
}

function windowFor(
  role: AgentRole,
  patch: Partial<CylinderWindowSpec> & { id?: string; cylinderColor: number },
): CylinderWindowSpec {
  const base = ROLE_BASE[role]
  return cylinderWindow({
    id: patch.id ?? role,
    label: ROLE_LABEL[role],
    tagColor: ROLE_BADGE_CSS[role],
    pedestalColor: base.badge,
    scale: base.scale,
    tiltX: 0,
    tiltZ: 0,
    spin: 1,
    mode: "idle",
    ...patch,
  })
}

function publicWindows(
  mode: DebateMode,
  makeActive?: (index: number) => Partial<CylinderWindowSpec>,
): CylinderWindowSpec[] {
  const base = ROLE_BASE.public
  return Array.from({ length: PUBLIC_AGENT_COUNT }, (_, i) => {
    const scaleMul = 0.92 + (i % 3) * 0.04
    const idle = windowFor("public", {
      id: publicAgentId(i),
      label: `${ROLE_LABEL.public} ${i + 1}`,
      cylinderColor: base.color,
      scale: [base.scale[0] * scaleMul, base.scale[1], base.scale[2] * scaleMul],
      spin: (mode === "shadow" ? 1.15 : 1) * (0.85 + i * 0.08),
      mode: "idle",
    })
    if (!makeActive) return idle
    return { ...idle, ...makeActive(i) }
  })
}

export function idleCylinderWindows(mode: DebateMode): CylinderWindowSpec[] {
  const core: AgentRole[] = ["judge", "defender", "mediator", "accuser"]
  return [
    ...core.map((role) =>
      windowFor(role, {
        cylinderColor: ROLE_BASE[role].color,
        spin: mode === "shadow" ? 1.15 : 1,
        mode: "idle",
      }),
    ),
    ...publicWindows(mode),
  ]
}

export function simulationCylinderWindows(
  sim: Simulation,
): CylinderWindowSpec[] {
  const last = sim.judgments[sim.judgments.length - 1]
  const audienceLean =
    (sim.audience.accuser - sim.audience.defender) / 100
  const scoreLean = last
    ? clamp((last.accuserScore.total - last.defenderScore.total) / 20, -1, 1)
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
    id?: string,
  ): CylinderWindowSpec => {
    const base = ROLE_BASE[role]
    const lean = clamp(Math.abs(inclination), 0, 1)
    const color = lerpColor(base.color, leanToward, lean * 0.55)
    const tiltAmp = 0.55 + intensity * 0.45
    return windowFor(role, {
      ...(id ? { id } : {}),
      cylinderColor:
        role === "judge" ? lerpColor(color, modeTint, 0.35) : color,
      tiltX: inclination * tiltAmp * 0.35,
      tiltZ: -inclination * tiltAmp,
      spin: 0.55 + lean * 1.4 + (sim.status === "running" ? 0.4 : 0),
      mode: "active",
    })
  }

  const leanColor =
    publicIncl >= 0 ? ROLE_BASE.accuser.color : ROLE_BASE.defender.color
  const latestPublicVotes =
    sim.mutations[sim.mutations.length - 1]?.publicVotes ?? []

  return [
    make("judge", judgeIncl, modeTint),
    make("defender", defenderIncl, ROLE_BASE.defender.color),
    make("mediator", mediatorIncl, ROLE_BASE.mediator.color),
    make("accuser", accuserIncl, ROLE_BASE.accuser.color),
    ...publicWindows(sim.config.mode, (i) => {
      const vote = latestPublicVotes[i]
      const jitter = (i - 2) * 0.12
      const individualLean = vote
        ? vote.favoredSide === "accuser"
          ? 0.78
          : -0.78
        : publicIncl
      const incl = clamp(individualLean + jitter * 0.2, -1, 1)
      const lean = clamp(Math.abs(incl), 0, 1)
      const tiltAmp = 0.55 + intensity * 0.45
      const base = ROLE_BASE.public
      const scaleMul = 0.92 + (i % 3) * 0.04
      const individualColor =
        incl >= 0 ? ROLE_BASE.accuser.color : ROLE_BASE.defender.color
      return {
        cylinderColor: lerpColor(
          base.color,
          vote ? individualColor : leanColor,
          lean * 0.55,
        ),
        tiltX: incl * tiltAmp * 0.35,
        tiltZ: -incl * tiltAmp,
        spin: 0.55 + lean * 1.4 + (sim.status === "running" ? 0.4 : 0) + i * 0.06,
        scale: [
          base.scale[0] * scaleMul,
          base.scale[1],
          base.scale[2] * scaleMul,
        ],
        mode: "active" as const,
      }
    }),
  ]
}
