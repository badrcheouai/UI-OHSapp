"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { 
  Stethoscope, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  Users, 
  Calendar,
  TrendingUp,
  FileText,
  Activity,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Eye,
  Plus
} from "lucide-react"
import { medicalVisitAPI, MedicalVisitRequest } from "@/lib/api"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function DashboardInfirmier() {
  const { user, loading } = useAuth()
  const { themeColors, isDark } = useTheme()
  const router = useRouter()
  
  const [requests, setRequests] = useState<MedicalVisitRequest[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [timeRange, setTimeRange] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'YEAR'>('WEEK')
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'reports'>('overview')

  // Helper function to get theme color
  const getThemeColor = (shade: keyof typeof themeColors.colors.primary) => {
    return themeColors.colors.primary[shade]
  }

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    } else if (!loading && user && !user.roles.includes("INFIRMIER_ST") && !user.roles.includes("MEDECIN_TRAVAIL")) {
      router.replace("/403")
    } else if (!loading && user && (user.roles.includes("INFIRMIER_ST") || user.roles.includes("MEDECIN_TRAVAIL"))) {
      loadDashboardData()
    }
  }, [user, loading, router, timeRange])

  const loadDashboardData = async () => {
    setLoadingData(true)
    try {
      const response = await medicalVisitAPI.getAllRequests()
      setRequests(response.data)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      setRequests([])
    } finally {
      setLoadingData(false)
    }
  }

  // Calculate statistics based on time range
  const getFilteredRequests = () => {
    const now = new Date()
    const filtered = requests.filter(request => {
      const requestDate = new Date(request.createdAt)
      switch (timeRange) {
        case 'TODAY':
          return requestDate.toDateString() === now.toDateString()
        case 'WEEK':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return requestDate >= weekAgo
        case 'MONTH':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return requestDate >= monthAgo
        case 'YEAR':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          return requestDate >= yearAgo
        default:
          return true
      }
    })
    return filtered
  }

  const filteredRequests = getFilteredRequests()

  // Calculate key metrics
  const metrics = {
    totalRequests: filteredRequests.length,
    pendingRequests: filteredRequests.filter(r => r.status === 'PENDING').length,
    proposedRequests: filteredRequests.filter(r => r.status === 'PROPOSED').length,
    confirmedRequests: filteredRequests.filter(r => r.status === 'CONFIRMED').length,
    repriseVisits: filteredRequests.filter(r => r.visitType === 'REPRISE').length,
    embaucheVisits: filteredRequests.filter(r => r.visitType === 'EMBAUCHE').length,
    spontaneeVisits: filteredRequests.filter(r => r.visitType === 'SPONTANEE').length,
    periodiqueVisits: filteredRequests.filter(r => r.visitType === 'PERIODIQUE').length
  }

  // Calculate response rate
  const responseRate = metrics.proposedRequests > 0 
    ? Math.round((metrics.confirmedRequests / metrics.proposedRequests) * 100)
    : 0

  // Calculate planning efficiency (first-time confirmation rate)
  const planningEfficiency = metrics.proposedRequests > 0 
    ? Math.round((metrics.confirmedRequests / metrics.proposedRequests) * 100)
    : 0

  // Calculate urgent visits (REPRISE and SURVEILLANCE_PARTICULIERE) for the selected time range
  const urgentVisits = filteredRequests.filter(r => 
    r.visitType === 'REPRISE' || r.visitType === 'SURVEILLANCE_PARTICULIERE'
  ).length

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div 
          className="animate-spin rounded-full h-16 w-16 border-b-2 mb-4"
          style={{ borderColor: getThemeColor(500) }}
        ></div>
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  if (!user || (!user.roles.includes("INFIRMIER_ST") && !user.roles.includes("MEDECIN_TRAVAIL"))) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950">
      <DashboardNavigation userRole={user.roles[0]} currentPage="dashboard" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl p-8 mb-8 shadow-xl">
          <div 
            className="absolute inset-0 opacity-90"
          style={{ 
              background: `linear-gradient(135deg, ${getThemeColor(50)} 0%, ${getThemeColor(100)} 50%, ${getThemeColor(200)} 100%)`
            }}
          />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                    background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`
              }}
            >
                  <Stethoscope className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                  Tableau de bord infirmier
                </h1>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-lg ml-18">
                Vue d'ensemble des visites médicales et statistiques en temps réel
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-48 h-12 bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODAY">Aujourd'hui</SelectItem>
                  <SelectItem value="WEEK">Cette semaine</SelectItem>
                  <SelectItem value="MONTH">Ce mois</SelectItem>
                  <SelectItem value="YEAR">Cette année</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={loadDashboardData}
                disabled={loadingData}
                className="h-12 px-6 bg-white/90 backdrop-blur-sm text-slate-700 border-0 shadow-lg rounded-xl hover:bg-white hover:shadow-xl transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
                  </div>
                </div>
              </div>

        {/* Dashboard Content */}
        <div className="space-y-6">
                        {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Requests */}
              <Card className="relative group bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                <div 
                  className="absolute top-0 left-0 w-full h-1 opacity-80"
                  style={{
                    background: `linear-gradient(90deg, ${getThemeColor(500)}, ${getThemeColor(600)})`
                  }}
                />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Total demandes</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{metrics.totalRequests}</p>
              </div>
                    <div 
                      className="h-14 w-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`
                      }}
                    >
                      <Stethoscope className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Requests */}
              <Card className="relative group bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-500 to-slate-600 opacity-80" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">En attente</p>
                      <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">{metrics.pendingRequests}</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-7 w-7 text-white" />
              </div>
            </div>
                  </CardContent>
                </Card>

              {/* Proposed Requests */}
              <Card className="relative group bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 opacity-80" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Proposés</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{metrics.proposedRequests}</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <AlertCircle className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  </CardContent>
                </Card>

              {/* Confirmed Requests */}
              <Card className="relative group bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-80" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Confirmés</p>
                      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.confirmedRequests}</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  </CardContent>
                </Card>
              </div>

                        {/* Visit Types Distribution */}
            <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`
                    }}
                  >
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Types de visite</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Répartition par type de visite pour cette période
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Reprise</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {filteredRequests.filter(r => r.visitType === 'REPRISE').length}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Embauche</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {filteredRequests.filter(r => r.visitType === 'EMBAUCHE').length}
                                </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Spontanée</span>
                              </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {filteredRequests.filter(r => r.visitType === 'SPONTANEE').length}
                                </span>
                              </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Périodique</span>
                            </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {filteredRequests.filter(r => r.visitType === 'PERIODIQUE').length}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Surveillance</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {filteredRequests.filter(r => r.visitType === 'SURVEILLANCE_PARTICULIERE').length}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                              <span className="font-medium text-slate-700 dark:text-slate-300">À l'appel du médecin</span>
              </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {filteredRequests.filter(r => r.visitType === 'APPEL_MEDECIN').length}
                    </span>
            </div>
          </div>
              </CardContent>
            </Card>


        </div>
      </div>
    </div>
  )
}
