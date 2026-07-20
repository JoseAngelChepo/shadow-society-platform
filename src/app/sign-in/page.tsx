"use client"

import { Suspense } from "react"
import AuthGuard from "@/components/auth/AuthGuard"
import SignInForm from "@/components/auth/SignInForm"
import Loader from "@/components/ui/Loader"

export default function SignInPage() {
  return (
    <AuthGuard>
      <div className="auth-page">
        <div className="auth-card">
          <Suspense fallback={<Loader compact />}>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </AuthGuard>
  )
}
