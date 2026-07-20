import type { AxiosInstance } from "axios"
import auth from "@/data/api/server/auth"
import { normalizeAuthMeUser } from "./normalizeAuthMeUser"

export { normalizeAuthMeUser } from "./normalizeAuthMeUser"

export interface AuthSessionPayload {
  access_token: string
  refresh_token: string
  user: Record<string, unknown>
}

type LoginPayload = { email: string; password: string }
type SignUpPayload = {
  username: string
  firstName: string
  lastName: string
  email: string
  password: string
}

/** GET /auth/username/availability — public, no exceptions from backend. */
export type UsernameAvailabilityResponse = {
  username: string
  valid: boolean
  available: boolean
  reason?: string
}

export type ServicesApi = {
  signUp: (data: SignUpPayload) => Promise<AuthSessionPayload>
  login: (data: LoginPayload) => Promise<AuthSessionPayload>
  getUser: () => Promise<Record<string, unknown> | null>
  logout: () => Promise<unknown>
  checkUsernameAvailability: (username: string) => Promise<UsernameAvailabilityResponse>
}

function createServices(api: AxiosInstance): ServicesApi {
  return {
    signUp: (data) =>
      api.post("/auth/register", data).then((r) => r.data as AuthSessionPayload),
    checkUsernameAvailability: (username) =>
      api
        .get<UsernameAvailabilityResponse>("/auth/username/availability", {
          params: { username },
        })
        .then((r) => r.data),
    login: (data) =>
      api.post("/auth/login", data).then((r) => r.data as AuthSessionPayload),
    getUser: () =>
      api.get("/users/me").then((r) => {
        const normalized = normalizeAuthMeUser(r.data ?? null)
        if (normalized == null || typeof normalized !== "object" || Array.isArray(normalized)) {
          return null
        }
        return normalized as Record<string, unknown>
      }),
    logout: () => {
      const refreshToken = auth.getRefreshToken()
      if (!refreshToken) return Promise.resolve()
      return api.post("/auth/logout", { refresh_token: refreshToken })
    },
  }
}

export default createServices
