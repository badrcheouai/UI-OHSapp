"use client"

import { useState } from "react"
import { LoginForm } from "../../components/login-form"
import { ThemeToggle } from "../../components/theme-toggle"
import { Globe, Shield } from "lucide-react"

export default function LoginPage() {
  const [language, setLanguage] = useState<"en" | "fr">("fr")

  return (
      <div className="min-h-screen flex">
        {/* Left Panel - Login Form */}
        <div className="flex-1 lg:w-2/5 flex flex-col bg-white dark:bg-slate-900">
          <div className="flex justify-between items-center p-6 animate-slide-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 ohse-gradient-burgundy rounded-xl shadow-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold ohse-text-burgundy">OHSE CAPITAL</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                  onClick={() => setLanguage(language === "en" ? "fr" : "en")}
                  className="h-10 px-4 text-sm font-medium rounded-xl ohse-btn-secondary flex items-center gap-2 interactive-hover"
              >
                <Globe className="h-4 w-4" />
                {language === "en" ? "FR" : "EN"}
              </button>
              <ThemeToggle />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 relative">
            {/* Subtle background animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-red-900/5 rounded-full animate-float"></div>
              <div
                  className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-red-900/3 rounded-full animate-float"
                  style={{ animationDelay: "3s" }}
              ></div>
            </div>

            <LoginForm language={language} />
          </div>
        </div>

        {/* Right Panel - Company Information */}
        <div className="hidden lg:flex lg:w-3/5 ohse-login-bg items-center justify-center p-12 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
          <div
              className="absolute bottom-20 right-20 w-16 h-16 bg-white/5 rounded-full animate-float"
              style={{ animationDelay: "2s" }}
          ></div>
          <div
              className="absolute top-1/2 left-20 w-12 h-12 bg-white/5 rounded-full animate-float"
              style={{ animationDelay: "4s" }}
          ></div>

          <div className="text-center text-white animate-slide-right relative z-10 max-w-2xl">
            <div className="mb-12">
              <div className="mb-8 animate-pulse-glow">
                <div className="h-24 w-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-subtle-bounce">
                  <Shield className="h-12 w-12 text-white" />
                </div>
              </div>
              <h2 className="text-5xl font-bold mb-6 drop-shadow-lg animate-fade-in" style={{ animationDelay: "0.5s" }}>
                {language === "fr" ? "OHSE CAPITAL" : "OHSE CAPITAL"}
              </h2>
              <p className="text-2xl opacity-90 drop-shadow animate-fade-in mb-8" style={{ animationDelay: "0.7s" }}>
                {language === "fr" ? "Bien-être corporatif professionnel" : "Professional corporate wellbeing"}
              </p>
              <p className="text-lg opacity-80 drop-shadow animate-fade-in mb-8" style={{ animationDelay: "0.9s" }}>
                {language === "fr"
                    ? "Plateforme intégrée de gestion de la santé et sécurité au travail pour les entreprises modernes"
                    : "Integrated occupational health and safety management platform for modern enterprises"}
              </p>
              <p className="text-base opacity-70 drop-shadow animate-fade-in" style={{ animationDelay: "1.1s" }}>
                {language === "fr"
                    ? "Conformité ISO 45001 • Surveillance en temps réel • Support 24/7"
                    : "ISO 45001 Compliant • Real-time monitoring • 24/7 Support"}
              </p>
            </div>
          </div>
        </div>
      </div>
  )
}
