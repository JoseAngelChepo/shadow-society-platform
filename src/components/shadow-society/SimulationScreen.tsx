"use client"

import type {
  ExecutionEvent,
  Simulation,
} from "@/data/api/server/debate"
import { ROLE_LABEL, type AgentRole } from "./agentVisuals"
import { ExecutionConsole } from "./ExecutionConsole"
import type { StreamConnection } from "./useSimulationExecution"

type Props = {
  sim: Simulation
  loading: boolean
  events: ExecutionEvent[]
  connection: StreamConnection
  onStep: () => void
  onViewResults: () => void
}

const ROLE_RULES: Record<AgentRole, string> = {
  judge: "Scores the round for Shadow or Mirror criteria.",
  defender: "Argues for the claim · blue cylinder.",
  accuser: "Argues against · pink cylinder.",
  public: "Five voters · green; each tilts with audience lean.",
  mediator: "Balance · cyan · sits between Agent Defender and Agent Accuser.",
}

export function SimulationScreen({
  sim,
  loading,
  events,
  connection,
  onStep,
  onViewResults,
}: Props) {
  const lastJudgment = sim.judgments[sim.judgments.length - 1]

  return (
    <div className="ss-sim-layout">
      <aside className="ss-panel ss-panel--glass ss-side">
        <h2>Roles</h2>
        <div className={`ss-mode-badge ss-mode-badge--${sim.config.mode}`}>
          {sim.config.mode === "shadow" ? "Shadow Mode" : "Mirror Mode"}
        </div>
        <p className="ss-side-topic">{sim.config.topic}</p>
        <ul className="ss-roles">
          {(
            Object.entries(ROLE_RULES) as [AgentRole, string][]
          ).map(([role, desc]) => (
            <li key={role}>
              <strong>{ROLE_LABEL[role]}</strong>
              <span>{desc}</span>
            </li>
          ))}
        </ul>
        {lastJudgment && (
          <div className="ss-judge-card">
            <h3>Latest verdict</h3>
            <p className="ss-winner">
              R{lastJudgment.round}:{" "}
              {lastJudgment.winner === "tie"
                ? "Tie"
                : lastJudgment.winner === "defender"
                  ? ROLE_LABEL.defender
                  : ROLE_LABEL.accuser}
              {lastJudgment.usedLlm ? " · LLM" : " · demo"}
            </p>
            <p className="ss-rationale">{lastJudgment.rationale}</p>
          </div>
        )}

        <div className="ss-audience">
          <div className="ss-audience-label">
            <span>D {sim.audience.defender}%</span>
            <span>A {sim.audience.accuser}%</span>
          </div>
          <div className="ss-audience-bars">
            <div
              className="ss-bar ss-bar--def"
              style={{ width: `${sim.audience.defender}%` }}
            />
            <div
              className="ss-bar ss-bar--acc"
              style={{ width: `${sim.audience.accuser}%` }}
            />
          </div>
        </div>

        <p className="ss-round-meta">
          Round {sim.currentRound}/{sim.config.totalRounds} · {sim.status}
        </p>
        {!!sim.warnings?.length && (
          <div className="ss-sim-warning" role="status">
            Mixed execution: {sim.warnings.length} Qwen fallback
            {sim.warnings.length === 1 ? "" : "s"}. Do not treat this run as a
            fully real-model experiment.
          </div>
        )}

        <div className="ss-actions">
          {sim.status !== "completed" && (
            <button
              type="button"
              className="ss-btn ss-btn--primary"
              disabled={loading}
              onClick={onStep}
            >
              {loading ? "Processing…" : "Next round"}
            </button>
          )}
          {sim.status === "completed" && (
            <button
              type="button"
              className="ss-btn ss-btn--primary"
              onClick={onViewResults}
            >
              View results
            </button>
          )}
        </div>
      </aside>

      <div className="ss-sim-spacer" aria-hidden />

      <ExecutionConsole
        events={events}
        messages={sim.messages}
        connection={connection}
      />
    </div>
  )
}
