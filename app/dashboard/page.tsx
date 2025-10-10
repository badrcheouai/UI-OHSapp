"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  UserPlus,
  Calendar,
  Bell,
  Settings,
  BarChart3,
  Activity,
  Mail,
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
} from "lucide-react"

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalRoles: number
  totalEmployees: number
  totalAppointments: number
  pendingAppointments: number
  todayAppointments: number
}

interface User {
  id: number
  username: string
  email: string
  active: boolean
  roles: string[]
  lastLogin?: string
  employee?: Employee
}

interface Employee {
  id: number
  firstName: string
  lastName: string
  position: string
  department: string
  phoneNumber: string
  email: string
  profileCompleted: boolean
}

interface Appointment {
  id: number
  type: string
  status: string
  requestedDate: string
  employeeFirstName: string
  employeeLastName: string
  employeeEmail?: string
  reason: string
  priority: string
}

export default function DashboardPage() {
  const { user, loading, accessToken } = useAuth()
  const { themeColors } = useTheme()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showCreateEmployee, setShowCreateEmployee] = useState(false)

  // Form states
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    roles: [] as string[],
  })

  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    department: "",
    phoneNumber: "",
  })

  useEffect(() => {
    const recheckAndRedirect = async () => {
      if (loading || !user) return
      // Server-side recheck of email verification before redirect
      try {
        if (accessToken && user.sub) {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"
          const res = await fetch(`${API_URL}/api/v1/admin/keycloak/users/${user.sub}/profile`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          })
          if (res.ok) {
            const data = await res.json()
            const verified = !!(data?.profile?.emailVerified)
            if (!verified) {
              router.replace("/auth/activation")
              return
            }
          }
        }
      } catch (_) {
        // ignore; fallback to token value
      }
      if (user.emailVerified === false) {
        router.replace("/auth/activation")
        return
      }
      // Redirect to appropriate dashboard based on role
      const roles = user.roles || []
      if (roles.includes("ADMIN")) router.replace("/dashboard-admin")
      else if (roles.includes("RESP_RH")) router.replace("/dashboard-rh")
      else if (roles.includes("INFIRMIER_ST")) router.replace("/dashboard-infirmier")
      else if (roles.includes("MEDECIN_TRAVAIL")) router.replace("/dashboard-medecin")
      else if (roles.includes("RESP_HSE")) router.replace("/dashboard-hse")
      else if (roles.includes("SALARIE")) router.replace("/dashboard-salarie")
      else router.replace("/profile")
    }
    recheckAndRedirect()
  }, [user, loading, accessToken, router])

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      if (!user?.roles?.includes("ADMIN")) {
        console.log("User is not admin, skipping admin API calls")
        return
      }

      if (!accessToken) {
        console.log("No access token available")
        return
      }

      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_URL}/api/v1/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (statsResponse.status === 401) {
        console.log("Token expired, redirecting to login")
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

  const createUser = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newUser),
      })

      if (response.status === 401) {
        console.log("Token expired, redirecting to login")
        router.push("/login")
        return
      }

      if (response.ok) {
        setShowCreateUser(false)
        setNewUser({ email: "", password: "", roles: [] })
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Error creating user:", error)
    }
  }

  const createEmployee = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newEmployee),
      })

      if (response.status === 401) {
        console.log("Token expired, redirecting to login")
        router.push("/login")
        return
      }

      if (response.ok) {
        setShowCreateEmployee(false)
        setNewEmployee({ firstName: "", lastName: "", email: "", position: "", department: "", phoneNumber: "" })
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Error creating employee:", error)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen theme-gradient-bg">
        <div
          className="animate-spin rounded-full h-16 w-16 border-b-2 mb-4"
          style={{ borderColor: themeColors.colors.primary[600] }}
        ></div>
        <div className="text-lg text-foreground">Chargement...</div>
      </div>
    )
  }

  if (!user || !user.roles.includes("ADMIN")) {
    return null
  }

  return (
    <div className="min-h-screen theme-gradient-bg">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-down">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tableau de Bord Administrateur</h1>
          <p className="text-muted-foreground">
            Bienvenue, {user.firstName || user.username}. Gérez votre plateforme OSHapp avec le thème {themeColors.name}
            .
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
            <Card className="theme-card hover:scale-105 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Utilisateurs</CardTitle>
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
                <UserPlus className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">Profils complets</p>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Aujourd'hui</CardTitle>
                <Clock className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.todayAppointments}</div>
                <p className="text-xs text-muted-foreground">Rendez-vous prévus</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <TabsList className="grid w-full grid-cols-4 glass-effect">
            <TabsTrigger value="overview" className="theme-button-secondary">
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="users" className="theme-button-secondary">
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="employees" className="theme-button-secondary">
              Employés
            </TabsTrigger>
            <TabsTrigger value="appointments" className="theme-button-secondary">
              Rendez-vous
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="theme-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Activity className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
                    Activité Récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.slice(0, 5).map((appointment, index) => (
                      <div
                        key={appointment.id}
                        className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: themeColors.colors.primary[500] }}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {appointment.employeeFirstName} {appointment.employeeLastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {appointment.type} - {appointment.status}
                          </p>
                        </div>
                        <Badge
                          className={appointment.status === "CONFIRMED" ? "theme-badge-success" : "theme-badge-warning"}
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="theme-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Settings className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
                    Actions Rapides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => setShowCreateUser(true)} className="w-full theme-button-primary">
                      <UserPlus className="h-4 w-4 mr-2" />
                      <span className="text-white">Nouvel Utilisateur</span>
                    </Button>
                    <Button onClick={() => setShowCreateEmployee(true)} className="w-full theme-button-secondary">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Nouvel Employé
                    </Button>
                    <Button className="w-full theme-button-secondary">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </Button>
                    <Button className="w-full theme-button-secondary">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Rapports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="theme-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Gestion des Utilisateurs</CardTitle>
                    <CardDescription>Gérez les utilisateurs et leurs rôles</CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateUser(true)} className="theme-button-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="text-white">Ajouter un utilisateur</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-foreground">Utilisateur</TableHead>
                      <TableHead className="text-foreground">Email</TableHead>
                      <TableHead className="text-foreground">Rôles</TableHead>
                      <TableHead className="text-foreground">Statut</TableHead>
                      <TableHead className="text-foreground">Dernière connexion</TableHead>
                      <TableHead className="text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-accent/30">
                        <TableCell className="font-medium text-foreground">{user.username}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.roles.map((role) => (
                              <Badge key={role} className="theme-badge-info text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={user.active ? "theme-badge-success" : "theme-badge-error"}>
                            {user.active ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Jamais"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" className="theme-button-outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="theme-button-outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="theme-button-outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <Card className="theme-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Gestion des Employés</CardTitle>
                    <CardDescription>Gérez les profils employés</CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateEmployee(true)} className="theme-button-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un employé
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-foreground">Employé</TableHead>
                      <TableHead className="text-foreground">Poste</TableHead>
                      <TableHead className="text-foreground">Département</TableHead>
                      <TableHead className="text-foreground">Contact</TableHead>
                      <TableHead className="text-foreground">Profil</TableHead>
                      <TableHead className="text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-accent/30">
                        <TableCell className="font-medium text-foreground">
                          {employee.firstName} {employee.lastName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{employee.position}</TableCell>
                        <TableCell className="text-muted-foreground">{employee.department}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{employee.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={employee.profileCompleted ? "theme-badge-success" : "theme-badge-warning"}>
                            {employee.profileCompleted ? "Complet" : "Incomplet"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" className="theme-button-outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="theme-button-outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card className="theme-card">
              <CardHeader>
                <CardTitle className="text-foreground">Gestion des Rendez-vous</CardTitle>
                <CardDescription>Consultez et gérez tous les rendez-vous</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-foreground">Employé</TableHead>
                      <TableHead className="text-foreground">Type</TableHead>
                      <TableHead className="text-foreground">Date demandée</TableHead>
                      <TableHead className="text-foreground">Statut</TableHead>
                      <TableHead className="text-foreground">Priorité</TableHead>
                      <TableHead className="text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id} className="hover:bg-accent/30">
                        <TableCell className="font-medium text-foreground">
                          {appointment.employeeFirstName} {appointment.employeeLastName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{appointment.type}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(appointment.requestedDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              appointment.status === "CONFIRMED"
                                ? "theme-badge-success"
                                : appointment.status === "PENDING"
                                  ? "theme-badge-warning"
                                  : "theme-badge-error"
                            }
                          >
                            {appointment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              appointment.priority === "URGENT"
                                ? "theme-badge-error"
                                : appointment.priority === "HIGH"
                                  ? "theme-badge-warning"
                                  : "theme-badge-info"
                            }
                          >
                            {appointment.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" className="theme-button-outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="theme-button-outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="sm:max-w-[425px] theme-card">
          <DialogHeader>
            <DialogTitle className="text-white">Créer un nouvel utilisateur</DialogTitle>
            <DialogDescription className="text-white">Ajoutez un nouvel utilisateur avec ses rôles</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@company.com"
                className="theme-input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-foreground">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Mot de passe sécurisé"
                className="theme-input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="roles" className="text-foreground">
                Rôles
              </Label>
              <Select onValueChange={(value) => setNewUser({ ...newUser, roles: [value] })}>
                <SelectTrigger className="theme-input">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent className="theme-card">
                  <SelectItem value="ROLE_ADMIN">Administrateur</SelectItem>
                  <SelectItem value="ROLE_RH">Ressources Humaines</SelectItem>
                  <SelectItem value="ROLE_NURSE">Infirmier</SelectItem>
                  <SelectItem value="ROLE_DOCTOR">Médecin</SelectItem>
                  <SelectItem value="ROLE_EMPLOYEE">Employé</SelectItem>
                  <SelectItem value="ROLE_HSE">HSE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateUser(false)} className="theme-button-secondary">
              Annuler
            </Button>
            <Button onClick={createUser} className="theme-button-primary">
              <span className="text-white">Créer l'utilisateur</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Employee Dialog */}
      <Dialog open={showCreateEmployee} onOpenChange={setShowCreateEmployee}>
        <DialogContent className="sm:max-w-[425px] theme-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Créer un nouvel employé</DialogTitle>
            <DialogDescription>Ajoutez un nouveau profil employé</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName" className="text-foreground">
                  Prénom
                </Label>
                <Input
                  id="firstName"
                  value={newEmployee.firstName}
                  onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                  placeholder="Prénom"
                  className="theme-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName" className="text-foreground">
                  Nom
                </Label>
                <Input
                  id="lastName"
                  value={newEmployee.lastName}
                  onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                  placeholder="Nom"
                  className="theme-input"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                placeholder="email@company.com"
                className="theme-input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position" className="text-foreground">
                Poste
              </Label>
              <Input
                id="position"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                placeholder="Poste"
                className="theme-input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department" className="text-foreground">
                Département
              </Label>
              <Input
                id="department"
                value={newEmployee.department}
                onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                placeholder="Département"
                className="theme-input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-foreground">
                Téléphone
              </Label>
              <Input
                id="phone"
                value={newEmployee.phoneNumber}
                onChange={(e) => setNewEmployee({ ...newEmployee, phoneNumber: e.target.value })}
                placeholder="Téléphone"
                className="theme-input"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateEmployee(false)} className="theme-button-secondary">
              Annuler
            </Button>
            <Button onClick={createEmployee} className="theme-button-primary">
              Créer l'employé
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
