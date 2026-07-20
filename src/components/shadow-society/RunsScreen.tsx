"use client"

import { useCallback, useEffect, useState } from "react"
import {
  fetchExecutionEvents,
  fetchRuns,
  getSimulation,
  type ExecutionEvent,
  type RunSummary,
  type Simulation,
} from "@/data/api/server/debate"
import { RunDetail } from "./RunDetail"

type Props = {
  onOpenLive: (simulation: Simulation) => void
}

export function RunsScreen({ onOpenLive }: Props) {
  const [runs, setRuns] = useState<RunSummary[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string>()
  const [simulation, setSimulation] = useState<Simulation>()
  const [events, setEvents] = useState<ExecutionEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string>()

  const loadRuns = useCallback(async (next?: string, append = false) => {
    setLoading(true)
    setError(undefined)
    try {
      const page = await fetchRuns(next)
      setRuns((current) => (append ? [...current, ...page.items] : page.items))
      setCursor(page.nextCursor)
      if (!append && page.items[0]) setSelectedId(page.items[0].id)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRuns()
  }, [loadRuns])

  useEffect(() => {
    if (!selectedId) {
      setSimulation(undefined)
      setEvents([])
      return
    }
    let cancelled = false
    setDetailLoading(true)
    Promise.all([
      getSimulation(selectedId),
      fetchExecutionEvents(selectedId, 0, 500),
    ])
      .then(([snapshot, history]) => {
        if (cancelled) return
        setSimulation(snapshot)
        setEvents(history.items)
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedId])

  return (
    <div className="ss-runs-layout">
      <aside className="ss-panel ss-panel--glass ss-runs-list">
        <header>
          <div>
            <h2>Runs</h2>
            <p>Persisted simulations and complete traces</p>
          </div>
          <button type="button" onClick={() => void loadRuns()}>
            Refresh
          </button>
        </header>

        {error && <div className="ss-error">{error}</div>}
        <div className="ss-run-rows">
          {runs.map((run) => (
            <button
              type="button"
              key={run.id}
              className={`ss-run-row ${selectedId === run.id ? "is-active" : ""}`}
              onClick={() => setSelectedId(run.id)}
            >
              <span className={`ss-run-state ss-run-state--${run.status}`}>
                {run.status}
              </span>
              <strong>{run.topic}</strong>
              <small>
                {run.mode} · {run.model} · {run.currentRound}/{run.totalRounds}
              </small>
              <time>{new Date(run.createdAt).toLocaleString("en-US")}</time>
            </button>
          ))}
          {!loading && !runs.length && (
            <p className="ss-muted">No runs saved yet.</p>
          )}
        </div>

        {cursor && (
          <button
            type="button"
            className="ss-runs-more"
            disabled={loading}
            onClick={() => void loadRuns(cursor, true)}
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        )}
      </aside>

      <div className="ss-panel ss-panel--glass ss-runs-detail-shell">
        {detailLoading && <p className="ss-muted">Loading run details…</p>}
        {!detailLoading && simulation && (
          <RunDetail
            simulation={simulation}
            events={events}
            onOpenLive={onOpenLive}
          />
        )}
        {!detailLoading && !simulation && (
          <p className="ss-muted">Select a run to inspect its raw data.</p>
        )}
      </div>
    </div>
  )
}
