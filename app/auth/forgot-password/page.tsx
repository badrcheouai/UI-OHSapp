"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export default function ForgotPasswordPage() {
  const [language, setLanguage] = useState<"en" | "fr">("fr")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [timer, setTimer] = useState(60)
  const [warning, setWarning] = useState("")

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
      warning: "Veuillez entrer votre email.",
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
      warning: "Please enter your email.",
    },
  }

  const t = text[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      console.log("Sending password reset request to:", `${API_URL}/api/v1/account/forgot-password`);
      console.log("Email:", email);
      
      const response = await fetch(`${API_URL}/api/v1/account/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      
      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);
      
      if (response.ok) {
        console.log("Password reset email sent successfully");
      } else {
        console.log("Password reset configured for next login");
      }
      
      // Always show submitted, regardless of backend response, for security
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error sending password reset:", error);
      setIsSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // On mount, check if any timer is running and restore state
    const keys = Object.keys(localStorage).filter(k => k.startsWith('reset-timer-'));
    if (keys.length > 0) {
      const key = keys[0];
      const last = localStorage.getItem(key);
      if (last) {
        const diff = 60 - Math.floor((Date.now() - parseInt(last, 10)) / 1000);
        if (diff > 0) {
          setEmail(key.replace('reset-timer-', ''));
          setTimer(diff);
          setIsSubmitted(true);
        }
      }
    }
  }, []);

  useEffect(() => {
    // On mount, restore timer from localStorage
    if (isSubmitted && email) {
      const key = `reset-timer-${email}`;
      const last = localStorage.getItem(key);
      if (last) {
        const diff = 60 - Math.floor((Date.now() - parseInt(last, 10)) / 1000);
        if (diff > 0) setTimer(diff);
      }
    }
  }, [isSubmitted, email]);

  useEffect(() => {
    if (isSubmitted && timer > 0 && email) {
      const key = `reset-timer-${email}`;
      localStorage.setItem(key, Date.now().toString());
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
    if (timer <= 0 && email) {
      localStorage.removeItem(`reset-timer-${email}`);
    }
  }, [isSubmitted, timer, email]);

  const handleResend = async () => {
    setIsLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      console.log("Resending password reset request to:", `${API_URL}/api/v1/account/forgot-password`);
      console.log("Email:", email);
      
      const response = await fetch(`${API_URL}/api/v1/account/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      
      console.log("Resend response status:", response.status);
      const responseData = await response.json();
      console.log("Resend response data:", responseData);
      
      if (response.ok) {
        console.log("Password reset email resent successfully");
      } else {
        console.log("Password reset configured for next login");
      }
      
      setTimer(60)
    } catch (error) {
      console.error("Error resending password reset:", error);
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/login" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 rounded-xl shadow-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">OSHapp</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === "en" ? "fr" : "en")}
              className="h-9 px-3 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 hover:shadow-md"
            >
              {language === "en" ? "FR" : "EN"}
            </button>
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <CardHeader className="text-center pb-6">
            <div className="h-16 w-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              {isSubmitted ? (
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
                <Mail className="h-8 w-8 text-slate-600 dark:text-slate-400" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              {isSubmitted ? t.successTitle : t.title}
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{isSubmitted ? t.successMessage : t.subtitle}</p>
          </CardHeader>

          <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">
                    {t.email}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-slate-400 dark:focus:ring-slate-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
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
                  className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t.backToLogin}
                </Link>
              </form>
            ) : (
              <div className="space-y-6">
                <Button
                  onClick={() => {
                    if (!email) {
                      setWarning(t.warning);
                      return;
                    }
                    setWarning("");
                    handleResend();
                  }}
                  disabled={isLoading || timer > 0 || !email}
                  variant="outline"
                  className="w-full h-11 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 hover:shadow-md"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner mr-2" />
                      {t.sending}
                    </>
                  ) : timer > 0 ? (
                    `${t.resendLink} (${timer})`
                  ) : (
                    t.resendLink
                  )}
                </Button>
                {warning && <div className="text-red-600 text-sm text-center">{warning}</div>}

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
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
