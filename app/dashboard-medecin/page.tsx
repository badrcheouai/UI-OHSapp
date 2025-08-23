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

export default function DashboardMedecin() {
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Tableau de bord médical - Médecin
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Vue d'ensemble des visites médicales et analyses pour le médecin du travail
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-40">
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
                variant="outline"
                className="border-slate-300 dark:border-slate-600"
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
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total demandes</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{metrics.totalRequests}</p>
              </div>
                    <div 
                      className="h-12 w-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`
                      }}
                    >
                      <Stethoscope className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Requests */}
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">En attente</p>
                      <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{metrics.pendingRequests}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
                  </CardContent>
                </Card>

              {/* Proposed Requests */}
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Proposés</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{metrics.proposedRequests}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  </CardContent>
                </Card>

              {/* Confirmed Requests */}
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Confirmés</p>
                      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.confirmedRequests}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  </CardContent>
                </Card>
              </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              {/* Urgent Visits */}
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Visites urgentes</CardTitle>
                  <CardDescription>Reprise et surveillance particulière</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
                      {urgentVisits}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Nécessitent attention</span>
                </div>
                  </div>
                </CardContent>
              </Card>

              {/* Visit Type Distribution */}
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Types de visite</CardTitle>
                  <CardDescription>Répartition par type de visite pour cette période</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Reprise</span>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                        {filteredRequests.filter(r => r.visitType === 'REPRISE').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Embauche</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {filteredRequests.filter(r => r.visitType === 'EMBAUCHE').length}
                      </Badge>
                              </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Spontanée</span>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        {filteredRequests.filter(r => r.visitType === 'SPONTANEE').length}
                      </Badge>
                              </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Périodique</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {filteredRequests.filter(r => r.visitType === 'PERIODIQUE').length}
                      </Badge>
                            </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Surveillance particulière</span>
                      <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        {filteredRequests.filter(r => r.visitType === 'SURVEILLANCE_PARTICULIERE').length}
                      </Badge>
                          </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Appel médecin</span>
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {filteredRequests.filter(r => r.visitType === 'APPEL_MEDECIN').length}
                      </Badge>
                  </div>
                  </div>
                </CardContent>
              </Card>
            </div>


        </div>
      </div>
    </div>
  )
}
