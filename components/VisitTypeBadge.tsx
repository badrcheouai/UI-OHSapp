"use client"

import { Badge } from "@/components/ui/badge"

type VisitType =
  | "EMBAUCHE"
  | "PERIODIQUE"
  | "SURVEILLANCE_PARTICULIERE"
  | "REPRISE"
  | "APPEL_MEDECIN"
  | "SPONTANEE"

export function VisitTypeBadge({ type }: { type?: VisitType }) {
  if (!type) return null

  const map: Record<VisitType, { label: string; className: string }> = {
    EMBAUCHE: { 
      label: "Embauche", 
      className: "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-200 shadow-blue-200/50 dark:shadow-blue-800/30" 
    },
    PERIODIQUE: { 
      label: "Périodique", 
      className: "border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-200 shadow-indigo-200/50 dark:shadow-indigo-800/30" 
    },
    SURVEILLANCE_PARTICULIERE: { 
      label: "Surveillance", 
      className: "border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-200 shadow-amber-200/50 dark:shadow-amber-800/30" 
    },
    REPRISE: { 
      label: "Reprise", 
      className: "border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-200 shadow-emerald-200/50 dark:shadow-emerald-800/30" 
    },
    APPEL_MEDECIN: { 
      label: "À l'appel du médecin", 
      className: "border-purple-500 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 text-purple-700 dark:text-purple-200 shadow-purple-200/50 dark:shadow-purple-800/30" 
    },
    SPONTANEE: { 
      label: "Spontanée", 
      className: "border-slate-500 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/30 text-slate-700 dark:text-slate-200 shadow-slate-200/50 dark:shadow-slate-800/30" 
    },
  }

  const cfg = map[type]
  return (
    <Badge 
      variant="outline" 
      className={`border-2 px-5 py-2.5 text-sm font-semibold shadow-lg ${cfg.className}`}
    >
      {cfg.label}
    </Badge>
  )
}


