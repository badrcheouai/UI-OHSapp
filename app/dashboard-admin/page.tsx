"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminNavigation } from "@/components/admin-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Users,
  User,
  Shield,
  Key,
  Mail,
  Clock,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Plus,
  Settings,
  Activity,
  BarChart3,
  Crown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  UserCheck,
  UserX,
  ShieldCheck,
  AlertCircle,
  Info,
  Database,
  Server,
  Network,
  HardDrive,
  Cpu,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Users2,
  ShieldAlert,
  BarChart,
  Settings as SettingsIcon,
  Search,
  Filter,
  MoreHorizontal,
  Stethoscope,
  Sparkles,
  Star,
  Globe,
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { KeycloakUser, AdminStats } from "@/lib/keycloak-admin"
import { toast } from "sonner"

interface User extends KeycloakUser {
  roles: string[]
  createdAt: string
}

interface SecurityLog {
  id: string
  timestamp: string
  action: string
  user: string
  resource: string
  status: 'SUCCESS' | 'FAILED' | 'WARNING'
  ipAddress: string
  userAgent: string
}

// Role configuration with enhanced colors and no pink
const AVAILABLE_ROLES = [
  { value: "ADMIN", label: "Administrateur", icon: Crown, color: "bg-gradient-to-br from-red-600 via-red-500 to-red-700 text-white border-2 border-red-400 dark:border-red-600 font-bold shadow-lg" },
  { value: "RESP_HSE", label: "Teams HSE", icon: Shield, color: "bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 text-white shadow-md" },
  { value: "RH", label: "Responsable RH", icon: Users, color: "bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 text-white shadow-md" },
  { value: "INFIRMIER_ST", label: "Infirmier", icon: Stethoscope, color: "bg-gradient-to-br from-emerald-600 via-green-500 to-teal-700 text-white shadow-md" },
  { value: "MEDECIN_TRAVAIL", label: "Médecin", icon: User, color: "bg-gradient-to-br from-cyan-500 via-blue-500 to-sky-500 text-white shadow-md" },
  { value: "SALARIE", label: "Employé", icon: User, color: "bg-gradient-to-br from-slate-500 via-gray-500 to-zinc-500 text-white shadow-md" }
]

export default function AdminDashboardPage() {
  const { user, loading, accessToken } = useAuth()
  const { themeColors } = useTheme()
  const { language, setLanguage } = useLanguage()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const text = {
    fr: {
      title: "Tableau de Bord Administrateur",
      subtitle: "Gestion complète des utilisateurs et de la plateforme",
      welcome: "Bienvenue",
      stats: {
        totalUsers: "Utilisateurs Totaux",
        activeUsers: "Utilisateurs Actifs",
        disabledUsers: "Utilisateurs Désactivés",
        pendingVerification: "En Attente de Vérification",
        totalRoles: "Rôles Disponibles",
        recentLogins: "Connexions Récentes",
      },
      status: {
        active: "Actif",
        inactive: "Inactif",
        verified: "Vérifié",
        unverified: "Non vérifié",
      },
      logs: {
        title: "Journaux de Sécurité",
        description: "Activité système et tentatives d'accès",
        success: "Succès",
        failed: "Échec",
        warning: "Avertissement",
      },
  
      userManagement: "Gestion des Utilisateurs",
      manageUsers: "Gérer les Utilisateurs",
      activeUsers: "utilisateurs actifs",
      active: "actifs",
      editUser: "Modifier l'utilisateur",
      editUserDescription: "Modifiez les informations de l'utilisateur.",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      roles: "Rôles",
      selectRole: "Sélectionner un rôle",
      cancel: "Annuler",
      update: "Mettre à jour",
    },
    en: {
      title: "Admin Dashboard",
      subtitle: "Complete user and platform management",
      welcome: "Welcome",
      stats: {
        totalUsers: "Total Users",
        activeUsers: "Active Users",
        disabledUsers: "Disabled Users",
        pendingVerification: "Pending Verification",
        totalRoles: "Available Roles",
        recentLogins: "Recent Logins",
      },
      status: {
        active: "Active",
        inactive: "Inactive",
        verified: "Verified",
        unverified: "Unverified",
      },
      logs: {
        title: "Security Logs",
        description: "System activity and access attempts",
        success: "Success",
        failed: "Failed",
        warning: "Warning",
      },
  
      userManagement: "User Management",
      manageUsers: "Manage Users",
      activeUsers: "active users",
      active: "active",
      editUser: "Edit User",
      editUserDescription: "Modify user information.",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      roles: "Roles",
      selectRole: "Select a role",
      cancel: "Cancel",
      update: "Update",
    },
  }

  const t = text[language as keyof typeof text]

  useEffect(() => {
    if (!loading && user) {
      if (!user.roles.includes("ADMIN")) {
        router.replace("/403")
        return
      }
      const timer = setTimeout(() => {
        fetchAdminData()
      }, 1500)
      
      return () => clearTimeout(timer)
    } else if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  const fetchAdminData = async () => {
    try {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await Promise.all([
        fetchUsers(),
        fetchStats(),
        fetchLogs()
      ])
    } catch (error) {
      console.error("Error fetching admin data:", error)
      setTimeout(() => {
        fetchAdminData()
      }, 2000)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      if (!accessToken) {
        console.error("No access token available")
        if (user) {
          setUsers([{
            id: user.sub || 'current-user',
            username: user.username,
            email: user.email || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            enabled: true,
            emailVerified: user.emailVerified || false,
            roles: user.roles,
            createdAt: new Date().toISOString(),
          }])
        } else {
          setUsers([])
        }
        return
      }

      const { keycloakAdmin } = await import("@/lib/keycloak-admin")
      const usersData = await keycloakAdmin.getUsers()
      const transformedUsers: User[] = usersData.map((user: KeycloakUser) => ({
        ...user,
        roles: user.realmRoles || [],
        createdAt: new Date().toISOString(),
      }))
      setUsers(transformedUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
      if (user) {
        setUsers([{
          id: user.sub || 'current-user',
          username: user.username,
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          enabled: true,
          emailVerified: user.emailVerified || false,
          roles: user.roles,
          createdAt: new Date().toISOString(),
        }])
      } else {
        setUsers([])
      }
    }
  }

  const fetchStats = async () => {
    try {
      if (!accessToken) {
        console.error("No access token available")
        setStats({
          totalUsers: user ? 1 : 0,
          activeUsers: user ? 1 : 0,
          disabledUsers: 0,
          pendingVerification: 0,
          totalRoles: user?.roles?.length || 0,
          recentLogins: 1,
        })
        return
      }

      try {
        const systemResponse = await fetch('/api/v1/admin/system-stats', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (systemResponse.ok) {
          const systemData = await systemResponse.json()
          setStats({
            totalUsers: systemData.totalUsers || 0,
            activeUsers: systemData.activeUsers || 0,
            disabledUsers: systemData.disabledUsers || 0,
            pendingVerification: systemData.pendingVerification || 0,
            totalRoles: systemData.totalRoles || 0,
            recentLogins: systemData.recentLogins || 0,
          })
          return
        }
      } catch (systemError) {
        // Silently handle 404 for system stats - endpoint might not be implemented
        if (systemError instanceof Error && !systemError.message.includes('404')) {
          console.log("System stats not available, falling back to Keycloak stats")
        }
      }

      const { keycloakAdmin } = await import("@/lib/keycloak-admin")
      const statsData = await keycloakAdmin.getStats()
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching stats:", error)
      setStats({
        totalUsers: user ? 1 : 0,
        activeUsers: user ? 1 : 0,
        disabledUsers: 0,
        pendingVerification: 0,
        totalRoles: user?.roles?.length || 0,
        recentLogins: 1,
      })
    }
  }

  const fetchLogs = async () => {
    try {
      if (!accessToken) {
        console.error("No access token available")
        setLogs([])
        return
      }

      const response = await fetch('/api/v1/admin/analytics-logs?max=10', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const logsData = data.logs || []
        
        const transformedLogs: SecurityLog[] = logsData.map((log: any) => ({
          id: log.id || Math.random().toString(),
          timestamp: new Date(log.timestamp).toISOString(),
          action: log.action || 'UNKNOWN',
          user: log.userId || 'Unknown User',
          resource: '/system',
          status: 'SUCCESS' as const,
          ipAddress: log.ipAddress || 'Unknown',
          userAgent: 'System Event'
        }))
        
        setLogs(transformedLogs)
      } else {
        // Silently handle 404 for analytics logs - endpoint might not be implemented
        if (response.status !== 404) {
          console.error("Failed to fetch logs")
        }
        setLogs([])
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
      setLogs([])
    }
  }

  // Update user
  const updateUser = async () => {
    if (!selectedUser) return

    try {
      const { keycloakAdmin } = await import("@/lib/keycloak-admin")
      
      const userData = {
        username: selectedUser.username,
        email: selectedUser.email,
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        enabled: selectedUser.enabled,
        emailVerified: selectedUser.emailVerified,
        realmRoles: selectedUser.roles,
      }

      await keycloakAdmin.updateUser(selectedUser.id, userData)
      setShowEditDialog(false)
      setSelectedUser(null)
      toast.success("Utilisateur mis à jour avec succès")
      await fetchAdminData()
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Erreur lors de la mise à jour de l'utilisateur")
    }
  }

  // Delete user
  const deleteUser = async (userId: string) => {
    try {
      const { keycloakAdmin } = await import("@/lib/keycloak-admin")
      await keycloakAdmin.deleteUser(userId)
      toast.success("Utilisateur supprimé avec succès")
      await fetchAdminData()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Erreur lors de la suppression de l'utilisateur")
    }
  }

  // Toggle user status
  const toggleUserStatus = async (userId: string, enabled: boolean) => {
    try {
      const { keycloakAdmin } = await import("@/lib/keycloak-admin")
      await keycloakAdmin.updateUser(userId, { enabled: !enabled })
      toast.success(`Utilisateur ${enabled ? 'désactivé' : 'activé'} avec succès`)
      await fetchAdminData()
    } catch (error) {
      console.error("Error toggling user status:", error)
      toast.error("Erreur lors du changement de statut")
    }
  }

  // Get role display
  const getRoleDisplay = (role: string) => {
    const roleConfig = AVAILABLE_ROLES.find(r => r.value === role)
    if (!roleConfig) return { icon: User, label: role, color: "bg-gray-100 text-gray-800" }
    return roleConfig
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center relative overflow-hidden">
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
        
        <div className="relative flex flex-col items-center justify-center z-10">
          <div className="relative mb-6">
            <div
              className="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-slate-700/50 animate-spin"
              style={{ borderTopColor: themeColors.colors.primary[600] }}
            ></div>
            <div
              className="absolute inset-0 w-20 h-20 rounded-full animate-ping opacity-20"
              style={{ backgroundColor: themeColors.colors.primary[400] }}
            ></div>
          </div>
          
          <div className="text-center mb-8">
            <div className="text-lg font-medium text-slate-700 dark:text-slate-200 animate-pulse mb-2">
              {language === "fr" ? "Chargement..." : "Loading..."}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {language === "fr" ? "Préparation du tableau de bord" : "Preparing dashboard"}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !user.roles.includes("ADMIN")) {
    return null
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
        <div className="mb-8 animate-slide-down">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-2xl transition-all duration-500 transform hover:scale-110 hover:rotate-3" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[700]}, ${themeColors.colors.primary[800]})`}}>
                  <Crown className="h-6 w-6 text-white transition-transform duration-500 hover:scale-110" />
                </div>
                {t.title}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                {t.welcome}, <span className="font-semibold text-slate-800 dark:text-slate-200">{user.firstName || user.username}</span>. {t.subtitle}
              </p>
            </div>
            
            {/* Refresh button removed for cleaner UI */}
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            <Card className="admin-widget admin-card-enhanced group relative overflow-hidden bg-white/95 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-105 animate-admin-stats premium-hover admin-widget-delay-1" style={{ animationDelay: "0.1s" }}>
              <div className="absolute inset-0 transition-all duration-700" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[50]}, ${themeColors.colors.primary[100]})`, opacity: 0.08}}></div>
              <div className="absolute inset-0 transition-all duration-700 group-hover:opacity-100 opacity-0" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`, opacity: 0.15}}></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                <CardTitle className="admin-text-glow text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors duration-300 group-hover:text-slate-800 dark:group-hover:text-slate-200">{t.stats.totalUsers}</CardTitle>
                <div className="admin-icon-container p-3 rounded-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[600]})`}}>
                  <Users className="h-6 w-6 text-white transition-transform duration-500 group-hover:scale-110" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="admin-text-glow text-4xl font-bold text-slate-900 dark:text-white mb-2 transition-all duration-300 group-hover:text-slate-800 dark:group-hover:text-slate-100">{stats.totalUsers}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300 group-hover:text-slate-600 dark:group-hover:text-slate-300">Total registered users</div>
              </CardContent>
            </Card>

            <Card className="admin-widget admin-card-enhanced group relative overflow-hidden bg-white/95 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-105 animate-admin-stats premium-hover admin-widget-delay-2" style={{ animationDelay: "0.2s" }}>
              <div className="absolute inset-0 transition-all duration-700" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[50]}, ${themeColors.colors.primary[100]})`, opacity: 0.08}}></div>
              <div className="absolute inset-0 transition-all duration-700 group-hover:opacity-100 opacity-0" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`, opacity: 0.15}}></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                <CardTitle className="admin-text-glow text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors duration-300 group-hover:text-slate-800 dark:group-hover:text-slate-200">{t.stats.activeUsers}</CardTitle>
                <div className="admin-icon-container p-3 rounded-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`}}>
                  <UserCheck className="h-6 w-6 text-white transition-transform duration-500 group-hover:scale-110" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="admin-text-glow text-4xl font-bold text-slate-900 dark:text-white mb-2 transition-all duration-300 group-hover:text-slate-800 dark:group-hover:text-slate-100">{stats.activeUsers}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300 group-hover:text-slate-600 dark:group-hover:text-slate-300">Currently active</div>
              </CardContent>
            </Card>

            <Card className="admin-widget admin-card-enhanced group relative overflow-hidden bg-white/95 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-105 animate-admin-stats premium-hover admin-widget-delay-3" style={{ animationDelay: "0.3s" }}>
              <div className="absolute inset-0 transition-all duration-700" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[50]}, ${themeColors.colors.primary[100]})`, opacity: 0.08}}></div>
              <div className="absolute inset-0 transition-all duration-700 group-hover:opacity-100 opacity-0" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`, opacity: 0.15}}></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                <CardTitle className="admin-text-glow text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors duration-300 group-hover:text-slate-800 dark:group-hover:text-slate-200">{t.stats.disabledUsers}</CardTitle>
                <div className="admin-icon-container p-3 rounded-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`}}>
                  <UserX className="h-6 w-6 text-white transition-transform duration-500 group-hover:scale-110" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="admin-text-glow text-4xl font-bold text-slate-900 dark:text-white mb-2 transition-all duration-300 group-hover:text-slate-800 dark:group-hover:text-slate-100">{stats.disabledUsers}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300 group-hover:text-slate-600 dark:group-hover:text-slate-300">Suspended accounts</div>
              </CardContent>
            </Card>

            <Card className="admin-widget admin-card-enhanced group relative overflow-hidden bg-white/95 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-105 animate-admin-stats premium-hover admin-widget-delay-4" style={{ animationDelay: "0.4s" }}>
              <div className="absolute inset-0 transition-all duration-700" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[50]}, ${themeColors.colors.primary[100]})`, opacity: 0.08}}></div>
              <div className="absolute inset-0 transition-all duration-700 group-hover:opacity-100 opacity-0" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`, opacity: 0.15}}></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                <CardTitle className="admin-text-glow text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors duration-300 group-hover:text-slate-800 dark:group-hover:text-slate-200">{t.stats.pendingVerification}</CardTitle>
                <div className="admin-icon-container p-3 rounded-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[700]}, ${themeColors.colors.primary[900]})`}}>
                  <AlertCircle className="h-6 w-6 text-white transition-transform duration-500 group-hover:scale-110" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="admin-text-glow text-4xl font-bold text-slate-900 dark:text-white mb-2 transition-all duration-300 group-hover:text-slate-800 dark:group-hover:text-slate-100">{stats.pendingVerification}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300 group-hover:text-slate-600 dark:group-hover:text-slate-300">Awaiting verification</div>
              </CardContent>
            </Card>

            <Card className="admin-widget admin-card-enhanced group relative overflow-hidden bg-white/95 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-105 animate-admin-stats premium-hover admin-widget-delay-5" style={{ animationDelay: "0.5s" }}>
              <div className="absolute inset-0 transition-all duration-700" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[50]}, ${themeColors.colors.primary[100]})`, opacity: 0.08}}></div>
              <div className="absolute inset-0 transition-all duration-700 group-hover:opacity-100 opacity-0" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`, opacity: 0.15}}></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                <CardTitle className="admin-text-glow text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors duration-300 group-hover:text-slate-800 dark:group-hover:text-slate-200">{t.stats.recentLogins}</CardTitle>
                <div className="admin-icon-container p-3 rounded-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[800]}, ${themeColors.colors.primary[950]})`}}>
                  <Clock className="h-6 w-6 text-white transition-transform duration-500 group-hover:scale-110" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="admin-text-glow text-4xl font-bold text-slate-900 dark:text-white mb-2 transition-all duration-300 group-hover:text-slate-800 dark:group-hover:text-slate-100">{stats.recentLogins}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300 group-hover:text-slate-600 dark:group-hover:text-slate-300">Last 24 hours</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced User Management Summary */}
        <Card className="bg-gradient-to-br from-white/95 via-slate-50/50 to-white/95 backdrop-blur-md dark:from-slate-900/95 dark:via-slate-800/50 dark:to-slate-900/95 border-0 shadow-2xl rounded-2xl mb-6 animate-admin-card hover:shadow-3xl transition-all duration-700 transform hover:scale-[1.01] premium-hover" style={{ animationDelay: "0.7s" }}>
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[700]}, ${themeColors.colors.primary[800]})`}}>
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {t.userManagement}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    {users.length} {t.activeUsers} • {users.filter((u: User) => u.enabled).length} {t.active}
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/dashboard-admin/users')}
                style={{
                  background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[700]}, ${themeColors.colors.primary[800]})`
                }}
                className="hover:shadow-3xl transition-all duration-500 transform hover:scale-110 active:scale-95 hover:-translate-y-1 px-8 py-3 text-lg font-semibold text-white shadow-2xl btn-premium"
              >
                <Users className="h-5 w-5 mr-3" />
                {t.manageUsers}
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">{t.editUser}</DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                {t.editUserDescription}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-firstName" className="text-right">{t.firstName}</Label>
                  <Input
                    id="edit-firstName"
                    value={selectedUser.firstName}
                    onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
                    className="col-span-3 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-lastName" className="text-right">{t.lastName}</Label>
                  <Input
                    id="edit-lastName"
                    value={selectedUser.lastName}
                    onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                    className="col-span-3 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">{t.email}</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                    className="col-span-3 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-roles" className="text-right">{t.roles}</Label>
                  <Select
                    value={selectedUser.roles[0] || ""}
                    onValueChange={(value) => setSelectedUser({...selectedUser, roles: [value]})}
                  >
                    <SelectTrigger className="col-span-3 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder={t.selectRole} />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                {t.cancel}
              </Button>
              <Button 
                onClick={updateUser} 
                style={{
                  background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[700]})`
                }}
                className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-white shadow-lg"
              >
                {t.update}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 