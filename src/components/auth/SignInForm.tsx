"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter, useSearchParams } from "next/navigation"
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5"
import Button from "@/components/ui/Button"
import GoogleAuthButton from "@/components/auth/GoogleAuthButton"
import { useServices } from "@/data/providers/ServicesProvider"
import { NEXT_PUBLIC_API_URL } from "@/config/env"

type FormValues = {
  email: string
  password: string
}

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect")
  const {
    services: { login },
  } = useServices()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ defaultValues: { email: "", password: "" } })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      const response = await login(data)
      if (!response) {
        setError("root", { type: "manual", message: "Invalid email or password" })
        return
      }
      router.push(redirectPath || "/dashboard")
    } catch {
      setError("root", { type: "manual", message: "Something went wrong. Try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const signUpPath = redirectPath
    ? `/sign-up?redirect=${encodeURIComponent(redirectPath)}`
    : "/sign-up"

  const onGoogleLogin = () => {
    const state = btoa(JSON.stringify({ redirect: redirectPath || "/dashboard" }))
    window.location.assign(
      `${NEXT_PUBLIC_API_URL}/auth/google?state=${encodeURIComponent(state)}`,
    )
  }

  return (
    <div className="auth-form">
      <h1 className="auth-title">Sign in</h1>
      <p className="auth-lede">Use your email and password to continue.</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="auth-fields">
          <div>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Enter a valid email",
                },
              })}
              className="auth-input"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
            />
            {errors.email && <p className="auth-error">{errors.email.message}</p>}
          </div>
          <div>
            <div className="auth-password-wrap">
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "At least 6 characters" },
                })}
                className="auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
              </button>
            </div>
            {errors.password && <p className="auth-error">{errors.password.message}</p>}
          </div>
          {errors.root && <div className="auth-root-error">{errors.root.message}</div>}
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            Sign in
          </Button>
        </div>
      </form>
      <div className="auth-divider" role="separator">
        <span>Or</span>
      </div>
      <GoogleAuthButton text="Continue with Google" onClick={onGoogleLogin} />
      <button type="button" className="auth-footer" onClick={() => router.push(signUpPath)}>
        Create account
      </button>
    </div>
  )
}
