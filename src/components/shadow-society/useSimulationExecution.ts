"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  getSimulation,
  streamSimulationEvents,
  type ExecutionEvent,
  type Simulation,
} from "@/data/api/server/debate"

export type StreamConnection =
  | "idle"
  | "connecting"
  | "live"
  | "reconnecting"
  | "completed"
  | "failed"

type Options = {
  simulationId?: string
  executionId?: string
  active: boolean
  onSnapshot: (simulation: Simulation) => void
  onCompleted: (simulation: Simulation) => void
  onFailed: (message: string) => void
}

export function useSimulationExecution({
  simulationId,
  executionId,
  active,
  onSnapshot,
  onCompleted,
  onFailed,
}: Options) {
  const [events, setEvents] = useState<ExecutionEvent[]>([])
  const [connection, setConnection] = useState<StreamConnection>("idle")
  const cursorRef = useRef(0)
  const callbacksRef = useRef({ onSnapshot, onCompleted, onFailed })
  callbacksRef.current = { onSnapshot, onCompleted, onFailed }

  const clear = useCallback(() => {
    cursorRef.current = 0
    setEvents([])
    setConnection("idle")
  }, [])

  useEffect(() => {
    if (!simulationId || !active) return
    const controller = new AbortController()
    let terminal = false
    let reconnectAttempt = 0

    cursorRef.current = 0
    setEvents([])

    const reconcile = async (completed = false) => {
      const snapshot = await getSimulation(simulationId)
      callbacksRef.current.onSnapshot(snapshot)
      if (completed || snapshot.status === "completed") {
        terminal = true
        setConnection("completed")
        callbacksRef.current.onCompleted(snapshot)
      } else if (snapshot.status === "failed") {
        terminal = true
        setConnection("failed")
        callbacksRef.current.onFailed(
          snapshot.error ?? "Simulation execution failed.",
        )
      }
    }

    const connect = async () => {
      setConnection("connecting")
      while (!controller.signal.aborted && !terminal) {
        try {
          setConnection(reconnectAttempt ? "reconnecting" : "live")
          cursorRef.current = await streamSimulationEvents({
            id: simulationId,
            after: cursorRef.current,
            signal: controller.signal,
            onHeartbeat: () => setConnection("live"),
            onEvent: (event) => {
              cursorRef.current = Math.max(cursorRef.current, event.sequence)
              setConnection("live")
              setEvents((current) =>
                current.some((item) => item.sequence === event.sequence)
                  ? current
                  : [...current, event].sort(
                      (a, b) => a.sequence - b.sequence,
                    ),
              )
              if (
                event.type === "round.completed" ||
                (event.type === "execution.completed" &&
                  (!executionId || event.executionId === executionId))
              ) {
                void reconcile(event.type === "execution.completed")
              } else if (
                event.type === "execution.failed" &&
                (!executionId || event.executionId === executionId)
              ) {
                terminal = true
                setConnection("failed")
                callbacksRef.current.onFailed(event.message)
              }
            },
          })
          if (!terminal && !controller.signal.aborted) {
            await reconcile()
          }
        } catch (error) {
          if (controller.signal.aborted || terminal) return
          reconnectAttempt += 1
          setConnection("reconnecting")
          if (reconnectAttempt % 3 === 0) {
            try {
              await reconcile()
            } catch {
              // The stream replay remains the primary recovery path.
            }
          }
          await new Promise((resolve) =>
            window.setTimeout(
              resolve,
              Math.min(5000, 600 * 2 ** Math.min(reconnectAttempt, 3)),
            ),
          )
          if (error instanceof Error && reconnectAttempt >= 8) {
            callbacksRef.current.onFailed(error.message)
          }
        }
      }
    }

    void connect()
    return () => controller.abort()
  }, [active, executionId, simulationId])

  return { events, connection, cursor: cursorRef.current, clear }
}
