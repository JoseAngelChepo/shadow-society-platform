"use client"

import { Suspense } from "react"
import AuthGuard from "@/components/auth/AuthGuard"
import SignUpForm from "@/components/auth/SignUpForm"
import Loader from "@/components/ui/Loader"

export default function SignUpPage() {
  return (
    <AuthGuard>
      <div className="auth-page">
        <div className="auth-card">
          <Suspense fallback={<Loader compact />}>
            <SignUpForm />
          </Suspense>
        </div>
      </div>
    </AuthGuard>
  )
}
