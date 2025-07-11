"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login")
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-4 ohse-text-burgundy">Bienvenue sur OSHapp</h1>
      <p className="text-lg mb-8">La plateforme de gestion santé & sécurité au travail.</p>
      <Link href="/login" className="ohse-btn-primary px-6 py-3 rounded-lg text-lg">Se connecter</Link>
    </div>
  )
}
