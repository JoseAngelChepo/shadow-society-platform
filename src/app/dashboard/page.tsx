"use client"

import AuthGuard from "@/components/auth/AuthGuard"
import HomeShell from "@/components/layout/HomeShell"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <HomeShell />
    </AuthGuard>
  )
}

