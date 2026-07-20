import type {
  ExecutionEvent,
  Simulation,
} from "@/data/api/server/debate"

type Props = {
  simulation: Simulation
  events: ExecutionEvent[]
  onOpenLive: (simulation: Simulation) => void
}

export function RunDetail({
  simulation,
  events,
  onOpenLive,
}: Props) {
  return (
    <section className="ss-run-detail">
      <header className="ss-run-detail-head">
        <div>
          <span>{simulation.status}</span>
          <h2>{simulation.config.topic}</h2>
          <p>
            {simulation.config.mode} · {simulation.config.model} ·{" "}
            {simulation.currentRound}/{simulation.config.totalRounds} rounds
          </p>
        </div>
        {simulation.status === "running" && (
          <button
            type="button"
            className="ss-btn ss-btn--primary"
            onClick={() => onOpenLive(simulation)}
          >
            Open live execution
          </button>
        )}
      </header>

      <div className="ss-run-facts">
        <Fact label="Created" value={formatDate(simulation.createdAt)} />
        <Fact label="Updated" value={formatDate(simulation.updatedAt)} />
        <Fact
          label="Warnings"
          value={String(simulation.warnings?.length ?? 0)}
        />
        <Fact
          label="Moderation"
          value={String(simulation.moderationEvents?.length ?? 0)}
        />
      </div>

      <section className="ss-run-section">
        <h3>Judgments</h3>
        {simulation.judgments.map((judgment) => (
          <article key={judgment.round} className="ss-run-record">
            <strong>
              Round {judgment.round} · {judgment.winner}
            </strong>
            <span>
              Defender {judgment.defenderScore.total} / Accuser{" "}
              {judgment.accuserScore.total}
            </span>
            <p>{judgment.rationale}</p>
          </article>
        ))}
        {!simulation.judgments.length && (
          <p className="ss-muted">No judgments persisted yet.</p>
        )}
      </section>

      <section className="ss-run-section">
        <h3>Raw agent transcript</h3>
        {simulation.messages.map((message) => (
          <article key={message.id} className="ss-run-record">
            <strong>
              {message.agentName} · Round {message.round}
            </strong>
            <p>{message.content}</p>
          </article>
        ))}
        {!simulation.messages.length && (
          <p className="ss-muted">No messages persisted yet.</p>
        )}
      </section>

      <section className="ss-run-section">
        <h3>Public votes</h3>
        {simulation.mutations.flatMap((mutation) =>
          (mutation.publicVotes ?? []).map((vote) => (
            <article
              key={`${mutation.round}-${vote.voter}`}
              className="ss-run-record"
            >
              <strong>
                Round {mutation.round} · Public {vote.voter} ·{" "}
                {vote.favoredSide}
              </strong>
              <p>{vote.reason}</p>
            </article>
          )),
        )}
        {!simulation.mutations.some(
          (mutation) => mutation.publicVotes?.length,
        ) && <p className="ss-muted">No public votes persisted yet.</p>}
      </section>

      <section className="ss-run-section">
        <h3>Structured execution trace</h3>
        {events.map((event) => (
          <details key={event.sequence} className="ss-run-event">
            <summary>
              #{event.sequence} · {event.type} · {event.message}
            </summary>
            <pre>{JSON.stringify(event, null, 2)}</pre>
          </details>
        ))}
        {!events.length && (
          <p className="ss-muted">No execution trace persisted.</p>
        )}
      </section>
    </section>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function formatDate(value?: string): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-US")
}
