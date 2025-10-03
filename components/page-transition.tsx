"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    if (displayChildren !== children) {
      setIsTransitioning(true)
      
      const timer = setTimeout(() => {
        setDisplayChildren(children)
        setIsTransitioning(false)
      }, 150)
      
      return () => clearTimeout(timer)
    }
  }, [children, displayChildren])

  return (
    <div
      className={`page-transition ${
        isTransitioning ? 'page-transition-exit' : 'page-transition-enter-active'
      }`}
    >
      {displayChildren}
    </div>
  )
} 