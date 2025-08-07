"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { Globe, Shield, Sparkles, Star } from "lucide-react"
import { CompanyLogo } from "@/components/company-logo"
import { useSearchParams } from "next/navigation"
import { useTheme } from "@/contexts/ThemeContext"
import { ThemeSelector } from "@/components/theme-selector"

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "fr">("fr")
  const searchParams = useSearchParams()
  const activated = searchParams.get("activated") === "1"
  const { themeColors } = useTheme()

  useEffect(() => {
    // Only redirect if user is not verified (needs activation)
    if (!loading && user && user.emailVerified === false) {
      router.replace("/auth/activation")
      return
    }
    // Don't auto-redirect verified users - let the login form handle it with animation
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="relative">
          <CompanyLogo size={64} className="shadow-2xl animate-bounce-gentle" />
          <div
            className="absolute -inset-4 rounded-3xl animate-pulse-slow opacity-20"
            style={{
              background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
            }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Professional Background Bubbles Animation - More Subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* RIGHT SIDE BUBBLES - PROFESSIONAL ANIMATIONS */}
        <div
          className="absolute top-24 right-20 w-28 h-28 rounded-full animate-ping"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[300]}, ${themeColors.colors.primary[500]})`,
            opacity: 0.06,
            animationDelay: "0s",
            animationDuration: "15s",
          }}
        ></div>
        <div
          className="absolute top-48 right-12 w-20 h-20 rounded-full animate-ping"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[200]}, ${themeColors.colors.primary[400]})`,
            opacity: 0.04,
            animationDelay: "5s",
            animationDuration: "18s",
          }}
        ></div>
        <div
          className="absolute top-72 right-28 w-16 h-16 rounded-full animate-ping"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[600]})`,
            opacity: 0.03,
            animationDelay: "2s",
            animationDuration: "20s",
          }}
        ></div>

        {/* ADDITIONAL RIGHT SIDE BUBBLES - More Variety */}
        <div
          className="absolute top-10 right-60 w-22 h-22 rounded-full animate-bounce shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[300]}, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
            opacity: 0.28,
            animationDelay: "1.2s",
            animationDuration: "7s",
          }}
        ></div>
        <div
          className="absolute top-25 right-80 w-18 h-18 rounded-full animate-pulse shadow-md"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[200]}, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[600]})`,
            opacity: 0.22,
            animationDelay: "2.8s",
            animationDuration: "8s",
          }}
        ></div>
        <div
          className="absolute top-50 right-70 w-15 h-15 rounded-full animate-bounce shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
            opacity: 0.18,
            animationDelay: "0.3s",
            animationDuration: "6.8s",
          }}
        ></div>
        <div
          className="absolute top-70 right-90 w-12 h-12 rounded-full animate-pulse"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[300]}, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
            opacity: 0.14,
            animationDelay: "3.2s",
            animationDuration: "9s",
          }}
        ></div>
        <div
          className="absolute top-90 right-50 w-16 h-16 rounded-full animate-bounce shadow-md"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[200]}, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[600]})`,
            opacity: 0.2,
            animationDelay: "1.8s",
            animationDuration: "7.8s",
          }}
        ></div>

        {/* LEFT SIDE BUBBLES - REMOVED ALL - CLEAN PROFESSIONAL LOOK */}
        
        {/* FLOATING PARTICLES - PROFESSIONAL ANIMATIONS */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-ping"
            style={{
              right: `${20 + i * 15}%`,
              top: `${15 + i * 12}%`,
              background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[600]})`,
              opacity: 0.15,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${8 + i * 0.5}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Show activation message if just activated */}
      {activated && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-green-100 border border-green-200 text-green-800 px-6 py-3 rounded-xl shadow-lg animate-slide-down">
          <span className="font-semibold">Votre compte est activé ! Connectez-vous.</span>
        </div>
      )}

      {/* Left Panel - Login Form */}
      <div className="flex-1 lg:w-2/5 flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-border/20 relative shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <CompanyLogo size={36} className="group-hover:scale-110 transition-all duration-500 shadow-xl" />
              <div
                className="absolute -inset-2 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                }}
              ></div>
            </div>
            <div className="flex flex-col animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <span className="text-xl font-bold text-foreground dark:text-white tracking-tight">OHSE CAPITAL</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === "en" ? "fr" : "en")}
              className="h-9 px-4 text-sm font-semibold rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 border border-border/40 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl animate-fade-in text-foreground dark:text-white"
              style={{ animationDelay: "0.5s" }}
            >
              <Globe className="h-4 w-4 transition-transform duration-500 hover:rotate-180" />
              <span className="font-bold">{language === "en" ? "FR" : "EN"}</span>
            </button>
            <div className="animate-fade-in" style={{ animationDelay: "0.7s" }}>
              <ThemeSelector />
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <LoginForm language={language} />
          </div>
        </div>
      </div>

      {/* Right Panel - Company Information */}
      <div
        className="hidden lg:flex lg:w-3/5 items-center justify-center p-16 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${themeColors.colors.primary[600]} 0%, ${themeColors.colors.primary[700]} 50%, ${themeColors.colors.primary[800]} 100%)`,
        }}
      >
        {/* Enhanced Right Panel Background Bubbles */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-12 right-12 w-32 h-32 bg-white/25 rounded-full animate-bounce shadow-2xl"
            style={{ animationDuration: "6s" }}
          ></div>
          <div
            className="absolute bottom-24 right-24 w-28 h-28 bg-white/20 rounded-full animate-pulse shadow-xl"
            style={{ animationDelay: "2s", animationDuration: "8s" }}
          ></div>
          <div
            className="absolute top-1/2 right-24 w-24 h-24 bg-white/18 rounded-full animate-pulse shadow-lg"
            style={{ animationDelay: "4s", animationDuration: "7s" }}
          ></div>
          <div
            className="absolute top-1/3 right-1/3 w-20 h-20 bg-white/15 rounded-full animate-bounce shadow-lg"
            style={{ animationDelay: "1s", animationDuration: "9s" }}
          ></div>
          <div
            className="absolute top-1/4 right-1/4 w-26 h-26 bg-white/22 rounded-full animate-pulse shadow-xl"
            style={{ animationDelay: "3s", animationDuration: "6.5s" }}
          ></div>
          <div
            className="absolute bottom-1/3 right-1/4 w-18 h-18 bg-white/16 rounded-full animate-bounce shadow-md"
            style={{ animationDelay: "1.5s", animationDuration: "7.5s" }}
          ></div>
          <div
            className="absolute top-3/4 right-1/3 w-14 h-14 bg-white/12 rounded-full animate-pulse shadow-md"
            style={{ animationDelay: "2.5s", animationDuration: "8.5s" }}
        ></div>
        <div
            className="absolute top-1/6 right-1/6 w-12 h-12 bg-white/10 rounded-full animate-bounce shadow-sm"
            style={{ animationDelay: "0.8s", animationDuration: "9.5s" }}
        ></div>
        </div>

        {/* Main content */}
        <div className="text-center text-white animate-slide-right relative z-10 max-w-2xl">
          <div className="mb-16">
            {/* Logo with animations */}
            <div className="mb-12 relative group">
              <div className="h-28 w-28 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce-gentle group-hover:scale-110 transition-all duration-700">
                <CompanyLogo size={56} />
              </div>
            </div>

            {/* Typography */}
            <h2 className="text-6xl font-bold mb-8 drop-shadow-lg animate-fade-in tracking-tight" style={{ animationDelay: "0.5s" }}>
              OHSE CAPITAL
            </h2>

            <p
              className="text-3xl opacity-90 drop-shadow animate-fade-in mb-6 font-light tracking-wide"
              style={{ animationDelay: "0.7s" }}
            >
              {language === "fr" ? "Bien-être corporatif professionnel" : "Professional corporate wellbeing"}
            </p>

            <p
              className="text-xl opacity-80 drop-shadow animate-fade-in mb-3 font-medium"
              style={{ animationDelay: "0.8s" }}
            >
              {themeColors.name} Theme
            </p>

            <p
              className="text-lg opacity-80 drop-shadow animate-fade-in mb-12 leading-relaxed max-w-xl mx-auto"
              style={{ animationDelay: "0.9s" }}
            >
              {language === "fr"
                ? "Plateforme intégrée de gestion de la santé et sécurité au travail pour les entreprises modernes"
                : "Integrated occupational health and safety management platform for modern enterprises"}
            </p>

            {/* Feature highlights */}
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-fade-in"
              style={{ animationDelay: "1.1s" }}
            >
              {[
                { icon: Shield, text: language === "fr" ? "Sécurité" : "Security" },
                { icon: Sparkles, text: language === "fr" ? "Innovation" : "Innovation" },
                { icon: Star, text: language === "fr" ? "Excellence" : "Excellence" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center group animate-pulse-slow"
                  style={{ animationDelay: `${1.3 + index * 0.2}s` }}
                >
                  <div className="h-16 w-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-500 group-hover:bg-white/25 shadow-lg">
                    <item.icon className="h-8 w-8 text-white group-hover:rotate-12 transition-transform duration-500" />
                  </div>
                  <span className="text-base font-medium opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
