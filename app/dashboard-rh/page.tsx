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
import { LogOut, User, Globe, Users, UserPlus, Shield, Activity, Calendar, ChevronDown, Award, Stethoscope, Clock, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CompanyLogo } from "@/components/company-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useEffect } from "react"
import NotificationBell from "@/components/NotificationBell"
import { medicalVisitAPI, MedicalVisitRequest } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function DashboardRH() {
  const { user, logout, loading } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "fr">("fr")
  
  // Medical visit requests state
  const [pendingRequests, setPendingRequests] = useState<MedicalVisitRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [requestStats, setRequestStats] = useState({
    pending: 0,
    proposed: 0,
    confirmed: 0
  })

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    } else if (!loading && user && !user.roles.includes("RESP_RH")) {
      router.replace("/403")
    }
  }, [user, loading, router])

  // Load medical visit requests and statistics
  useEffect(() => {
    const loadMedicalData = async () => {
      if (!user) return
      
      setLoadingRequests(true)
      try {
        // Load pending requests
        const pendingResponse = await medicalVisitAPI.getPendingRequests()
        setPendingRequests(pendingResponse.data)
        
        // Load statistics
        const statsResponse = await medicalVisitAPI.getRequestCounts()
        
        setRequestStats({
          pending: statsResponse.data.PENDING || 0,
          proposed: statsResponse.data.PROPOSED || 0,
          confirmed: statsResponse.data.CONFIRMED || 0
        })
      } catch (error) {
        console.error("Error loading medical visit data:", error)
      } finally {
        setLoadingRequests(false)
      }
    }

    loadMedicalData()
  }, [user])
  if (loading) return null;
  if (!user || !user.roles.includes("RESP_RH")) {
    return null;
  }

  const responsibilities = [
    {
      icon: UserPlus,
      text: t("Recrutement et intégration des nouveaux employés"),
      color: "from-purple-500 to-purple-700",
    },
    {
      icon: Calendar,
      text: t("Gestion des plannings et congés du personnel"),
      color: "from-purple-600 to-purple-800",
    },
    {
      icon: Award,
      text: t("Formation et développement des compétences"),
      color: "from-purple-700 to-purple-900",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-950 p-4">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-20 h-20 bg-purple-200/20 dark:bg-purple-800/20 rounded-full animate-pulse"></div>
        <div
          className="absolute top-40 right-32 w-16 h-16 bg-purple-300/20 dark:bg-purple-700/20 rounded-full animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-40 w-12 h-12 bg-purple-400/20 dark:bg-purple-600/20 rounded-full animate-ping"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 right-20 w-8 h-8 bg-purple-500/20 dark:bg-purple-500/20 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8 animate-slide-down">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
              RH
            </span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setLanguage(language === "en" ? "fr" : "en")}
              className="h-8 px-3 text-xs font-medium rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 flex items-center gap-1 text-foreground dark:text-white"
            >
              <Globe className="h-3 w-3" />
              {language === "en" ? "FR" : "EN"}
            </button>
            <ThemeToggle />
          </div>
        </div>
        {/* NotificationBell and Profile Dropdown aligned right */}
        <div className="flex items-center gap-4">
          <NotificationBell userId={user?.sub?.toString() ?? ''} gradient="linear-gradient(90deg, #a21caf 0%, #6d28d9 100%)" menuGradient="linear-gradient(90deg, #a21caf 0%, #6d28d9 100%)" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-all duration-300 hover:scale-105">
                <div className="h-6 w-6 bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                  <User className="h-3 w-3 text-white" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{user?.username}</span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-xl rounded-xl">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground dark:text-white p-3">
                  <User className="h-4 w-4" /> {t("Mon profil")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400 flex items-center gap-2 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 p-3">
                <LogOut className="h-4 w-4" /> {t("Déconnexion")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto mt-16">
        {/* Welcome Card */}
        <div
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-600 to-purple-800 p-8 text-center">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg mb-2">{t("Bienvenue sur votre espace")}</h1>
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-5 w-5 text-white/80" />
                <span className="text-lg font-semibold text-white/90">{t("Responsable RH")}</span>
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
                <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t("Vous êtes connecté en tant que")}</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{user.roles[0]}</p>
                </div>
              </div>
            </div>
          )}

          {/* Responsibilities */}
          <div className="p-6">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("Vos responsabilités")}</h2>
            </div>
            <div className="space-y-4">
              {responsibilities.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-300 hover:scale-[1.02] animate-fade-in"
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

          {/* Medical Visit Requests Section */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Stethoscope className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Demandes de visite médicale</h2>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="text-center p-4">
                <CardContent className="p-2">
                  <div className="text-2xl font-bold text-orange-600">{requestStats.pending}</div>
                  <div className="text-sm text-slate-600">En attente</div>
                </CardContent>
              </Card>
              <Card className="text-center p-4">
                <CardContent className="p-2">
                  <div className="text-2xl font-bold text-blue-600">{requestStats.proposed}</div>
                  <div className="text-sm text-slate-600">Proposées</div>
                </CardContent>
              </Card>
              <Card className="text-center p-4">
                <CardContent className="p-2">
                  <div className="text-2xl font-bold text-green-600">{requestStats.confirmed}</div>
                  <div className="text-sm text-slate-600">Confirmées</div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Requests List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-slate-900 dark:text-slate-100">
                  Demandes en attente ({pendingRequests.length})
                </h3>
                <Link href="/demande-visite-medicale">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Voir tout
                  </Button>
                </Link>
              </div>

              {loadingRequests ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-300"></div>
                  <span className="ml-2 text-slate-600">Chargement...</span>
                </div>
              ) : pendingRequests.length > 0 ? (
                <div className="space-y-3">
                  {pendingRequests.slice(0, 3).map((request) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {request.employeeName}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                              {request.motif}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(request.dateSouhaitee), "dd/MM/yyyy", { locale: fr })}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {request.employeeDepartment}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Traiter
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-slate-600">
                  <Stethoscope className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p>Aucune demande en attente</p>
                </div>
              )}
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
