"use client"

import { useEffect } from "react"
import { Shield } from "lucide-react"

export default function GoogleCallbackPage() {
  useEffect(() => {
    // Simulate Google OAuth callback processing
    const timer = setTimeout(() => {
      // In real implementation, this would handle Google OAuth callback
      // and exchange the authorization code for tokens
      window.location.href = "/dashboard"
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center ohse-card rounded-2xl shadow-xl p-8 max-w-md">
        <div className="h-16 w-16 ohse-gradient-burgundy rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold ohse-text-primary mb-4">Authentification avec Google...</h1>
        <div className="flex items-center justify-center gap-2 ohse-text-secondary">
          <div className="loading-spinner" />
          <span>Traitement de votre authentification Google</span>
        </div>
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <p className="text-xs ohse-text-secondary">Vous serez redirigé vers votre tableau de bord sous peu</p>
        </div>
      </div>
    </div>
  )
}
