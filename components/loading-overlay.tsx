"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/contexts/ThemeContext"
import { CheckCircle, Loader2, XCircle } from "lucide-react"

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
  type?: "login" | "logout" | "loading" | "success"
  onComplete?: () => void
}

export function LoadingOverlay({ 
  isVisible, 
  message = "Chargement...", 
  type = "loading",
  onComplete 
}: LoadingOverlayProps) {
  const { themeColors } = useTheme()
  const [showSuccess, setShowSuccess] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isVisible && type === "login") {
      // Login animation - 1.5 seconds total
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setShowSuccess(true)
            // Wait for success animation to complete before calling onComplete
            setTimeout(() => {
              onComplete?.()
            }, 1000) // 1 second for success display
            return 100
          }
          return prev + 4 // Faster progress for 1.5 seconds total
        })
      }, 60) // 1.5 seconds total (60ms * 25 steps)

      return () => clearInterval(interval)
    } else if (isVisible && type === "logout") {
      // Logout animation - 1 second total
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setShowSuccess(true)
            // Wait for success animation to complete before calling onComplete
            setTimeout(() => {
              onComplete?.()
            }, 1000) // 1 second for success display
            return 100
          }
          return prev + 5 // Faster progress for 1 second total
        })
      }, 50) // 1 second total (50ms * 20 steps)

      return () => clearInterval(interval)
    } else if (isVisible && type === "success") {
      const timer = setTimeout(() => {
        setShowSuccess(true)
        setTimeout(() => {
          onComplete?.()
        }, 1000)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isVisible, type, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-8 max-w-sm w-full">
          <div className="flex flex-col items-center gap-6 text-center">
            {/* Icon */}
            <div className="relative">
              {type === "login" && !showSuccess && (
                <Loader2 
                  className="h-12 w-12 animate-spin"
                  style={{ color: themeColors.colors.primary[600] }}
                />
              )}
              {type === "login" && showSuccess && (
                <CheckCircle 
                  className="h-12 w-12 text-green-600"
                />
              )}
              {type === "logout" && !showSuccess && (
                <Loader2 
                  className="h-12 w-12 animate-spin"
                  style={{ color: themeColors.colors.primary[600] }}
                />
              )}
              {type === "logout" && showSuccess && (
                <CheckCircle 
                  className="h-12 w-12 text-green-600"
                />
              )}
              {type === "loading" && (
                <Loader2 
                  className="h-12 w-12 animate-spin"
                  style={{ color: themeColors.colors.primary[600] }}
                />
              )}
              {type === "success" && (
                <CheckCircle 
                  className="h-12 w-12 text-green-600"
                />
              )}
            </div>

            {/* Message */}
            <div>
              <h2 className="text-xl font-semibold text-foreground dark:text-white mb-2">
                {type === "login" && !showSuccess && "Connexion en cours..."}
                {type === "login" && showSuccess && "Connexion réussie!"}
                {type === "logout" && !showSuccess && "Déconnexion en cours..."}
                {type === "logout" && showSuccess && "Déconnexion réussie!"}
                {type === "loading" && "Chargement..."}
                {type === "success" && "Succès!"}
              </h2>
              <p className="text-slate-600 dark:text-white/80 text-sm">
                {showSuccess ? "Redirection en cours..." : message}
              </p>
            </div>

            {/* Progress Bar */}
            {(type === "login" || type === "logout") && !showSuccess && (
              <div className="w-full">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {progress}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 