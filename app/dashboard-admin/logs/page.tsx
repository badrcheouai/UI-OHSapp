"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useLanguage } from "@/hooks/use-language"
import { AdminNavigation } from "@/components/admin-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  User,
  Shield,
  Database,
  Activity,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Plus,
  Minus,
  Lock,
  Unlock,
} from "lucide-react"

interface LogEntry {
  id: string
  timestamp: string
  level: "INFO" | "WARNING" | "ERROR" | "SUCCESS"
  category: "AUTH" | "USER" | "SYSTEM" | "SECURITY" | "ADMIN"
  message: string
  userId?: string
  username?: string
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
}

export default function LogsPage() {
  const { user, accessToken } = useAuth()
  const { themeColors } = useTheme()
  const { language, setLanguage } = useLanguage()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h")

  const text = {
    fr: {
      title: "Logs de Sécurité",
      description: "Surveillez l'activité et les événements de sécurité",
      search: "Rechercher dans les logs...",
      filterByLevel: "Filtrer par niveau",
      filterByCategory: "Filtrer par catégorie",
      filterByTime: "Filtrer par période",
      allLevels: "Tous les niveaux",
      allCategories: "Toutes les catégories",
      allTimeRanges: "Toutes les périodes",
      info: "Information",
      warning: "Avertissement",
      error: "Erreur",
      success: "Succès",
      auth: "Authentification",
      user: "Utilisateur",
      system: "Système",
      security: "Sécurité",
      admin: "Administration",
      last24h: "Dernières 24h",
      last7d: "Derniers 7 jours",
      last30d: "Derniers 30 jours",
      export: "Exporter",
      refresh: "Actualiser",
      noLogs: "Aucun log trouvé",
      loading: "Chargement des logs...",
      timestamp: "Horodatage",
      level: "Niveau",
      category: "Catégorie",
      message: "Message",
      ipAddress: "Adresse IP",
      details: "Détails",
      // Stats
      totalLogs: "Total Logs",
      errorsToday: "Erreurs Aujourd'hui",
      warningsToday: "Avertissements Aujourd'hui",
      securityEvents: "Événements de Sécurité",
    },
    en: {
      title: "Security Logs",
      description: "Monitor activity and security events",
      search: "Search logs...",
      filterByLevel: "Filter by level",
      filterByCategory: "Filter by category",
      filterByTime: "Filter by time range",
      allLevels: "All levels",
      allCategories: "All categories",
      allTimeRanges: "All time ranges",
      info: "Information",
      warning: "Warning",
      error: "Error",
      success: "Success",
      auth: "Authentication",
      user: "User",
      system: "System",
      security: "Security",
      admin: "Administration",
      last24h: "Last 24h",
      last7d: "Last 7 days",
      last30d: "Last 30 days",
      export: "Export",
      refresh: "Refresh",
      noLogs: "No logs found",
      loading: "Loading logs...",
      timestamp: "Timestamp",
      level: "Level",
      category: "Category",
      message: "Message",
      ipAddress: "IP Address",
      details: "Details",
      // Stats
      totalLogs: "Total Logs",
      errorsToday: "Errors Today",
      warningsToday: "Warnings Today",
      securityEvents: "Security Events",
    },
  }

  const t = text[language as keyof typeof text]

  // Mock data for demonstration
  const mockLogs: LogEntry[] = [
    {
      id: "1",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      level: "INFO",
      category: "AUTH",
      message: "User login successful",
      userId: "user123",
      username: "john.doe",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      level: "WARNING",
      category: "SECURITY",
      message: "Multiple failed login attempts detected",
      userId: "user456",
      username: "jane.smith",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0...",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      level: "ERROR",
      category: "SYSTEM",
      message: "Database connection timeout",
      ipAddress: "192.168.1.102",
      userAgent: "System/1.0",
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      level: "SUCCESS",
      category: "ADMIN",
      message: "User account created successfully",
      userId: "user789",
      username: "admin",
      ipAddress: "192.168.1.103",
      userAgent: "Mozilla/5.0...",
    },
    {
      id: "5",
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      level: "INFO",
      category: "USER",
      message: "Profile updated",
      userId: "user123",
      username: "john.doe",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
    },
    {
      id: "6",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      level: "WARNING",
      category: "SECURITY",
      message: "Suspicious activity detected",
      userId: "user456",
      username: "jane.smith",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0...",
    },
    {
      id: "7",
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      level: "ERROR",
      category: "AUTH",
      message: "Invalid token provided",
      ipAddress: "192.168.1.104",
      userAgent: "Mozilla/5.0...",
    },
    {
      id: "8",
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      level: "SUCCESS",
      category: "ADMIN",
      message: "User role updated",
      userId: "user789",
      username: "admin",
      ipAddress: "192.168.1.103",
      userAgent: "Mozilla/5.0...",
    },
  ]

  const fetchLogs = async () => {
    try {
      setLoading(true)
      if (!accessToken) {
        console.error("No access token available")
        setLogs([])
        return
      }

      const response = await fetch('/api/v1/admin/system-logs?max=50', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const logsData = data.logs || []
        
        // Transform the logs to match our interface
        const transformedLogs: LogEntry[] = logsData.map((log: any) => ({
          id: log.id || Math.random().toString(),
          timestamp: new Date(log.timestamp).toISOString(),
          level: log.level || 'INFO',
          category: log.category || 'SYSTEM',
          message: log.message || 'Unknown event',
          userId: log.userId || 'Unknown User',
          username: log.username || 'Unknown',
          ipAddress: log.ipAddress || 'Unknown',
          userAgent: log.userAgent || 'Unknown',
          details: log.details || {}
        }))
        
        setLogs(transformedLogs)
      } else {
        console.error("Failed to fetch logs")
        setLogs([])
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    let filtered = logs

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by level
    if (selectedLevel !== "all") {
      filtered = filtered.filter(log => log.level === selectedLevel)
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(log => log.category === selectedCategory)
    }

    // Filter by time range
    const now = new Date()
    if (selectedTimeRange === "24h") {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      filtered = filtered.filter(log => new Date(log.timestamp) >= yesterday)
    } else if (selectedTimeRange === "7d") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(log => new Date(log.timestamp) >= weekAgo)
    } else if (selectedTimeRange === "30d") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(log => new Date(log.timestamp) >= monthAgo)
    }

    setFilteredLogs(filtered)
  }, [logs, searchTerm, selectedLevel, selectedCategory, selectedTimeRange])

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "INFO":
        return <Info className="h-4 w-4" />
      case "WARNING":
        return <AlertTriangle className="h-4 w-4" />
      case "ERROR":
        return <AlertTriangle className="h-4 w-4" />
      case "SUCCESS":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "INFO":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "WARNING":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
      case "ERROR":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "SUCCESS":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AUTH":
        return <Shield className="h-4 w-4" />
      case "USER":
        return <User className="h-4 w-4" />
      case "SYSTEM":
        return <Database className="h-4 w-4" />
      case "SECURITY":
        return <Shield className="h-4 w-4" />
      case "ADMIN":
        return <Activity className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const stats = {
    totalLogs: logs.length,
    errorsToday: logs.filter(log => log.level === "ERROR" && new Date(log.timestamp) >= new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
    warningsToday: logs.filter(log => log.level === "WARNING" && new Date(log.timestamp) >= new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
    securityEvents: logs.filter(log => log.category === "SECURITY").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <AdminNavigation language={language} setLanguage={setLanguage} />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="relative flex flex-col items-center justify-center">
            <div className="relative mb-6">
              <div
                className="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-slate-700 animate-spin"
                style={{ borderTopColor: themeColors.colors.primary[600] }}
              ></div>
              <div
                className="absolute inset-0 w-20 h-20 rounded-full animate-ping opacity-20"
                style={{ backgroundColor: themeColors.colors.primary[400] }}
              ></div>
            </div>
            <h2 className="text-slate-700 dark:text-slate-200 text-2xl font-bold mb-2 animate-pulse-slow">
              {t.loading}
            </h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Professional Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-24 right-20 w-28 h-28 rounded-full animate-ping"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[300]}, ${themeColors.colors.primary[500]})`,
            opacity: 0.06,
            animationDelay: "0s",
            animationDuration: "15s",
          }}
        ></div>
        <div
          className="absolute top-48 right-12 w-20 h-20 rounded-full animate-ping"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[200]}, ${themeColors.colors.primary[400]})`,
            opacity: 0.04,
            animationDelay: "5s",
            animationDuration: "18s",
          }}
        ></div>
        <div
          className="absolute top-72 right-28 w-16 h-16 rounded-full animate-ping"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[600]})`,
            opacity: 0.03,
            animationDelay: "2s",
            animationDuration: "20s",
          }}
        ></div>
      </div>

      <AdminNavigation language={language} setLanguage={setLanguage} />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 animate-slide-down">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-orange-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              {t.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">{t.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300"
            >
              <Download className="h-4 w-4" />
              {t.export}
            </Button>
            <Button
              onClick={fetchLogs}
              variant="outline"
              className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300"
            >
              <RefreshCw className="h-4 w-4" />
              {t.refresh}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/95 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t.totalLogs}</CardTitle>
              <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-700/50 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-600/50 transition-colors">
                <FileText className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stats.totalLogs}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total log entries</div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t.errorsToday}</CardTitle>
              <div className="p-2 rounded-xl bg-red-100/80 dark:bg-red-900/50 group-hover:bg-red-200/80 dark:group-hover:bg-red-800/50 transition-colors">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stats.errorsToday}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Errors in last 24h</div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t.warningsToday}</CardTitle>
              <div className="p-2 rounded-xl bg-orange-100/80 dark:bg-orange-900/50 group-hover:bg-orange-200/80 dark:group-hover:bg-orange-800/50 transition-colors">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stats.warningsToday}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Warnings in last 24h</div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t.securityEvents}</CardTitle>
              <div className="p-2 rounded-xl bg-purple-100/80 dark:bg-purple-900/50 group-hover:bg-purple-200/80 dark:group-hover:bg-purple-800/50 transition-colors">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stats.securityEvents}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Security events</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/95 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white"
                />
              </div>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full md:w-48 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white">
                  <SelectValue placeholder={t.filterByLevel} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allLevels}</SelectItem>
                  <SelectItem value="INFO">{t.info}</SelectItem>
                  <SelectItem value="WARNING">{t.warning}</SelectItem>
                  <SelectItem value="ERROR">{t.error}</SelectItem>
                  <SelectItem value="SUCCESS">{t.success}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white">
                  <SelectValue placeholder={t.filterByCategory} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allCategories}</SelectItem>
                  <SelectItem value="AUTH">{t.auth}</SelectItem>
                  <SelectItem value="USER">{t.user}</SelectItem>
                  <SelectItem value="SYSTEM">{t.system}</SelectItem>
                  <SelectItem value="SECURITY">{t.security}</SelectItem>
                  <SelectItem value="ADMIN">{t.admin}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-full md:w-48 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white">
                  <SelectValue placeholder={t.filterByTime} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allTimeRanges}</SelectItem>
                  <SelectItem value="24h">{t.last24h}</SelectItem>
                  <SelectItem value="7d">{t.last7d}</SelectItem>
                  <SelectItem value="30d">{t.last30d}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="bg-white/95 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">{t.title}</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'log entry' : 'log entries'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">{t.noLogs}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200/60 dark:border-slate-700/60">
                    <TableHead className="text-slate-700 dark:text-slate-300">{t.timestamp}</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">{t.level}</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">{t.category}</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">{t.message}</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">{t.user}</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">{t.ipAddress}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                      <TableCell className="text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`flex items-center gap-1 ${getLevelColor(log.level)}`}>
                          {getLevelIcon(log.level)}
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {getCategoryIcon(log.category)}
                          {log.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-900 dark:text-white max-w-md">
                        <div className="truncate" title={log.message}>
                          {log.message}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        {log.username ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {log.username}
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        {log.ipAddress || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 