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
    EMBAUCHE: { label: "Embauche", className: "border-blue-500 text-blue-700 dark:text-blue-300" },
    PERIODIQUE: { label: "Périodique", className: "border-indigo-500 text-indigo-700 dark:text-indigo-300" },
    SURVEILLANCE_PARTICULIERE: { label: "Surveillance", className: "border-amber-500 text-amber-700 dark:text-amber-300" },
    REPRISE: { label: "Reprise", className: "border-emerald-500 text-emerald-700 dark:text-emerald-300" },
    APPEL_MEDECIN: { label: "Appel médecin", className: "border-purple-500 text-purple-700 dark:text-purple-300" },
    SPONTANEE: { label: "Spontanée", className: "border-slate-500 text-slate-700 dark:text-slate-300" },
  }

  const cfg = map[type]
  return (
    <Badge variant="outline" className={`border-2 ${cfg.className}`}>{cfg.label}</Badge>
  )
}


