"use client"

import { useEffect, useRef, useState } from "react"
import type {
  AgentMessage,
  ExecutionEvent,
} from "@/data/api/server/debate"
import type { StreamConnection } from "./useSimulationExecution"

type Props = {
  events: ExecutionEvent[]
  messages: AgentMessage[]
  connection: StreamConnection
}

export function ExecutionConsole({
  events,
  messages,
  connection,
}: Props) {
  const [tab, setTab] = useState<"trace" | "messages">("trace")
  const [follow, setFollow] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!follow) return
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [events, messages, tab, follow])

  return (
    <aside className="ss-panel ss-panel--glass ss-execution-console">
      <header className="ss-console-head">
        <div>
          <h2>Execution console</h2>
          <span className={`ss-stream-status ss-stream-status--${connection}`}>
            {connection}
          </span>
        </div>
        <div className="ss-console-tabs" role="tablist">
          <button
            type="button"
            className={tab === "trace" ? "is-active" : ""}
            onClick={() => setTab("trace")}
          >
            Trace
          </button>
          <button
            type="button"
            className={tab === "messages" ? "is-active" : ""}
            onClick={() => setTab("messages")}
          >
            Messages
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="ss-terminal"
        onScroll={(event) => {
          const node = event.currentTarget
          setFollow(
            node.scrollHeight - node.scrollTop - node.clientHeight < 32,
          )
        }}
      >
        {tab === "trace" &&
          events.map((event) => (
            <article
              key={event.sequence}
              className={`ss-terminal-entry ss-terminal-entry--${event.level}`}
            >
              <header>
                <time>{formatTime(event.occurredAt)}</time>
                <span>#{event.sequence}</span>
                {event.round != null && <span>R{event.round}</span>}
                {event.actor && <strong>{event.actor}</strong>}
              </header>
              <p>
                <code>{event.type}</code> {event.message}
              </p>
              {event.details && (
                <details>
                  <summary>Raw details</summary>
                  <pre>{JSON.stringify(event.details, null, 2)}</pre>
                </details>
              )}
            </article>
          ))}

        {tab === "messages" &&
          messages.map((message) => (
            <article
              key={message.id}
              className={`ss-terminal-entry ss-terminal-message ss-terminal-message--${message.role}`}
            >
              <header>
                <time>{formatTime(message.createdAt)}</time>
                <span>R{message.round}</span>
                <strong>{message.agentName}</strong>
              </header>
              <p>{message.content}</p>
            </article>
          ))}

        {tab === "trace" && !events.length && (
          <p className="ss-terminal-empty">Waiting for execution events…</p>
        )}
        {tab === "messages" && !messages.length && (
          <p className="ss-terminal-empty">Waiting for agent messages…</p>
        )}
      </div>

      {!follow && (
        <button
          type="button"
          className="ss-console-follow"
          onClick={() => setFollow(true)}
        >
          Resume auto-scroll
        </button>
      )}
    </aside>
  )
}

function formatTime(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "--:--:--"
    : date.toLocaleTimeString("en-US", { hour12: false })
}
