"use client"

import type { Simulation } from "@/data/api/server/debate"
import { ROLE_LABEL } from "./agentVisuals"

type Props = {
  sim: Simulation
  onReset: () => void
  onBack: () => void
}

export function ResultsScreen({ sim, onReset, onBack }: Props) {
  const m = sim.metrics
  const defWins = sim.judgments.filter((j) => j.winner === "defender").length
  const accWins = sim.judgments.filter((j) => j.winner === "accuser").length

  const avg = (key: "persuasion" | "coherence" | "effectiveness") => {
    if (!sim.judgments.length) return 0
    const sum = sim.judgments.reduce(
      (s, j) => s + (j.defenderScore[key] + j.accuserScore[key]) / 2,
      0,
    )
    return Math.round((sum / sim.judgments.length) * 10) / 10
  }

  return (
    <section className="ss-panel ss-panel--glass ss-results">
      <div className="ss-panel-head">
        <h2>Results</h2>
        <p>
          {sim.config.mode === "shadow" ? "Shadow" : "Mirror"} ·{" "}
          {sim.config.model} · {sim.judgments.length} rounds
        </p>
      </div>
      {!!sim.warnings?.length && (
        <div className="ss-sim-warning" role="status">
          Mixed execution: {sim.warnings.length} Qwen fallback
          {sim.warnings.length === 1 ? "" : "s"}. These results are not a
          fully real-model experiment.
        </div>
      )}
      {!!sim.moderationEvents?.length && (
        <section className="ss-moderation-insights">
          <h3>Moderation insights</h3>
          <p className="ss-muted">
            Evidence-based classification of provider blocks. Underlying
            mechanisms are possibilities, not confirmed causes.
          </p>
          <div className="ss-moderation-list">
            {sim.moderationEvents.map((event, index) => (
              <article
                key={`${event.round}-${event.actor}-${event.requestId ?? index}`}
                className="ss-moderation-item"
              >
                <header>
                  Round {event.round} · {event.actor} · {event.provider}
                </header>
                <strong>Content moderation filter · high confidence</strong>
                <p>{event.explanation}</p>
                <small>
                  Possible factors:{" "}
                  {event.possibleUnderlyingMechanisms
                    .map((factor) => factor.replaceAll("_", " "))
                    .join(" · ")}
                </small>
                <small>
                  Provider code: {event.errorCode}
                  {event.requestId ? ` · Request ${event.requestId}` : ""}
                </small>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="ss-metrics-grid">
        <MetricCard
          label="Societal Reveal Index"
          value={m.societalRevealIndex ?? "—"}
          hint="Polarization / revealed bias proxy (v0)"
        />
        <MetricCard
          label="Moral Decay Score"
          value={m.moralDecayScore ?? "—"}
          hint="Higher in Shadow when persuasion beats coherence"
        />
        <MetricCard
          label="Final Audience"
          value={`${m.audienceGrowth.defender}% / ${m.audienceGrowth.accuser}%`}
          hint={`${ROLE_LABEL.defender} / ${ROLE_LABEL.accuser}`}
        />
        <MetricCard
          label="Convergence Speed"
          value={
            m.convergenceSpeedRounds != null
              ? `Round ${m.convergenceSpeedRounds}`
              : "No polarization"
          }
          hint="First round with audience split > 20"
        />
      </div>

      <div className="ss-compare">
        <h3>Average {ROLE_LABEL.judge} scores</h3>
        <div className="ss-bars-h">
          <Bar label="Persuasion" value={avg("persuasion")} max={10} color="#a78bfa" />
          <Bar label="Coherence" value={avg("coherence")} max={10} color="#38bdf8" />
          <Bar label="Effectiveness" value={avg("effectiveness")} max={10} color="#34d399" />
        </div>
        <p className="ss-muted">
          Round wins — {ROLE_LABEL.defender}: {defWins} · {ROLE_LABEL.accuser}:{" "}
          {accWins}
        </p>
      </div>

      <div className="ss-compare">
        <h3>Final audience</h3>
        <div className="ss-audience-bars ss-audience-bars--lg">
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

      <div className="ss-judgments-list">
        <h3>{ROLE_LABEL.judge} verdicts</h3>
        {sim.judgments.map((j) => (
          <div key={j.round} className="ss-judgment-item">
            <strong>
              R{j.round} ·{" "}
              {j.winner === "tie"
                ? "Tie"
                : j.winner === "defender"
                  ? ROLE_LABEL.defender
                  : ROLE_LABEL.accuser}
            </strong>
            <span>
              D {j.defenderScore.total} / A {j.accuserScore.total}
              {j.usedLlm ? " · LLM" : " · demo"}
            </span>
            <p>{j.rationale}</p>
          </div>
        ))}
      </div>

      <p className="ss-hint">
        Mirror vs Shadow across Qwen versions: run two simulations on the same
        topic and compare Moral Decay / Societal Reveal.
      </p>

      <div className="ss-actions">
        <button type="button" className="ss-btn" onClick={onBack}>
          Back to simulation
        </button>
        <button type="button" className="ss-btn ss-btn--primary" onClick={onReset}>
          New simulation
        </button>
      </div>
    </section>
  )
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint: string
}) {
  return (
    <div className="ss-metric-card">
      <span className="ss-metric-label">{label}</span>
      <strong className="ss-metric-value">{value}</strong>
      <span className="ss-metric-hint">{hint}</span>
    </div>
  )
}

function Bar({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="ss-hbar">
      <div className="ss-hbar-meta">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="ss-hbar-track">
        <div
          className="ss-hbar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}
