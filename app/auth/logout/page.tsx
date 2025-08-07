"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { CompanyLogo } from "@/components/company-logo"
import { useTheme } from "@/contexts/ThemeContext"

export default function LogoutPage() {
  const { logout } = useAuth()
  const router = useRouter()
  const { themeColors } = useTheme()

  useEffect(() => {
    // Perform logout
    logout()
    
    // Redirect to login after a short delay
    const timer = setTimeout(() => {
      router.push("/login")
    }, 1000)

    return () => clearTimeout(timer)
  }, [logout, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative mb-8">
          <CompanyLogo size={64} className="shadow-2xl animate-bounce-gentle" />
          <div
            className="absolute -inset-4 rounded-3xl animate-pulse-slow opacity-20"
            style={{
              background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
            }}
          ></div>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Déconnexion...</h1>
        <p className="text-muted-foreground">Redirection vers la page de connexion</p>
      </div>
    </div>
  )
} 