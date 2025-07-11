"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { Globe, Shield, Sparkles, Star, Zap } from "lucide-react"

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "fr">("fr")

  useEffect(() => {
    if (!loading && user) {
      const roles = user.roles || []
      if (roles.includes("ADMIN")) router.replace("/dashboard")
      else if (roles.includes("RESP_RH")) router.replace("/dashboard-rh")
      else if (roles.includes("INFIRMIER_ST")) router.replace("/dashboard-infirmier")
      else if (roles.includes("MEDECIN_TRAVAIL")) router.replace("/dashboard-medecin")
      else if (roles.includes("RESP_HSE")) router.replace("/dashboard-hse")
      else if (roles.includes("SALARIE")) router.replace("/dashboard-salarie")
      else router.replace("/403")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-red-950">
        <div className="relative">
          <div className="h-16 w-16 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl flex items-center justify-center animate-pulse shadow-2xl">
            <Shield className="h-8 w-8 text-white animate-bounce" />
          </div>
          <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-3xl animate-ping"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left Panel - Login Form */}
      <div className="flex-1 lg:w-2/5 flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm relative">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-red-500/10 to-red-700/5 rounded-full animate-pulse"></div>
          <div
            className="absolute bottom-32 left-16 w-24 h-24 bg-gradient-to-br from-red-600/8 to-red-800/4 rounded-full animate-bounce"
            style={{ animationDelay: "3s" }}
          ></div>
          <div
            className="absolute top-1/2 right-32 w-16 h-16 bg-gradient-to-br from-red-400/12 to-red-600/6 rounded-full animate-ping"
            style={{ animationDelay: "1.5s" }}
          ></div>

          {/* Sparkle effects */}
          <div
            className="absolute top-1/4 left-1/4 animate-spin"
            style={{ animationDelay: "0s", animationDuration: "3s" }}
          >
            <Sparkles className="h-4 w-4 text-red-400/30" />
          </div>
          <div
            className="absolute bottom-1/3 right-1/3 animate-spin"
            style={{ animationDelay: "2s", animationDuration: "4s" }}
          >
            <Star className="h-3 w-3 text-red-500/25" />
          </div>
          <div
            className="absolute top-2/3 left-1/3 animate-spin"
            style={{ animationDelay: "4s", animationDuration: "2s" }}
          >
            <Zap className="h-3 w-3 text-red-600/20" />
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center p-6 animate-slide-down relative z-10">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                <Shield className="h-5 w-5 text-white group-hover:rotate-12 transition-transform duration-500" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-red-600/30 to-red-800/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">OHSE CAPITAL</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === "en" ? "fr" : "en")}
              className="h-10 px-4 text-sm font-medium rounded-xl bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-300 dark:border-slate-700/50 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-300 flex items-center gap-2 hover:scale-105 hover:shadow-lg group text-slate-700 dark:text-slate-200"
            >
              <Globe className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              <span className="font-semibold">{language === "en" ? "FR" : "EN"}</span>
            </button>
            <div className="animate-slide-left" style={{ animationDelay: "0.2s" }}>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <LoginForm language={language} />
          </div>
        </div>
      </div>

      {/* Right Panel - Company Information */}
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-red-600 via-red-700 to-red-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
        <div
          className="absolute bottom-20 right-20 w-16 h-16 bg-white/8 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-20 w-12 h-12 bg-white/6 rounded-full animate-ping"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute top-1/4 right-1/4 w-8 h-8 bg-white/5 rounded-full animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/4 w-6 h-6 bg-white/4 rounded-full animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-ping"
              style={{
                left: `${20 + i * 10}%`,
                top: `${20 + i * 8}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + i * 0.3}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Main content */}
        <div className="text-center text-white animate-slide-right relative z-10 max-w-2xl">
          <div className="mb-12">
            {/* Logo with animations */}
            <div className="mb-8 relative group">
              <div className="h-24 w-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce group-hover:scale-110 transition-all duration-700 relative overflow-hidden">
                <Shield className="h-12 w-12 text-white animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-br from-white/10 to-white/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </div>

            {/* Typography */}
            <h2 className="text-5xl font-bold mb-6 drop-shadow-lg animate-fade-in" style={{ animationDelay: "0.5s" }}>
              OHSE CAPITAL
            </h2>

            <p
              className="text-2xl opacity-90 drop-shadow animate-fade-in mb-8 font-light tracking-wide"
              style={{ animationDelay: "0.7s" }}
            >
              {language === "fr" ? "Bien-être corporatif professionnel" : "Professional corporate wellbeing"}
            </p>

            <p
              className="text-lg opacity-80 drop-shadow animate-fade-in mb-8 leading-relaxed max-w-xl mx-auto"
              style={{ animationDelay: "0.9s" }}
            >
              {language === "fr"
                ? "Plateforme intégrée de gestion de la santé et sécurité au travail pour les entreprises modernes"
                : "Integrated occupational health and safety management platform for modern enterprises"}
            </p>

            {/* Feature highlights */}
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 animate-fade-in"
              style={{ animationDelay: "1.1s" }}
            >
              {[
                { icon: Shield, text: language === "fr" ? "Sécurité" : "Security" },
                { icon: Sparkles, text: language === "fr" ? "Innovation" : "Innovation" },
                { icon: Star, text: language === "fr" ? "Excellence" : "Excellence" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center group animate-pulse"
                  style={{ animationDelay: `${1.3 + index * 0.2}s` }}
                >
                  <div className="h-12 w-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-500 group-hover:bg-white/25">
                    <item.icon className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-500" />
                  </div>
                  <span className="text-sm font-medium opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ambient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-pulse"></div>
      </div>
    </div>
  )
}
