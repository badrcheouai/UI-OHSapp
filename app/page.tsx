"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else {
        // Redirect based on user role
        const roles = user.roles || []

        if (roles.includes("ADMIN")) {
          router.push("/dashboard-admin")
        } else if (roles.includes("MEDECIN_TRAVAIL")) {
          router.push("/dashboard-medecin")
        } else if (roles.includes("INFIRMIER_ST")) {
          router.push("/dashboard-infirmier")
        } else if (roles.includes("RESP_HSE")) {
          router.push("/dashboard-hse")
        } else if (roles.includes("RESP_RH")) {
          router.push("/dashboard-rh")
        } else if (roles.includes("SALARIE")) {
          router.push("/dashboard-salarie")
        } else {
          router.push("/profile")
        }
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner />
    </div>
  )
}
