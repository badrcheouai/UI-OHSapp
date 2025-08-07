"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, Calendar, Shield, Crown, Database, AlertTriangle } from "lucide-react"

// Dashboard statistics interface
interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalEmployees: number
  totalAppointments: number
  pendingAppointments: number
  todayAppointments: number
  keycloakUsers: number
  systemHealth: string
}

// User interface
interface AdminUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  active: boolean
  keycloakId?: string
  lastLogin?: string
  roles: string[]
}

// Employee interface
interface Employee {
  id: number
  firstName: string
  lastName: string
  position: string
  department: string
  hireDate: string
  phoneNumber: string
  email: string
  medicalFitnessStatus: string
  username?: string
  active?: boolean
}

// Appointment interface
interface Appointment {
  id: number
  type: string
  status: string
  requestedDate: string
  scheduledTime?: string
  reason: string
  employeeFirstName: string
  employeeLastName: string
  employeeEmail?: string
  priority: string
  isUrgent: boolean
}

export default function AdminDashboardPage() {
  const { user, loading, accessToken } = useAuth()
  const { themeColors } = useTheme()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication and admin role
  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push("/login")
      return
    }
    if (!user.roles?.includes("ADMIN")) {
      router.push("/dashboard")
      return
    }
    fetchDashboardData()
  }, [user, loading, accessToken, router])

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"

      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_URL}/api/v1/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (statsResponse.status === 401) {
        router.push("/login")
        return
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch users
      const usersResponse = await fetch(`${API_URL}/api/v1/admin/users`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }

      // Fetch employees
      const employeesResponse = await fetch(`${API_URL}/api/v1/admin/employees`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json()
        setEmployees(employeesData)
      }

      // Fetch appointments
      const appointmentsResponse = await fetch(`${API_URL}/api/v1/admin/appointments`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        setAppointments(appointmentsData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get role display info
  const getRoleDisplay = (role: string) => {
    const roleConfig = {
      ADMIN: { label: "Administrateur", icon: Crown, color: "theme-badge-info" },
      RESP_HSE: { label: "Teams HSE", icon: Shield, color: "theme-badge-error" },
      RESP_RH: { label: "Responsable RH", icon: Users, color: "theme-badge-error" },
      INFIRMIER: { label: "Infirmier", icon: Shield, color: "theme-badge-success" },
      MEDECIN: { label: "Médecin", icon: Shield, color: "theme-badge-success" },
      EMPLOYEE: { label: "Employé", icon: Users, color: "theme-badge-warning" },
    }
    return roleConfig[role as keyof typeof roleConfig] || { label: role, icon: Users, color: "theme-badge-warning" }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "En attente", variant: "theme-badge-warning" },
      CONFIRMED: { label: "Confirmé", variant: "theme-badge-success" },
      CANCELLED: { label: "Annulé", variant: "theme-badge-error" },
      COMPLETED: { label: "Terminé", variant: "theme-badge-success" },
    }
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "theme-badge-warning" }
  }

  if (!user?.roles?.includes("ADMIN")) {
    return (
      <div className="flex items-center justify-center min-h-screen theme-gradient-bg">
        <Card className="theme-card w-96">
          <CardHeader>
            <CardTitle className="text-destructive">Accès refusé</CardTitle>
            <CardDescription>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6 theme-gradient-bg min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center animate-slide-down">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord Administrateur</h1>
          <p className="text-muted-foreground mt-2">Gestion du système et des utilisateurs - {themeColors.name}</p>
        </div>

        <Button onClick={() => router.push("/admin/users")} className="theme-button-primary">
          <UserPlus className="h-4 w-4 mr-2" />
          Gérer les Utilisateurs
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          <Card className="theme-card hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Utilisateurs Totaux</CardTitle>
              <Users className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{stats.activeUsers} actifs</p>
            </CardContent>
          </Card>

          <Card className="theme-card hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Employés</CardTitle>
              <Shield className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Enregistrés</p>
            </CardContent>
          </Card>

          <Card className="theme-card hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rendez-vous</CardTitle>
              <Calendar className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingAppointments} en attente</p>
            </CardContent>
          </Card>

          <Card className="theme-card hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Système</CardTitle>
              <Database className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.keycloakUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.systemHealth === "healthy" ? "Système OK" : "Problème détecté"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Users */}
      <Card className="theme-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
            Utilisateurs Récents
          </CardTitle>
          <CardDescription>Les derniers utilisateurs ajoutés au système</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: themeColors.colors.primary[600] }}
              ></div>
            </div>
          ) : (
            <div className="space-y-4">
              {users.slice(0, 5).map((user, index) => {
                const primaryRole = user.roles[0] || "EMPLOYEE"
                const roleDisplay = getRoleDisplay(primaryRole)
                const RoleIcon = roleDisplay.icon

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:shadow-md transition-all duration-200 animate-fade-in hover:scale-[1.02]"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{
                          background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
                        }}
                      >
                        {user.firstName?.charAt(0) || user.username?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`${roleDisplay.color} flex items-center gap-1`}>
                            <RoleIcon className="h-3 w-3" />
                            {roleDisplay.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={user.active ? "theme-badge-success" : "theme-badge-error"}>
                        {user.active ? "Actif" : "Inactif"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Appointments */}
      <Card className="theme-card animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
            Rendez-vous Récents
          </CardTitle>
          <CardDescription>Les derniers rendez-vous programmés</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: themeColors.colors.primary[600] }}
              ></div>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.slice(0, 5).map((appointment, index) => {
                const statusBadge = getStatusBadge(appointment.status)

                return (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:shadow-md transition-all duration-200 animate-fade-in hover:scale-[1.02]"
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`,
                        }}
                      >
                        <Calendar className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {appointment.employeeFirstName} {appointment.employeeLastName}
                        </div>
                        <div className="text-sm text-muted-foreground">{appointment.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={statusBadge.variant}>{statusBadge.label}</span>
                      {appointment.isUrgent && (
                        <span className="theme-badge-error flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Urgent
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="theme-card animate-slide-up" style={{ animationDelay: "0.6s" }}>
        <CardHeader>
          <CardTitle className="text-foreground">Actions Rapides</CardTitle>
          <CardDescription>Accès rapide aux fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push("/admin/users")}
              className="h-20 flex flex-col items-center justify-center gap-2 theme-button-primary"
            >
              <UserPlus className="h-6 w-6" />
              <span>Gérer les Utilisateurs</span>
            </Button>

            <Button
              onClick={() => router.push("/employees")}
              className="h-20 flex flex-col items-center justify-center gap-2 theme-button-primary"
            >
              <Shield className="h-6 w-6" />
              <span>Gérer les Employés</span>
            </Button>

            <Button
              onClick={() => router.push("/appointments")}
              className="h-20 flex flex-col items-center justify-center gap-2 theme-button-primary"
            >
              <Calendar className="h-6 w-6" />
              <span>Voir les Rendez-vous</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
