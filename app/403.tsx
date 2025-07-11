"use client"

import { useRouter } from "next/navigation"
import { ShieldOff } from "lucide-react"

export default function ForbiddenPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900 text-center p-8">
      <div className="mb-6 animate-bounce">
        <ShieldOff className="h-16 w-16 text-red-600 mx-auto" />
      </div>
      <h1 className="text-4xl font-bold mb-4 text-red-700">403 – Accès interdit</h1>
      <p className="text-lg mb-8 text-slate-600 dark:text-slate-300">Vous n'avez pas les droits pour accéder à cette page.</p>
      <button
        onClick={() => router.replace("/login")}
        className="px-6 py-2 rounded-xl bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
      >
        Retour à la connexion
      </button>
    </div>
  )
} 