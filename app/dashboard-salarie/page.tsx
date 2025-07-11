"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from "@/components/language-toggle"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  LogOut,
  User,
  Globe,
  Briefcase,
  FileText,
  Calendar,
  Shield,
  Activity,
  CalendarCheck,
  ChevronDown,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useEffect } from "react"

export default function DashboardSalarie() {
  const { user, logout, loading } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "fr">("fr")

  useEffect(() => {
    if (!user) {
      router.replace("/login")
    } else if (!(user.roles.includes("SALARIE") || user.roles.includes("ADMIN"))) {
      router.replace("/403")
    }
  }, [user, router])
  if (!user || !(user.roles.includes("SALARIE") || user.roles.includes("ADMIN"))) {
    return null
  }

  const responsibilities = [
    {
      icon: FileText,
      text: t("Accès à mon compte et documents"),
      color: "from-teal-500 to-teal-700",
    },
    {
      icon: Calendar,
      text: t("Demander un RDV médical"),
      color: "from-teal-600 to-teal-800",
    },
    {
      icon: CalendarCheck,
      text: t("Consulter/annuler/reporter mes RDV médicaux"),
      color: "from-teal-700 to-teal-900",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-teal-950 p-4">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-20 h-20 bg-teal-200/20 dark:bg-teal-800/20 rounded-full animate-pulse"></div>
        <div
          className="absolute top-40 right-32 w-16 h-16 bg-teal-300/20 dark:bg-teal-700/20 rounded-full animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-40 w-12 h-12 bg-teal-400/20 dark:bg-teal-600/20 rounded-full animate-ping"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 right-20 w-8 h-8 bg-teal-500/20 dark:bg-teal-500/20 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8 animate-slide-down">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-r from-teal-600 to-teal-800 rounded-lg flex items-center justify-center shadow-lg">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-teal-700 to-teal-900 bg-clip-text text-transparent">
              OHSE SALARIÉ
            </span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setLanguage(language === "en" ? "fr" : "en")}
              className="h-8 px-3 text-xs font-medium rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-all duration-300 flex items-center gap-1"
            >
              <Globe className="h-3 w-3" />
              {language === "en" ? "FR" : "EN"}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Profile Dropdown */}
      <div className="absolute top-4 right-4 z-20 animate-slide-left">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-all duration-300 hover:scale-105">
              <div className="h-6 w-6 bg-gradient-to-r from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
                <User className="h-3 w-3 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{user?.username}</span>
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" /> {t("Mon profil")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 flex items-center gap-2 cursor-pointer">
              <LogOut className="h-4 w-4" /> {t("Déconnexion")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto mt-16">
        {/* Welcome Card */}
        <div
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-teal-600 to-teal-800 p-8 text-center">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Briefcase className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg mb-2">{t("Bienvenue sur votre espace")}</h1>
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-5 w-5 text-white/80" />
                <span className="text-lg font-semibold text-white/90">{t("Salarié")}</span>
              </div>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <div
                className="flex items-center justify-center gap-3 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="h-10 w-10 bg-gradient-to-r from-teal-500 to-teal-700 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t("Vous êtes connecté en tant que")}</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{user.roles[0]}</p>
                </div>
              </div>
            </div>
          )}

          {/* Services Available */}
          <div className="p-6">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("Services disponibles")}</h2>
            </div>
            <div className="space-y-4">
              {responsibilities.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-all duration-300 hover:scale-[1.02] animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
                >
                  <div
                    className={`h-10 w-10 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}
                  >
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Development Note */}
        <div
          className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <p className="text-sm text-blue-700 dark:text-blue-400 text-center font-medium">
            🚧 {t("Page de démonstration - Fonctionnalités en cours de développement")}
          </p>
        </div>
      </div>
    </div>
  )
}
