"use client"

import { useEffect } from "react"

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Clean up any existing style overrides
    const existingStyle = document.querySelector('style[data-yellow-override]')
    if (existingStyle) {
      existingStyle.remove()
    }

    // Add minimal style override for any remaining yellow classes
    const style = document.createElement('style')
    style.setAttribute('data-yellow-override', 'true')
    style.textContent = `
      /* Ensure no yellow colors are used in the application */
      .bg-yellow-50, .bg-yellow-100, .bg-yellow-200, .bg-yellow-300,
      .bg-yellow-400, .bg-yellow-500, .bg-yellow-600, .bg-yellow-700,
      .bg-yellow-800, .bg-yellow-900 {
        background-color: transparent !important;
      }

      /* Override any yellow text colors */
      .text-yellow-50, .text-yellow-100, .text-yellow-200, .text-yellow-300,
      .text-yellow-400, .text-yellow-500, .text-yellow-600, .text-yellow-700,
      .text-yellow-800, .text-yellow-900 {
        color: inherit !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      style.remove()
    }
  }, [])

  return <>{children}</>
}
