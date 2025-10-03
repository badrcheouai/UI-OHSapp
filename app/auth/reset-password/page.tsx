"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Lock, Shield, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ResetPasswordPage() {
  const [language, setLanguage] = useState<"en" | "fr">("fr")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [tokenChecked, setTokenChecked] = useState(false)
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    upper: false,
    number: false,
    special: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setError(language === "fr" ? "Lien invalide ou manquant." : "Invalid or missing link.")
      setTokenChecked(true)
      return
    }
    setTokenChecked(true)
  }, [token, language])

  useEffect(() => {
    setPasswordChecks({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    })
  }, [password])

  const text = {
    fr: {
      title: "Nouveau Mot de Passe",
      subtitle: "Choisissez un nouveau mot de passe pour votre compte.",
      password: "Nouveau mot de passe",
      confirm: "Confirmer le mot de passe",
      reset: "Réinitialiser le mot de passe",
      backToLogin: "Retour à la Connexion",
      successTitle: "Mot de passe réinitialisé",
      successMessage: "Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.",
      error: "Erreur lors de la réinitialisation. Veuillez réessayer.",
      mismatch: "Les mots de passe ne correspondent pas.",
      required: "Veuillez remplir tous les champs.",
      sending: "Mise à jour...",
    },
    en: {
      title: "New Password",
      subtitle: "Choose a new password for your account.",
      password: "New Password",
      confirm: "Confirm Password",
      reset: "Reset Password",
      backToLogin: "Back to Login",
      successTitle: "Password Reset Successful",
      successMessage: "Your password has been updated. You can now log in.",
      error: "Error resetting password. Please try again.",
      mismatch: "Passwords do not match.",
      required: "Please fill in all fields.",
      sending: "Updating...",
    },
  }
  const t = text[language]

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = []
    if (pwd.length < 8) errors.push(language === "fr" ? "Au moins 8 caractères" : "At least 8 characters")
    if (!/[A-Z]/.test(pwd)) errors.push(language === "fr" ? "Au moins 1 majuscule" : "At least 1 uppercase letter")
    if (!/[0-9]/.test(pwd)) errors.push(language === "fr" ? "Au moins 1 chiffre" : "At least 1 number")
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push(language === "fr" ? "Au moins 1 caractère spécial" : "At least 1 special character")
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const passwordErrors = validatePassword(password)
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(", "))
      return
    }
    if (!password || !confirm) {
      setError(t.required)
      return
    }
    if (password !== confirm) {
      setError(t.mismatch)
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("http://localhost:8081/account/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      })
      if (res.ok) {
        setIsSubmitted(true)
        setTimeout(() => router.push("/login"), 2500)
      } else {
        const data = await res.text()
        setError(data || t.error)
      }
    } catch {
      setError(t.error)
    } finally {
      setIsLoading(false)
    }
  }

  const allValid = passwordChecks.length && passwordChecks.upper && passwordChecks.number && passwordChecks.special && password === confirm && password.length > 0

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/login" className="flex items-center gap-3">
            <div className="h-10 w-10 ohse-gradient-burgundy rounded-xl shadow-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold ohse-text-burgundy">OSHapp</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === "en" ? "fr" : "en")}
              className="h-9 px-3 text-sm font-medium rounded-lg ohse-btn-secondary"
            >
              {language === "en" ? "FR" : "EN"}
            </button>
            <ThemeToggle />
          </div>
        </div>
        {/* Main Card */}
        <Card className="ohse-card shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {isSubmitted ? (
                <CheckCircle className="h-8 w-8 ohse-text-green" />
              ) : (
                <Lock className="h-8 w-8 ohse-text-burgundy" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold ohse-text-primary">
              {isSubmitted ? t.successTitle : t.title}
            </CardTitle>
            <p className="text-sm ohse-text-secondary mt-2">{isSubmitted ? t.successMessage : t.subtitle}</p>
          </CardHeader>
          <CardContent>
            {!isSubmitted && tokenChecked && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="ohse-text-burgundy font-medium">
                    {t.password}
                  </Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="h-11 ohse-input pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent text-slate-500 hover:text-[#16a34a] transition-colors duration-300"
                      onClick={() => setShowPassword(v => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex items-center gap-2" style={{color: passwordChecks.length ? '#16a34a' : '#888'}}>
                      {passwordChecks.length ? <CheckCircle className="w-4 h-4 text-[#16a34a]" /> : <XCircle className="w-4 h-4 text-gray-400" />} {language === "fr" ? "Au moins 8 caractères" : "At least 8 characters"}
                    </li>
                    <li className="flex items-center gap-2" style={{color: passwordChecks.upper ? '#16a34a' : '#888'}}>
                      {passwordChecks.upper ? <CheckCircle className="w-4 h-4 text-[#16a34a]" /> : <XCircle className="w-4 h-4 text-gray-400" />} {language === "fr" ? "Au moins 1 majuscule" : "At least 1 uppercase letter"}
                    </li>
                    <li className="flex items-center gap-2" style={{color: passwordChecks.number ? '#16a34a' : '#888'}}>
                      {passwordChecks.number ? <CheckCircle className="w-4 h-4 text-[#16a34a]" /> : <XCircle className="w-4 h-4 text-gray-400" />} {language === "fr" ? "Au moins 1 chiffre" : "At least 1 number"}
                    </li>
                    <li className="flex items-center gap-2" style={{color: passwordChecks.special ? '#16a34a' : '#888'}}>
                      {passwordChecks.special ? <CheckCircle className="w-4 h-4 text-[#16a34a]" /> : <XCircle className="w-4 h-4 text-gray-400" />} {language === "fr" ? "Au moins 1 caractère spécial" : "At least 1 special character"}
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="ohse-text-burgundy font-medium">
                    {t.confirm}
                  </Label>
                  <div className="relative group">
                    <Input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      className="h-11 ohse-input pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent text-slate-500 hover:text-[#16a34a] transition-colors duration-300"
                      onClick={() => setShowConfirm(v => !v)}
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !allValid}
                  className="w-full h-11 ohse-btn-primary shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner mr-2" />
                      {t.sending}
                    </>
                  ) : (
                    t.reset
                  )}
                </Button>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm ohse-text-secondary hover:ohse-text-burgundy transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t.backToLogin}
                </Link>
              </form>
            )}
            {error && !isSubmitted && (
              <div className="text-red-600 text-sm text-center mt-4">{error}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
