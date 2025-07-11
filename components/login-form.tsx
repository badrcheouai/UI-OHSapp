"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Shield, Mail, Lock, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loginWithCredentials } from "@/lib/keycloak-login"
import { saveTokens } from "@/lib/auth"

interface LoginFormProps extends React.ComponentPropsWithoutRef<"form"> {
  language?: "en" | "fr"
}

export function LoginForm({ className, language = "fr", ...props }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const text = {
    fr: {
      title: "Connexion",
      subtitle: "Accédez à votre espace de travail",
      email: "Email",
      password: "Mot de passe",
      forgot: "Mot de passe oublié?",
      login: "Se connecter",
      google: "Continuer avec Google",
      emailPlaceholder: "nom@entreprise.com",
      or: "Ou continuer avec",
      signing: "Connexion...",
    },
    en: {
      title: "Sign In",
      subtitle: "Access your workspace",
      email: "Email",
      password: "Password",
      forgot: "Forgot password?",
      login: "Sign In",
      google: "Continue with Google",
      emailPlaceholder: "name@company.com",
      or: "Or continue with",
      signing: "Signing in...",
    },
  }

  const t = text[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await loginWithCredentials(email, password)
      const token = res.access_token
      const payload = JSON.parse(atob(token.split(".")[1]))
      const roles = payload.realm_access?.roles || []

      saveTokens(res)
      window.location.reload();

      if (roles.includes("ADMIN")) router.push("/dashboard")
      else if (roles.includes("RESP_RH")) router.push("/dashboard-rh")
      else if (roles.includes("INFIRMIER_ST")) router.push("/dashboard-infirmier")
      else if (roles.includes("MEDECIN_TRAVAIL")) router.push("/dashboard-medecin")
      else if (roles.includes("RESP_HSE")) router.push("/dashboard-hse")
      else if (roles.includes("SALARIE")) router.push("/dashboard-salarie")
      else router.push("/403")
    } catch (err: any) {
      console.error("Login failed:", err)
      setError(err.message || (language === "fr" ? "Erreur de connexion" : "Connection error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true)
    window.location.href =
      "http://localhost:8080/realms/oshapp/protocol/openid-connect/auth" +
      "?client_id=oshapp-frontend" +
      "&redirect_uri=http://localhost:3000/login/callback" +
      "&response_type=code" +
      "&scope=openid email profile" +
      "&kc_idp_hint=google" +
      "&prompt=select_account"
  }

  return (
    <div className="w-full max-w-md mx-auto animate-slide-up">
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-3xl transition-all duration-500">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-red-500/10 to-red-700/5 rounded-full animate-pulse"></div>
          <div
            className="absolute bottom-6 left-6 w-12 h-12 bg-gradient-to-br from-red-600/8 to-red-800/4 rounded-full animate-bounce"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <form className={cn("flex flex-col gap-6 relative z-10", className)} onSubmit={handleSubmit} {...props}>
          {/* Header Section */}
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative group">
              <div className="h-20 w-20 bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500 animate-pulse">
                <Shield className="h-10 w-10 text-white group-hover:rotate-12 transition-transform duration-500" />
              </div>
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            <div className="animate-fade-in space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.title}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t.subtitle}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 animate-shake">
              <p className="text-red-700 dark:text-red-400 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid gap-6">
            {/* Email Field */}
            <div className="grid gap-3 animate-slide-left" style={{ animationDelay: "0.2s" }}>
              <Label
                htmlFor="email"
                className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2"
              >
                <Mail className="h-4 w-4 text-red-600" />
                {t.email}
              </Label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-lg bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500/10 to-red-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Password Field */}
            <div className="grid gap-3 animate-slide-right" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2"
                >
                  <Lock className="h-4 w-4 text-red-600" />
                  {t.password}
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline transition-colors duration-300 font-medium"
                >
                  {t.forgot}
                </Link>
              </div>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-lg pr-12 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 text-slate-900 dark:text-slate-100"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors duration-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500/10 to-red-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 animate-slide-up disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ animationDelay: "0.4s" }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t.signing}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  {t.login}
                </div>
              )}
            </Button>

            {/* Divider */}
            <div className="relative text-center text-sm animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
              </div>
              <span className="relative bg-white dark:bg-slate-800 px-4 text-slate-500 dark:text-slate-400 font-medium">
                {t.or}
              </span>
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full h-12 border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-slide-up text-slate-700 dark:text-slate-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ animationDelay: "0.6s" }}
            >
              {isGoogleLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-slate-400/30 border-t-slate-600 rounded-full animate-spin"></div>
                  {language === "fr" ? "Connexion..." : "Connecting..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {t.google}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
