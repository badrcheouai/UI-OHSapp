"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from "@/components/language-toggle"
import { useTheme } from "@/contexts/ThemeContext"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Globe, Heart, Thermometer, Shield, Activity, ChevronDown, Pill, UserCheck, Stethoscope, Clock, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { useState } from "react"
import { useEffect } from "react"
import { medicalVisitAPI, MedicalVisitRequest } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function DashboardInfirmier() {
  const { user, logout, loading } = useAuth()
  const { t } = useTranslation()
  const { themeColors, isDark } = useTheme()
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div 
          className="animate-spin rounded-full h-16 w-16 border-b-2 mb-4"
          style={{ borderColor: themeColors.colors.primary[600] }}
        ></div>
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    } else if (!loading && user && !user.roles.includes("INFIRMIER_ST")) {
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
      } catch (error: any) {
        console.error("Error loading medical visit data:", error)
        
        // Check if it's a timeout or connection error
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.message?.includes('Network Error')) {
          console.log("Backend not available, using demo data for infirmier dashboard")
          
          // Demo data for infirmier
          const demoRequests: MedicalVisitRequest[] = [
            {
              id: 1,
              employeeId: 1,
              employeeName: "Jean Dupont",
              employeeDepartment: "Informatique",
              motif: "Consultation de routine",
              dateSouhaitee: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
              heureSouhaitee: "14:30",
              status: 'PENDING',
              notes: "Demande de visite médicale de routine",
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
              updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 2,
              employeeId: 2,
              employeeName: "Marie Martin",
              employeeDepartment: "Production",
              motif: "Douleurs dorsales",
              dateSouhaitee: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
              heureSouhaitee: "10:00",
              status: 'PENDING',
              notes: "Douleurs dorsales persistantes depuis 3 jours",
              createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
              updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 3,
              employeeId: 3,
              employeeName: "Pierre Durand",
              employeeDepartment: "Maintenance",
              motif: "Contrôle post-accident",
              dateSouhaitee: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
              heureSouhaitee: "16:00",
              status: 'PENDING',
              notes: "Contrôle médical suite à un petit accident de travail",
              createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
              updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            }
          ]
          
          console.log("Setting demo requests:", demoRequests)
          setPendingRequests(demoRequests)
          setRequestStats({
            pending: 3,
            proposed: 2,
            confirmed: 5
          })
        }
      } finally {
        setLoadingRequests(false)
      }
    }

    loadMedicalData()
  }, [user])
  if (loading) return null;
  if (!user || !user.roles.includes("INFIRMIER_ST")) {
    return null;
  }

  const responsibilities = [
    {
      icon: Stethoscope,
      text: "Demande de Visite Médicale",
      color: `from-${themeColors.colors.primary[600]} to-${themeColors.colors.primary[800]}`,
    },
  ]

  // Debug: Log current state
  console.log("Current pendingRequests:", pendingRequests)
  console.log("Current requestStats:", requestStats)



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950">
      {/* Navigation */}
      <DashboardNavigation userRole={user.roles[0]} currentPage="dashboard" />
      
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

      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {/* Welcome Card */}
          <div
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden animate-slide-up"
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
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg mb-2">{t("Bienvenue sur votre espace")}</h1>
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5 text-white/80" />
                  <span className="text-lg font-semibold text-white/90">{t("Infirmier Santé Travail")}</span>
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
                <div 
                  className="h-5 w-5 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`
                  }}
                >
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("Vos responsabilités")}</h2>
              </div>
              <div className="space-y-4">
                {responsibilities.map((item, idx) => (
                  <Link
                    key={idx}
                    href="/demande-visite-medicale"
                    className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:scale-[1.02] animate-fade-in cursor-pointer shadow-lg hover:shadow-xl"
                    style={{ 
                      animationDelay: `${0.4 + idx * 0.1}s`,
                      background: isDark ? '#1e293b' : 'white',
                      boxShadow: `0 10px 25px -3px ${themeColors.colors.primary[500]}20, 0 4px 6px -2px ${themeColors.colors.primary[500]}10`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark ? '#334155' : `${themeColors.colors.primary[50]}`
                      e.currentTarget.style.boxShadow = `0 20px 40px -3px ${themeColors.colors.primary[500]}30, 0 8px 12px -2px ${themeColors.colors.primary[500]}20`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDark ? '#1e293b' : 'white'
                      e.currentTarget.style.boxShadow = `0 10px 25px -3px ${themeColors.colors.primary[500]}20, 0 4px 6px -2px ${themeColors.colors.primary[500]}10`
                    }}
                  >
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
                        boxShadow: `0 10px 25px -3px ${themeColors.colors.primary[500]}40, 0 4px 6px -2px ${themeColors.colors.primary[500]}20`
                      }}
                    >
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">{item.text}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Gérer les demandes de visites médicales</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Medical Visit Requests Section */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div 
                  className="h-5 w-5 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`
                  }}
                >
                  <Stethoscope className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Demandes de visite médicale</h2>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700">
                  <CardContent className="p-2">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{requestStats.pending}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">En attente</div>
                  </CardContent>
                </Card>
                <Card className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
                  <CardContent className="p-2">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{requestStats.proposed}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Proposées</div>
                  </CardContent>
                </Card>
                <Card className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
                  <CardContent className="p-2">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{requestStats.confirmed}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Confirmées</div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Requests List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-semibold text-slate-900 dark:text-slate-100">
                    Demandes en attente ({pendingRequests.length})
                  </h3>
                  <Link href="/demande-visite-medicale-infirmier">
                    <Button size="sm" className="bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700">
                      Voir tout
                    </Button>
                  </Link>
                </div>

                {loadingRequests ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
                    <span className="ml-2 text-slate-600">Chargement...</span>
                  </div>
                ) : pendingRequests.length > 0 ? (
                  <div className="space-y-3">
                    {pendingRequests.slice(0, 3).map((request) => (
                      <Card key={request.id} className="hover:shadow-md transition-shadow bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                  {request.employeeName}
                                </span>
                                <Badge variant="secondary">
                                  Normal
                                </Badge>
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
                            <Link href="/demande-visite-medicale-infirmier">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700 font-medium"
                              >
                                Traiter
                              </Button>
                            </Link>
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


        </div>
      </div>
    </div>
  )
}
