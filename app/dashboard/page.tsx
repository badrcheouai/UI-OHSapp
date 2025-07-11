"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mb-4"></div>
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  useEffect(() => {
    if (!user) {
      router.replace("/login")
    } else if (!user.roles.includes("ADMIN")) {
      router.replace("/403")
    }
  }, [user, router])

  if (!user || !user.roles.includes("ADMIN")) {
    return null // Avoid flicker
  }

  return (
    <div style={{ border: "10px solid #e5e7eb", background: "white" }} className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Subtle background animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-red-900/5 rounded-full animate-float"></div>
        <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-red-900/3 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
        </div>
      <div className="ohse-card rounded-3xl p-12 shadow-2xl animate-slide-up z-10 text-center max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-4 ohse-text-burgundy">Bienvenue sur votre tableau de bord</h1>
        {user && (
          <p className="text-lg">Vous êtes connecté en tant que <span className="font-semibold ohse-text-primary">{user.roles[0]}</span>.</p>
        )}
        <p className="mt-8 text-slate-500">Sélectionnez un module dans la navigation pour commencer.</p>
        </div>
    </div>
  )
}
