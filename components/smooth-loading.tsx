"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/contexts/ThemeContext"
import { Loader2, Sparkles } from "lucide-react"

interface SmoothLoadingProps {
  isLoading: boolean
  children: React.ReactNode
  message?: string
  showSpinner?: boolean
}

export function SmoothLoading({ 
  isLoading, 
  children, 
  message = "Chargement...",
  showSpinner = true 
}: SmoothLoadingProps) {
  const { themeColors } = useTheme()
  const [showContent, setShowContent] = useState(!isLoading)

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setShowContent(false)
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] p-8">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          {showSpinner && (
            <div className="relative">
              <Loader2 
                className="h-8 w-8 animate-spin"
                style={{ color: themeColors.colors.primary[600] }}
              />
              <Sparkles 
                className="absolute -top-1 -right-1 h-4 w-4 animate-pulse"
                style={{ color: themeColors.colors.primary[400] }}
              />
            </div>
          )}
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            {message}
          </p>
          {/* Progress bar */}
          <div className="w-32 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full animate-shimmer"
              style={{
                background: `linear-gradient(90deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[400]})`,
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {children}
    </div>
  )
} 