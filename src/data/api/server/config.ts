import axios from "axios"
import { NEXT_PUBLIC_API_BASIC_AUTH, NEXT_PUBLIC_API_URL } from "@/config/env"

function basicAuthHeader(credentials: string): string {
  return `Basic ${btoa(credentials)}`
}

const ApiServices = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
})

const REQUEST_ID_HEADER = "x-request-id"

function generateRequestId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

/** Public API client — no JWT/auth in v0. */
ApiServices.interceptors.request.use(
  async (config) => {
    if (NEXT_PUBLIC_API_BASIC_AUTH) {
      config.headers.Authorization = basicAuthHeader(NEXT_PUBLIC_API_BASIC_AUTH)
    }
    config.headers[REQUEST_ID_HEADER] = generateRequestId()
    config.headers["Accept-Language"] = "en"
    config.headers["X-Locale"] = "en"
    return config
  },
  (error) => Promise.reject(error),
)

export { ApiServices }
