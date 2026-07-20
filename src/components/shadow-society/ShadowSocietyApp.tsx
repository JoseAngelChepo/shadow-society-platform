"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import {
  advanceSimulation,
  checkApiHealth,
  createSimulation,
  fetchModels,
  startSimulationRun,
  type DebateMode,
  type ModelOption,
  type MutationSpeed,
  type Simulation,
} from "@/data/api/server/debate"
import { ConfigScreen } from "./ConfigScreen"
import { SimulationScreen } from "./SimulationScreen"
import { ResultsScreen } from "./ResultsScreen"
import { RunsScreen } from "./RunsScreen"
import {
  idleCylinderWindows,
  simulationCylinderWindows,
} from "./cylinderWindowsFromSim"
import { useSimulationExecution } from "./useSimulationExecution"

const CylinderPyramid = dynamic(
  () =>
    import("./cylinder-window").then((m) => m.CylinderPyramid),
  { ssr: false },
)

export type Screen = "config" | "simulation" | "results" | "runs"

export type ConfigState = {
  topic: string
  model: string
  mode: DebateMode
  mutationIntensity: number
  publicInfluence: boolean
  mutationSpeed: MutationSpeed
  totalRounds: number
}

const DEFAULT_CONFIG: ConfigState = {
  topic:
    "Should governments prioritize economic growth over data privacy?",
  model: "qwen-plus",
  mode: "shadow",
  mutationIntensity: 40,
  publicInfluence: true,
  mutationSpeed: "normal",
  totalRounds: 5,
}

const STAGES: Array<{
  id: Screen
  label: string
  hint: string
}> = [
  { id: "config", label: "Config", hint: "Set up the debate" },
  { id: "simulation", label: "Simulating", hint: "Agents are debating" },
  { id: "results", label: "Results", hint: "Run finished" },
  { id: "runs", label: "Runs", hint: "Saved history" },
]

export default function ShadowSocietyApp() {
  const [screen, setScreen] = useState<Screen>("config")
  const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG)
  const [models, setModels] = useState<ModelOption[]>([])
  const [sim, setSim] = useState<Simulation | null>(null)
  const [executionId, setExecutionId] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<{ ok: boolean; llm: string }>({
    ok: false,
    llm: "unknown",
  })

  useEffect(() => {
    const refresh = () => {
      void checkApiHealth().then(setApiStatus)
    }
    refresh()
    void fetchModels().then(setModels)
    const id = window.setInterval(refresh, 15000)
    return () => window.clearInterval(id)
  }, [])

  const windows = useMemo(() => {
    if (sim) return simulationCylinderWindows(sim)
    return idleCylinderWindows(config.mode)
  }, [sim, config.mode])

  const activeStage: Screen = loading ? "simulation" : screen

  const handleExecutionSnapshot = useCallback((snapshot: Simulation) => {
    setSim(snapshot)
  }, [])

  const handleExecutionCompleted = useCallback((snapshot: Simulation) => {
    setSim(snapshot)
    setLoading(false)
    setScreen("results")
  }, [])

  const handleExecutionFailed = useCallback((message: string) => {
    setLoading(false)
    setError(message)
    setScreen("simulation")
  }, [])

  const execution = useSimulationExecution({
    simulationId: sim?.id,
    executionId,
    active: loading && !!sim,
    onSnapshot: handleExecutionSnapshot,
    onCompleted: handleExecutionCompleted,
    onFailed: handleExecutionFailed,
  })

  const launch = useCallback(async () => {
    setError(null)
    setLoading(true)
    setScreen("simulation")
    try {
      const created = await createSimulation({
        topic: config.topic,
        model: config.model,
        mode: config.mode,
        mutations: {
          intensity: config.mutationIntensity,
          publicInfluence: config.publicInfluence,
          speed: config.mutationSpeed,
        },
        totalRounds: config.totalRounds,
      })
      setSim(created)
      const run = await startSimulationRun(created.id)
      setExecutionId(run.executionId)
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Could not start the simulation. Is the API running?"
      setError(message)
      setScreen("config")
      setLoading(false)
    }
  }, [config])

  const stepRound = useCallback(async () => {
    if (!sim) return
    setLoading(true)
    setError(null)
    try {
      const next = await advanceSimulation(sim.id, false)
      setSim(next)
      if (next.status === "completed") setScreen("results")
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [sim])

  const reset = useCallback(() => {
    setSim(null)
    setExecutionId(undefined)
    setError(null)
    setScreen("config")
    execution.clear()
  }, [execution.clear])

  const openLiveRun = useCallback((snapshot: Simulation) => {
    setSim(snapshot)
    setExecutionId(snapshot.executionId)
    setError(null)
    setLoading(snapshot.status === "running")
    setScreen("simulation")
  }, [])

  const stageIndex = STAGES.findIndex((s) => s.id === activeStage)

  return (
    <div className="ss-app">
      <div className="ss-scene-stage">
        <CylinderPyramid windows={windows} />
        <div className="ss-scene-vignette" aria-hidden />
      </div>

      <div className="ss-chrome">
        <header className="ss-header ss-header--centered">
          <div className="ss-header-center">
            <div className="ss-brand ss-brand--center">
              <h1 className="ss-title">Shadow Society</h1>
            </div>
            <nav className="ss-stages" aria-label="Pipeline stages">
              {STAGES.map((stage, i) => {
                const done = i < stageIndex
                const active = activeStage === stage.id
                const reachable =
                  stage.id === "config" ||
                  stage.id === "runs" ||
                  (stage.id === "simulation" && !!sim) ||
                  (stage.id === "results" && sim?.status === "completed")

                return (
                  <button
                    key={stage.id}
                    type="button"
                    disabled={!reachable && !active}
                    className={[
                      "ss-stage",
                      active ? "ss-stage--active" : "",
                      done ? "ss-stage--done" : "",
                      loading && stage.id === "simulation" ? "ss-stage--busy" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      if (stage.id === "config") setScreen("config")
                      if (stage.id === "simulation" && sim) setScreen("simulation")
                      if (stage.id === "results" && sim?.status === "completed")
                        setScreen("results")
                      if (stage.id === "runs") setScreen("runs")
                    }}
                  >
                    <span className="ss-stage-index">{i + 1}</span>
                    <span className="ss-stage-copy">
                      <strong>{stage.label}</strong>
                      <small>{stage.hint}</small>
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>
        </header>

        {error && (
          <div className="ss-error" role="alert">
            {error}
          </div>
        )}

        <main className={`ss-main ss-main--${screen}`}>
          {screen === "config" && (
            <ConfigScreen
              config={config}
              models={models}
              loading={loading}
              onChange={setConfig}
              onLaunch={launch}
            />
          )}
          {screen === "simulation" && sim && (
            <SimulationScreen
              sim={sim}
              loading={loading}
              events={execution.events}
              connection={execution.connection}
              onStep={stepRound}
              onViewResults={() => setScreen("results")}
            />
          )}
          {screen === "results" && sim && (
            <ResultsScreen
              sim={sim}
              onReset={reset}
              onBack={() => setScreen("simulation")}
            />
          )}
          {screen === "runs" && <RunsScreen onOpenLive={openLiveRun} />}
        </main>

        <footer className="ss-footer">
          <span>Qwen Cloud Global AI Hackathon 2026 · Agent Society</span>
          <button
            type="button"
            className={`ss-api-chip ${apiStatus.ok ? "ss-api-chip--ok" : "ss-api-chip--down"}`}
            onClick={() => {
              void checkApiHealth().then(setApiStatus)
            }}
            title="Refresh API health"
          >
            {apiStatus.ok
              ? `API online · LLM ${apiStatus.llm === "configured" ? "ready" : apiStatus.llm}`
              : "API offline"}
          </button>
        </footer>
      </div>
    </div>
  )
}
