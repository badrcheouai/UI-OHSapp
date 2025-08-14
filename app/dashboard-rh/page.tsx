"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from "@/components/language-toggle"
import { useTheme } from "@/contexts/ThemeContext"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { medicalVisitAPI, MedicalVisitRequest } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Users, Shield, Award, Calendar, Stethoscope } from "lucide-react"

export default function DashboardRH() {
  const { user, logout, loading } = useAuth()
  const { t } = useTranslation()
  const { themeColors } = useTheme()
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
      icon: Users,
      text: t("Gestion des salariés"),
      color: "from-blue-500 to-blue-700",
      link: "/rh/employees"
    },
    {
      icon: Calendar,
      text: t("Visites médicales – Embauche & Reprise"),
      color: "from-green-500 to-green-700",
      link: "/rh/visites"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950">
      <DashboardNavigation userRole="RESP_RH" currentPage="dashboard" />
      
      <div className="container mx-auto px-6 py-8">
        {/* Floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-20 left-20 w-20 h-20 rounded-full animate-pulse"
            style={{ backgroundColor: `${themeColors.colors.primary[200]}20` }}
          ></div>
          <div
            className="absolute top-40 right-32 w-16 h-16 rounded-full animate-bounce"
            style={{ 
              backgroundColor: `${themeColors.colors.primary[300]}20`,
              animationDelay: "1s" 
            }}
          ></div>
          <div
            className="absolute bottom-32 left-40 w-12 h-12 rounded-full animate-ping"
            style={{ 
              backgroundColor: `${themeColors.colors.primary[400]}20`,
              animationDelay: "2s" 
            }}
          ></div>
          <div
            className="absolute top-1/2 right-20 w-8 h-8 rounded-full animate-pulse"
            style={{ 
              backgroundColor: `${themeColors.colors.primary[500]}20`,
              animationDelay: "0.5s" 
            }}
          ></div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
        {/* Welcome Card */}
        <div
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl border-0 overflow-hidden animate-slide-up"
          style={{ 
            animationDelay: "0.2s",
            boxShadow: `0 25px 50px -12px ${themeColors.colors.primary[500]}20, 0 10px 20px -3px ${themeColors.colors.primary[500]}10`
          }}
        >
          {/* Header */}
          <div 
            className="relative p-8 text-center"
            style={{
              background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`
            }}
          >
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
                <div 
                  className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
                    boxShadow: `0 10px 25px -3px ${themeColors.colors.primary[500]}40, 0 4px 6px -2px ${themeColors.colors.primary[500]}20`
                  }}
                >
                  <Users className="h-5 w-5 text-white" />
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
                              <Shield className="h-5 w-5 text-slate-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("Vos responsabilités")}</h2>
            </div>
            <div className="space-y-4">
              {responsibilities.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/80 dark:bg-slate-800/80 border-0 shadow-lg hover:shadow-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 hover:scale-[1.02] animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
                  onClick={() => router.push(item.link)}
                >
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                    style={{
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`
                    }}
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
                <Stethoscope className="h-5 w-5 text-slate-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Demandes de visite médicale</h2>
              </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-0 shadow-lg">
                <CardContent className="p-2">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{requestStats.pending}</div>
                  <div className="text-sm text-red-600 dark:text-red-500">En attente</div>
                </CardContent>
              </Card>
              <Card className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-0 shadow-lg">
                <CardContent className="p-2">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{requestStats.proposed}</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-500">Proposées</div>
                </CardContent>
              </Card>
              <Card className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0 shadow-lg">
                <CardContent className="p-2">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{requestStats.confirmed}</div>
                  <div className="text-sm text-green-600 dark:text-green-500">Confirmées</div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Requests List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-slate-900 dark:text-slate-100">
                  Demandes en attente ({pendingRequests.length})
                </h3>
                <Button size="sm" className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  Voir tout
                </Button>
              </div>

              {loadingRequests ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
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
                                <Stethoscope className="h-3 w-3" />
                                {format(new Date(request.dateSouhaitee), "dd/MM/yyyy", { locale: fr })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
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

        {/* Close Main Content wrapper */}
        </div>
        
        {/* Development Note */}
        <div
          className="mt-6 p-4 bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <p className="text-sm text-slate-700 dark:text-slate-400 text-center font-medium">
            🚧 {t("Page de démonstration - Fonctionnalités en cours de développement")}
          </p>
        </div>
        {/* Close container */}
      </div>
    </div>
  )
}
