"use client"

import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import { useServices } from "@/data/providers/ServicesProvider"

function displayName(user: Record<string, unknown> | null): string {
  if (!user) return "Signed in"
  const email = user.email
  if (typeof email === "string" && email.length > 0) return email
  const username = user.username
  if (typeof username === "string" && username.length > 0) return `@${username}`
  const first = user.firstName
  const last = user.lastName
  if (typeof first === "string" || typeof last === "string") {
    return [first, last].filter(Boolean).join(" ")
  }
  return "Signed in"
}

export default function HomeShell() {
  const router = useRouter()
  const { user, role, services } = useServices()

  const onLogout = async () => {
    await services.logout()
    router.replace("/sign-in")
  }

  return (
    <main className="home-shell">
      <div className="home-card">
        <h1 className="home-title">Welcome</h1>
        <p className="home-lede">
          Authenticated area placeholder. Replace this shell with your product UI.
        </p>
        <dl className="home-meta">
          <div>
            <dt>User</dt>
            <dd>{displayName(user)}</dd>
          </div>
          {role ? (
            <div>
              <dt>Role</dt>
              <dd>{role}</dd>
            </div>
          ) : null}
        </dl>
        <Button type="button" variant="primary" onClick={() => void onLogout()}>
          Sign out
        </Button>
      </div>
    </main>
  )
}
