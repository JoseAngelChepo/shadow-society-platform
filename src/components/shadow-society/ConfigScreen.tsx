"use client"

import type { ConfigState } from "./ShadowSocietyApp"
import type { ModelOption } from "@/data/api/server/debate"

type Props = {
  config: ConfigState
  models: ModelOption[]
  loading: boolean
  onChange: (c: ConfigState) => void
  onLaunch: () => void
}

export function ConfigScreen({
  config,
  models,
  loading,
  onChange,
  onLaunch,
}: Props) {
  const set = <K extends keyof ConfigState>(key: K, value: ConfigState[K]) =>
    onChange({ ...config, [key]: value })

  const modelOptions = models.length
    ? models
    : [{ id: "qwen-plus", label: "Qwen Plus" }]

  return (
    <div className="ss-config-dock">
      <section className="ss-panel ss-panel--glass ss-config-bar">
        <label className="ss-field ss-field--topic">
          <span>Question</span>
          <textarea
            rows={2}
            value={config.topic}
            onChange={(e) => set("topic", e.target.value)}
            placeholder="Gray-area debate question…"
          />
        </label>

        <div className="ss-config-controls">
          <label className="ss-ctrl">
            <span className="ss-ctrl-label">Mode</span>
            <select
              className="ss-ctrl-input"
              value={config.mode}
              onChange={(e) =>
                set("mode", e.target.value as ConfigState["mode"])
              }
            >
              <option value="shadow">Shadow · persuasion</option>
              <option value="mirror">Mirror · ethics</option>
            </select>
          </label>

          <label className="ss-ctrl">
            <span className="ss-ctrl-label">Model</span>
            <select
              className="ss-ctrl-input"
              value={config.model}
              onChange={(e) => set("model", e.target.value)}
            >
              {modelOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <label className="ss-ctrl ss-ctrl--narrow">
            <span className="ss-ctrl-label">Speed</span>
            <select
              className="ss-ctrl-input"
              value={config.mutationSpeed}
              onChange={(e) =>
                set(
                  "mutationSpeed",
                  e.target.value as ConfigState["mutationSpeed"],
                )
              }
            >
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </label>

          <label className="ss-ctrl ss-ctrl--xs">
            <span className="ss-ctrl-label">Rounds</span>
            <select
              className="ss-ctrl-input"
              value={config.totalRounds}
              onChange={(e) => set("totalRounds", Number(e.target.value))}
            >
              {[3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label className="ss-ctrl ss-ctrl--grow">
            <span className="ss-ctrl-label">
              Mutation <strong>{config.mutationIntensity}%</strong>
            </span>
            <input
              className="ss-ctrl-input"
              type="range"
              min={0}
              max={100}
              value={config.mutationIntensity}
              onChange={(e) =>
                set("mutationIntensity", Number(e.target.value))
              }
            />
          </label>

          <label className="ss-ctrl ss-ctrl--auto">
            <span className="ss-ctrl-label" aria-hidden>
              &nbsp;
            </span>
            <span className="ss-ctrl-input ss-ctrl-check">
              <input
                type="checkbox"
                checked={config.publicInfluence}
                onChange={(e) => set("publicInfluence", e.target.checked)}
              />
              Public
            </span>
          </label>

          <div className="ss-ctrl ss-ctrl--auto">
            <span className="ss-ctrl-label" aria-hidden>
              &nbsp;
            </span>
            <button
              type="button"
              className="ss-ctrl-input ss-ctrl-run"
              disabled={loading || config.topic.trim().length < 5}
              onClick={onLaunch}
            >
              {loading ? "Running…" : "Run"}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
