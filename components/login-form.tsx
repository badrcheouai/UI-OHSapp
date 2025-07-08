"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loginWithCredentials } from "@/lib/keycloak-login"

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
            title: "Accès Sécurisé",
            subtitle: "Connectez-vous à votre espace professionnel",
            email: "Email",
            password: "Mot de passe",
            forgot: "Mot de passe oublié?",
            login: "Se connecter",
            google: "Continuer avec Google",
            emailPlaceholder: "utilisateur@entreprise.com",
            or: "Ou continuer avec",
            signing: "Connexion...",
        },
        en: {
            title: "Secure Access",
            subtitle: "Sign in to your professional workspace",
            email: "Email",
            password: "Password",
            forgot: "Forgot password?",
            login: "Sign In",
            google: "Continue with Google",
            emailPlaceholder: "user@company.com",
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

            localStorage.setItem("access_token", token)

            if (roles.includes("ADMIN")) router.push("/dashboard")
            else if (roles.includes("RESP_RH")) router.push("/employees")
            else if (roles.includes("INFIRMIER_ST")) router.push("/safety")
            else if (roles.includes("MEDECIN_TRAVAIL")) router.push("/reports")
            else if (roles.includes("RESP_HSE")) router.push("/incidents")
            else if (roles.includes("SALARIE")) router.push("/profile")
            else router.push("/403")
        } catch (err: any) {
            console.error("Login failed:", err)
            setError(err.message || "Erreur de connexion")
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true)
        try {
            window.location.href = "/auth/google/callback"
        } catch (error) {
            console.error("Google login failed:", error)
        } finally {
            setIsGoogleLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto animate-slide-up">
            <div className="ohse-card rounded-3xl p-8 interactive-hover">
                <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
                    <div className="flex flex-col items-center gap-6 text-center">
                        <div className="relative">
                            <div className="h-20 w-20 ohse-gradient-burgundy rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-glow">
                                <Shield className="h-10 w-10 text-white animate-subtle-bounce" />
                            </div>
                            <div className="absolute -top-2 -right-2 h-6 w-6 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg animate-float">
                                <div className="h-3 w-3 ohse-bg-green rounded-full"></div>
                            </div>
                        </div>
                        <div className="animate-fade-in">
                            <h1 className="text-3xl font-bold ohse-text-primary mb-2">{t.title}</h1>
                            <p className="text-sm ohse-text-secondary">{t.subtitle}</p>
                        </div>
                    </div>

                    {error && <div className="text-red-600 text-sm text-center">{error}</div>}

                    <div className="grid gap-6">
                        <div className="grid gap-3 animate-slide-left" style={{ animationDelay: "0.2s" }}>
                            <Label htmlFor="email" className="ohse-text-burgundy font-semibold">
                                {t.email}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t.emailPlaceholder}
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 ohse-input text-lg interactive-hover"
                            />
                        </div>

                        <div className="grid gap-3 animate-slide-right" style={{ animationDelay: "0.3s" }}>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="ohse-text-burgundy font-semibold">
                                    {t.password}
                                </Label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-sm ohse-text-burgundy hover:underline interactive-hover hover:text-red-700 dark:hover:text-red-400"
                                >
                                    {t.forgot}
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 ohse-input text-lg pr-12 interactive-hover"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent interactive-hover"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 ohse-text-burgundy" />
                                    ) : (
                                        <Eye className="h-5 w-5 ohse-text-burgundy" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 ohse-btn-primary text-lg font-semibold animate-slide-up interactive-hover"
                            style={{ animationDelay: "0.4s" }}
                        >
                            {isLoading ? (
                                <>
                                    <div className="loading-spinner mr-2" />
                                    {t.signing}
                                </>
                            ) : (
                                t.login
                            )}
                        </Button>

                        <div
                            className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-slate-300 dark:after:border-slate-600 animate-fade-in"
                            style={{ animationDelay: "0.5s" }}
                        >
                            <span className="relative z-10 bg-white dark:bg-slate-800 px-4 ohse-text-secondary">{t.or}</span>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            disabled={isGoogleLoading}
                            onClick={handleGoogleLogin}
                            className="w-full h-12 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 bg-transparent interactive-hover animate-slide-up"
                            style={{ animationDelay: "0.6s" }}
                        >
                            {isGoogleLoading ? (
                                <div className="loading-spinner" />
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
