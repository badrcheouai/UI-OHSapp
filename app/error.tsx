"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Une erreur s'est produite</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Désolé, quelque chose s'est mal passé. Veuillez réessayer.
        </p>
        <Button
          onClick={reset}
          className="bg-red-900 hover:bg-red-800 text-white dark:bg-red-800 dark:hover:bg-red-700"
        >
          Réessayer
        </Button>
      </div>
    </div>
  )
}
