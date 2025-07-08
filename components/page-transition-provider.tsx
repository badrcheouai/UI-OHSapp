"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { LoadingSpinner } from "./loading-spinner"

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Enable transitions after initial load
    const timer = setTimeout(() => {
      setIsLoading(false)
      document.body.classList.add("transitions-enabled")
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Handle page transitions
    setIsTransitioning(true)
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <>
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="global-loading-overlay">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 ohse-text-secondary">Chargement de l'application...</p>
          </div>
        </div>
      )}

      {/* Page Transition Overlay */}
      <div className={`page-transition-overlay ${isTransitioning ? "active" : ""}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 ohse-text-secondary">Chargement...</p>
          </div>
        </div>
      </div>

      {children}
    </>
  )
}
