"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ForgotPasswordPage() {
  const [language, setLanguage] = useState<"en" | "fr">("fr")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const text = {
    fr: {
      title: "Réinitialiser Votre Mot de Passe",
      subtitle: "Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe",
      email: "Adresse Email",
      emailPlaceholder: "utilisateur@entreprise.com",
      sendLink: "Envoyer le Lien",
      backToLogin: "Retour à la Connexion",
      successTitle: "Vérifiez Votre Email",
      successMessage:
        "Nous avons envoyé un lien de réinitialisation à votre adresse email. Veuillez vérifier votre boîte de réception et suivre les instructions.",
      resendLink: "Renvoyer le Lien",
      sending: "Envoi...",
    },
    en: {
      title: "Reset Your Password",
      subtitle: "Enter your email address and we'll send you a link to reset your password",
      email: "Email Address",
      emailPlaceholder: "user@company.com",
      sendLink: "Send Reset Link",
      backToLogin: "Back to Login",
      successTitle: "Check Your Email",
      successMessage:
        "We've sent a password reset link to your email address. Please check your inbox and follow the instructions.",
      resendLink: "Resend Link",
      sending: "Sending...",
    },
  }

  const t = text[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call to Spring Boot backend
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsSubmitted(true)
    } catch (error) {
      console.error("Password reset failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
    } catch (error) {
      console.error("Resend failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/login" className="flex items-center gap-3">
            <div className="h-10 w-10 ohse-gradient-burgundy rounded-xl shadow-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold ohse-text-burgundy">OHSE CAPITAL</span>
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
                <Mail className="h-8 w-8 ohse-text-burgundy" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold ohse-text-primary">
              {isSubmitted ? t.successTitle : t.title}
            </CardTitle>
            <p className="text-sm ohse-text-secondary mt-2">{isSubmitted ? t.successMessage : t.subtitle}</p>
          </CardHeader>

          <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="ohse-text-burgundy font-medium">
                    {t.email}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 ohse-input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-11 ohse-btn-primary shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner mr-2" />
                      {t.sending}
                    </>
                  ) : (
                    t.sendLink
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
            ) : (
              <div className="space-y-6">
                <Button
                  onClick={handleResend}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-11 ohse-btn-secondary bg-transparent"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner mr-2" />
                      {t.sending}
                    </>
                  ) : (
                    t.resendLink
                  )}
                </Button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm ohse-text-secondary hover:ohse-text-burgundy transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t.backToLogin}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
