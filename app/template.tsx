"use client"

import type React from "react"

import { useEffect } from "react"

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure no yellow colors during page transitions
    const style = document.createElement("style")
    style.textContent = `
      * {
        --yellow-50: 248 250 252 !important;
        --yellow-100: 248 250 252 !important;
        --yellow-200: 226 232 240 !important;
        --yellow-300: 203 213 225 !important;
        --yellow-400: 148 163 184 !important;
        --yellow-500: 100 116 139 !important;
        --yellow-600: 71 85 105 !important;
        --yellow-700: 51 65 85 !important;
        --yellow-800: 30 41 59 !important;
        --yellow-900: 15 23 42 !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  return <>{children}</>
}
