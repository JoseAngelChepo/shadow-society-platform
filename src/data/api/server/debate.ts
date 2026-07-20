import { ApiServices } from "@/data/api/server/config"
import {
  NEXT_PUBLIC_API_BASIC_AUTH,
  NEXT_PUBLIC_API_URL,
} from "@/config/env"

export type DebateMode = "mirror" | "shadow"
export type MutationSpeed = "fast" | "normal"

export type MutationConfig = {
  intensity: number
  publicInfluence: boolean
  speed: MutationSpeed
}

export type CreateSimulationPayload = {
  topic: string
  model: string
  mode: DebateMode
  mutations: MutationConfig
  totalRounds?: number
}

export type ScoreBreakdown = {
  persuasion: number
  coherence: number
  effectiveness: number
  contradictionPenalty: number
  total: number
}

export type RoundJudgment = {
  round: number
  defenderScore: ScoreBreakdown
  accuserScore: ScoreBreakdown
  winner: "defender" | "accuser" | "tie"
  rationale: string
  mode: DebateMode
  usedLlm: boolean
  fallback?: {
    errorCode: string
    requestId?: string
    moderationBlocked: boolean
  }
}

export type AgentMessage = {
  id: string
  round: number
  role: string
  agentName: string
  content: string
  createdAt: string
}

export type AudienceState = {
  defender: number
  accuser: number
}

export type SimulationMetrics = {
  societalRevealIndex: number | null
  moralDecayScore: number | null
  audienceGrowth: AudienceState
  convergenceSpeedRounds: number | null
  averagePersuasionShadow?: number | null
  averageCoherenceMirror?: number | null
}

export type Simulation = {
  id: string
  status: "configured" | "running" | "completed" | "failed"
  config: {
    topic: string
    model: string
    mode: DebateMode
    mutations: MutationConfig
    totalRounds: number
  }
  currentRound: number
  messages: AgentMessage[]
  judgments: RoundJudgment[]
  mutations: Array<{
    round: number
    favoredSide: "defender" | "accuser"
    temperatureBoost: number
    promptHint: string
    audience: AudienceState
    publicVotes?: Array<{
      voter: number
      favoredSide: "defender" | "accuser"
      reason: string
    }>
  }>
  audience: AudienceState
  metrics: SimulationMetrics
  eventSequence?: number
  executionId?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  error?: string
  warnings?: string[]
  moderationEvents?: Array<{
    round: number
    actor: "defender" | "accuser" | "mediator" | "judge" | "public"
    provider: "dashscope"
    errorCode: string
    requestId?: string
    primaryCategory: "content_moderation_filter"
    confidence: "high"
    inspectionStage: "input_or_output_unknown"
    explanation: string
    possibleUnderlyingMechanisms: Array<
      "safety_alignment" | "corporate_policy" | "contextual_risk_detection"
    >
    occurredAt: string
  }>
}

export type ModelOption = { id: string; label: string }

export type ExecutionEventLevel = "debug" | "info" | "warn" | "error"

export type ExecutionEvent = {
  simulationId: string
  executionId: string
  sequence: number
  type: string
  level: ExecutionEventLevel
  phase: string
  actor?: string
  round?: number
  message: string
  details?: Record<string, unknown>
  schemaVersion: number
  occurredAt: string
}

export type RunSummary = {
  id: string
  topic: string
  mode: DebateMode
  model: string
  status: Simulation["status"]
  currentRound: number
  totalRounds: number
  finalWinner: "defender" | "accuser" | "tie" | null
  warningCount: number
  moderationCount: number
  metrics: SimulationMetrics
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export type RunPage = {
  items: RunSummary[]
  nextCursor: string | null
}

export async function fetchModels(): Promise<ModelOption[]> {
  try {
    const { data } = await ApiServices.get<{ models: ModelOption[] }>(
      "/debate/models",
    )
    return data.models
  } catch {
    return [
      { id: "qwen-plus", label: "Qwen Plus (default)" },
      { id: "qwen-turbo", label: "Qwen Turbo" },
      { id: "qwen-max", label: "Qwen Max" },
    ]
  }
}

export async function createSimulation(
  payload: CreateSimulationPayload,
): Promise<Simulation> {
  const { data } = await ApiServices.post<Simulation>(
    "/debate/simulations",
    payload,
  )
  return data
}

export async function getSimulation(id: string): Promise<Simulation> {
  const { data } = await ApiServices.get<Simulation>(
    `/debate/simulations/${id}`,
  )
  return data
}

export async function advanceSimulation(
  id: string,
  runToEnd = false,
): Promise<Simulation> {
  const { data } = await ApiServices.post<Simulation>(
    `/debate/simulations/${id}/advance`,
    { runToEnd },
  )
  return data
}

export async function startSimulationRun(id: string): Promise<{
  simulationId: string
  executionId: string
  status: "running"
  streamUrl: string
}> {
  const { data } = await ApiServices.post(
    `/debate/simulations/${id}/run`,
  )
  return data
}

export async function fetchRuns(
  cursor?: string,
  limit = 20,
): Promise<RunPage> {
  const { data } = await ApiServices.get<RunPage>("/debate/runs", {
    params: { cursor, limit },
  })
  return data
}

export async function fetchExecutionEvents(
  id: string,
  after = 0,
  limit = 200,
): Promise<{ items: ExecutionEvent[]; nextCursor: number | null }> {
  const { data } = await ApiServices.get(
    `/debate/simulations/${id}/events`,
    { params: { after, limit } },
  )
  return data
}

export async function streamSimulationEvents(input: {
  id: string
  after?: number
  signal: AbortSignal
  onEvent: (event: ExecutionEvent) => void
  onHeartbeat?: (cursor: number) => void
}): Promise<number> {
  let cursor = input.after ?? 0
  const url = new URL(
    `${NEXT_PUBLIC_API_URL}/debate/simulations/${input.id}/stream`,
  )
  if (cursor > 0) url.searchParams.set("after", String(cursor))
  const headers: HeadersInit = {
    Accept: "text/event-stream",
    "Accept-Language": "en",
    "X-Locale": "en",
    ...(cursor > 0 ? { "Last-Event-ID": String(cursor) } : {}),
  }
  if (NEXT_PUBLIC_API_BASIC_AUTH) {
    headers.Authorization = `Basic ${btoa(NEXT_PUBLIC_API_BASIC_AUTH)}`
  }
  const response = await fetch(url, {
    headers,
    signal: input.signal,
    cache: "no-store",
  })
  if (!response.ok || !response.body) {
    throw new Error(`Event stream failed (${response.status})`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n")
    let boundary = buffer.indexOf("\n\n")
    while (boundary >= 0) {
      const frame = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      const parsed = parseSseFrame(frame)
      if (parsed?.event === "heartbeat") {
        input.onHeartbeat?.(cursor)
      } else if (parsed?.data) {
        const event = JSON.parse(parsed.data) as ExecutionEvent
        if (event.sequence > cursor) {
          cursor = event.sequence
          input.onEvent(event)
        }
      }
      boundary = buffer.indexOf("\n\n")
    }
  }
  return cursor
}

function parseSseFrame(frame: string): {
  id?: string
  event?: string
  data?: string
} | null {
  if (!frame.trim() || frame.startsWith(":")) return null
  const result: { id?: string; event?: string; data?: string } = {}
  const data: string[] = []
  for (const line of frame.split("\n")) {
    if (line.startsWith("id:")) result.id = line.slice(3).trim()
    else if (line.startsWith("event:")) result.event = line.slice(6).trim()
    else if (line.startsWith("data:")) data.push(line.slice(5).trimStart())
  }
  if (data.length) result.data = data.join("\n")
  return result
}

export async function judgeRound(payload: {
  topic: string
  round: number
  mode: DebateMode
  defenderArgument: string
  accuserArgument: string
  model?: string
}): Promise<RoundJudgment> {
  const { data } = await ApiServices.post<RoundJudgment>(
    "/debate/judge",
    payload,
  )
  return data
}

export async function checkApiHealth(): Promise<{
  ok: boolean
  llm: string
}> {
  try {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/health`)
    const data = (await res.json()) as {
      status?: string
      llm?: { status?: string }
    }
    return {
      ok: res.ok && data.status === "ok",
      llm: data.llm?.status ?? "unknown",
    }
  } catch {
    return { ok: false, llm: "unknown" }
  }
}
