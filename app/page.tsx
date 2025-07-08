"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login")
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-slate-600 dark:text-slate-300">Redirection vers la page de connexion...</p>
      </div>
    </div>
  )
}
