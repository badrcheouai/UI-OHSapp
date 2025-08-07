"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
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
  UserPlus, 
  UserCheck, 
  UserX, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  MoreHorizontal,
  Shield,
  Crown,
  Users,
  AlertTriangle,
  Stethoscope,
  User,
  Phone,
  MapPin,
  Calendar,
  Mail,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload
} from "lucide-react"
import { toast } from "sonner"

// User interface matching backend DTO
interface AdminUser {
  id: string  // Changed from number to string to match Keycloak UUIDs
  username: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
  enabled: boolean
  emailVerified: boolean
  lastLogin?: string | number
  createdAt: string | number
  phoneNumber?: string
  address?: string
  department?: string
  position?: string
}

// Role configuration with consistent colors from dashboard
const AVAILABLE_ROLES = [
  { value: "ADMIN", label: "Administrateur", icon: Crown, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "RESP_HSE", label: "Teams HSE", icon: Shield, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  { value: "RESP_RH", label: "Responsable RH", icon: Users, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  { value: "INFIRMIER", label: "Infirmier", icon: Stethoscope, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  { value: "MEDECIN", label: "Médecin", icon: User, color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" },
  { value: "EMPLOYEE", label: "Salarié", icon: User, color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" }
]

export default function AdminUsersPage() {
  const { user, accessToken } = useAuth()
  const { themeColors } = useTheme()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    roles: [] as string[],
    phoneNumber: "",
    address: "",
    department: "",
    position: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "email" | "createdAt" | "lastLogin">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Check if user is admin
  useEffect(() => {
    if (user && !user.roles?.includes("ADMIN")) {
      router.push("/dashboard")
    }
  }, [user, router])

  // Fetch users with enhanced error handling
  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`http://localhost:8081/api/v1/admin/users`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (response.ok) {
        const data = await response.json()
        // Ensure all users have at least the EMPLOYEE role
        const processedData = data.map((user: AdminUser) => ({
          ...user,
          roles: user.roles.length > 0 ? user.roles : ["EMPLOYEE"]
        }))
        setUsers(processedData)
      } else {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Erreur lors du chargement des utilisateurs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.roles?.includes("ADMIN")) {
      fetchUsers()
    }
  }, [user, accessToken])

  // Create new user with enhanced validation
  const createUser = async () => {
    try {
      if (!newUser.username || !newUser.email || !newUser.firstName || !newUser.lastName || !newUser.password) {
        toast.error("Veuillez remplir tous les champs obligatoires")
        return
      }

      if (newUser.roles.length === 0) {
        toast.error("Veuillez sélectionner au moins un rôle")
        return
      }

      // Format user data for Keycloak
      const keycloakUserData = {
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        enabled: true,
        emailVerified: false,
        credentials: [{
          type: "password",
          value: newUser.password,
          temporary: false
        }],
        attributes: {
          phoneNumber: newUser.phoneNumber ? [newUser.phoneNumber] : [],
          address: newUser.address ? [newUser.address] : [],
          department: newUser.department ? [newUser.department] : [],
          position: newUser.position ? [newUser.position] : []
        }
      }

      const response = await fetch(`http://localhost:8081/api/v1/admin/keycloak/users`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(keycloakUserData)
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (response.ok) {
        // Get the created user ID from the response
        const result = await response.json()
        
        if (result.success && result.id && newUser.roles.length > 0) {
          // Assign roles to the user
          try {
            const roleResponse = await fetch(`http://localhost:8081/api/v1/admin/keycloak/users/${result.id}/role-mappings/realm`, {
              method: "POST",
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(newUser.roles.map(role => ({ name: role })))
            })
            
            if (!roleResponse.ok) {
              console.warn("Failed to assign roles to user, but user was created successfully")
            }
          } catch (roleError) {
            console.warn("Error assigning roles to user:", roleError)
          }
        }

        toast.success("Utilisateur créé avec succès")
        setShowCreateDialog(false)
        setNewUser({ 
          username: "", 
          email: "", 
          firstName: "", 
          lastName: "", 
          password: "", 
          roles: [],
          phoneNumber: "",
          address: "",
          department: "",
          position: ""
        })
        fetchUsers()
      } else {
        const errorText = await response.text()
        try {
          const error = JSON.parse(errorText)
          toast.error(error.message || error.error || "Erreur lors de la création")
        } catch {
          toast.error(errorText || "Erreur lors de la création")
        }
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error("Erreur lors de la création")
    }
  }

  // Update user with enhanced fields
  const updateUser = async () => {
    if (!selectedUser) return

    try {
      // Format user data for Keycloak
      const keycloakUserData = {
        username: selectedUser.username,
        email: selectedUser.email,
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        enabled: selectedUser.enabled,
        emailVerified: selectedUser.emailVerified,
        attributes: {
          phoneNumber: selectedUser.phoneNumber ? [selectedUser.phoneNumber] : [],
          address: selectedUser.address ? [selectedUser.address] : [],
          department: selectedUser.department ? [selectedUser.department] : [],
          position: selectedUser.position ? [selectedUser.position] : []
        }
      }

      const response = await fetch(`http://localhost:8081/api/v1/admin/keycloak/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(keycloakUserData)
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (response.ok) {
        // Update user roles if they changed
        if (selectedUser.roles.length > 0) {
          try {
            const roleResponse = await fetch(`http://localhost:8081/api/v1/admin/keycloak/users/${selectedUser.id}/role-mappings/realm`, {
              method: "POST",
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(selectedUser.roles.map(role => ({ name: role })))
            })
            
            if (!roleResponse.ok) {
              console.warn("Failed to update user roles, but user was updated successfully")
            }
          } catch (roleError) {
            console.warn("Error updating user roles:", roleError)
          }
        }

        toast.success("Utilisateur mis à jour avec succès")
        setShowEditDialog(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        const errorText = await response.text()
        try {
          const error = JSON.parse(errorText)
          toast.error(error.message || error.error || "Erreur lors de la mise à jour")
        } catch {
          toast.error(errorText || "Erreur lors de la mise à jour")
        }
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Erreur lors de la mise à jour")
    }
  }

  // Delete user with confirmation
  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:8081/api/v1/admin/keycloak/users/${userId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (response.ok) {
        toast.success("Utilisateur supprimé avec succès")
        fetchUsers()
      } else {
        const errorText = await response.text()
        try {
          const error = JSON.parse(errorText)
          toast.error(error.message || error.error || "Erreur lors de la suppression")
        } catch {
          toast.error(errorText || "Erreur lors de la suppression")
        }
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Erreur lors de la suppression")
    }
  }

  // Toggle user status with enhanced feedback
  const toggleUserStatus = async (userId: string, enabled: boolean) => {
    try {
      const response = await fetch(`http://localhost:8081/api/v1/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled: !enabled })
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success(`Utilisateur ${enabled ? 'désactivé' : 'activé'} avec succès`)
          fetchUsers()
        } else {
          toast.error(result.error || "Erreur lors du changement de statut")
        }
      } else {
        const errorText = await response.text()
        try {
          const error = JSON.parse(errorText)
          toast.error(error.message || error.error || "Erreur lors du changement de statut")
        } catch {
          toast.error(errorText || "Erreur lors du changement de statut")
        }
      }
    } catch (error) {
      console.error("Error toggling user status:", error)
      toast.error("Erreur lors du changement de statut")
    }
  }

  // Helper function to format timestamps
  const formatTimestamp = (timestamp: string | number | undefined): string => {
    if (!timestamp) return "N/A"
    
    let date: Date
    if (typeof timestamp === 'string') {
      date = new Date(timestamp)
    } else {
      // Keycloak returns timestamps in seconds, convert to milliseconds
      date = new Date(timestamp * 1000)
    }
    
    return date.toLocaleDateString('fr-FR')
  }

  // Enhanced filtering and sorting
  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.department?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter)
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && user.enabled) ||
                           (statusFilter === "inactive" && !user.enabled)
      
      return matchesSearch && matchesRole && matchesStatus
    })
    .sort((a, b) => {
      let aValue: string | Date
      let bValue: string | Date

      switch (sortBy) {
        case "name":
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase()
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase()
          break
        case "email":
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case "createdAt":
          aValue = typeof a.createdAt === 'number' ? new Date(a.createdAt * 1000) : new Date(a.createdAt)
          bValue = typeof b.createdAt === 'number' ? new Date(b.createdAt * 1000) : new Date(b.createdAt)
          break
        case "lastLogin":
          if (a.lastLogin && b.lastLogin) {
            aValue = typeof a.lastLogin === 'number' ? new Date(a.lastLogin * 1000) : new Date(a.lastLogin)
            bValue = typeof b.lastLogin === 'number' ? new Date(b.lastLogin * 1000) : new Date(b.lastLogin)
          } else if (a.lastLogin) {
            aValue = typeof a.lastLogin === 'number' ? new Date(a.lastLogin * 1000) : new Date(a.lastLogin)
            bValue = new Date(0)
          } else if (b.lastLogin) {
            aValue = new Date(0)
            bValue = typeof b.lastLogin === 'number' ? new Date(b.lastLogin * 1000) : new Date(b.lastLogin)
          } else {
            aValue = new Date(0)
            bValue = new Date(0)
          }
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

  // Get role display with consistent colors
  const getRoleDisplay = (role: string) => {
    const roleConfig = AVAILABLE_ROLES.find(r => r.value === role)
    if (!roleConfig) return { icon: User, label: role, color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" }
    return roleConfig
  }

  // Handle role selection for multiple roles
  const handleRoleSelection = (selectedRoles: string[], isNewUser: boolean = true) => {
    if (isNewUser) {
      // Ensure EMPLOYEE role is always included for non-admin users
      let updatedRoles = selectedRoles
      if (!selectedRoles.includes("ADMIN") && !selectedRoles.includes("EMPLOYEE")) {
        updatedRoles = [...selectedRoles, "EMPLOYEE"]
      }
      setNewUser({ ...newUser, roles: updatedRoles })
    } else if (selectedUser) {
      // Ensure EMPLOYEE role is always included for non-admin users
      let updatedRoles = selectedRoles
      if (!selectedRoles.includes("ADMIN") && !selectedRoles.includes("EMPLOYEE")) {
        updatedRoles = [...selectedRoles, "EMPLOYEE"]
      }
      setSelectedUser({ ...selectedUser, roles: updatedRoles })
    }
  }

  if (!user?.roles?.includes("ADMIN")) {
    return (
      <div className="flex items-center justify-center min-h-screen theme-gradient-bg">
        <Card className="theme-card w-96 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Accès refusé
            </CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6 theme-gradient-bg min-h-screen">
      {/* Enhanced Header */}
      <div className="flex justify-between items-center animate-slide-down">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="h-8 w-8" style={{ color: themeColors.colors.primary[600] }} />
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez les utilisateurs et leurs permissions - {filteredAndSortedUsers.length} utilisateur(s)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={fetchUsers} 
            variant="outline" 
            className="theme-button-secondary"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="theme-button-primary">
                <UserPlus className="h-4 w-4 mr-2" />
                Nouvel Utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-foreground">Créer un nouvel utilisateur</DialogTitle>
                <DialogDescription>
                  Remplissez les informations pour créer un nouvel utilisateur.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">Nom d'utilisateur *</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="col-span-3 theme-input"
                    placeholder="nom.utilisateur"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="col-span-3 theme-input"
                    placeholder="email@exemple.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    className="col-span-3 theme-input"
                    placeholder="Prénom"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">Nom *</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    className="col-span-3 theme-input"
                    placeholder="Nom"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phoneNumber" className="text-right">Téléphone</Label>
                  <Input
                    id="phoneNumber"
                    value={newUser.phoneNumber}
                    onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                    className="col-span-3 theme-input"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">Département</Label>
                  <Input
                    id="department"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    className="col-span-3 theme-input"
                    placeholder="Département"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="position" className="text-right">Poste</Label>
                  <Input
                    id="position"
                    value={newUser.position}
                    onChange={(e) => setNewUser({...newUser, position: e.target.value})}
                    className="col-span-3 theme-input"
                    placeholder="Poste"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">Adresse</Label>
                  <Input
                    id="address"
                    value={newUser.address}
                    onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                    className="col-span-3 theme-input"
                    placeholder="Adresse complète"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">Mot de passe *</Label>
                  <div className="col-span-3 relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="theme-input pr-10"
                      placeholder="Mot de passe sécurisé"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="roles" className="text-right">Rôles *</Label>
                  <Select
                    value={newUser.roles[0] || ""}
                    onValueChange={(value) => handleRoleSelection([value], true)}
                  >
                    <SelectTrigger className="col-span-3 theme-input">
                      <SelectValue placeholder="Sélectionner un rôle principal" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            <role.icon className="h-4 w-4" />
                            {role.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={createUser} className="theme-button-primary">
                  Créer l'utilisateur
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Filters */}
      <Card className="theme-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Filter className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
            Filtres et Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nom, email, téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 theme-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-filter">Rôle</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="theme-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  {AVAILABLE_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <role.icon className="h-4 w-4" />
                        {role.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="theme-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actifs uniquement</SelectItem>
                  <SelectItem value="inactive">Inactifs uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort-by">Trier par</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="theme-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="createdAt">Date de création</SelectItem>
                  <SelectItem value="lastLogin">Dernière connexion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Users Table */}
      <Card className="theme-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
              Utilisateurs ({filteredAndSortedUsers.length})
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="theme-button-secondary"
              >
                {sortOrder === "asc" ? "↑" : "↓"} {sortBy}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Liste de tous les utilisateurs du système avec leurs informations détaillées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div
                  className="animate-spin rounded-full h-12 w-12 border-b-2"
                  style={{ borderColor: themeColors.colors.primary[600] }}
                ></div>
                <p className="text-muted-foreground">Chargement des utilisateurs...</p>
              </div>
            </div>
          ) : filteredAndSortedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all" 
                  ? "Essayez de modifier vos filtres de recherche"
                  : "Commencez par créer votre premier utilisateur"
                }
              </p>
              {!searchTerm && roleFilter === "all" && statusFilter === "all" && (
                <Button onClick={() => setShowCreateDialog(true)} className="theme-button-primary">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Créer un utilisateur
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Utilisateur</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Rôles</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold">Activité</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.map((user, index) => (
                    <TableRow 
                      key={user.id}
                      className="hover:bg-muted/50 transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-lg"
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
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" />
                              @{user.username}
                            </div>
                            {user.department && (
                              <div className="text-xs text-muted-foreground">
                                {user.department} • {user.position}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {user.email}
                          </div>
                          {user.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {user.phoneNumber}
                            </div>
                          )}
                          {user.address && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate max-w-[200px]" title={user.address}>
                                {user.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => {
                            const roleConfig = getRoleDisplay(role)
                            const Icon = roleConfig.icon
                            return (
                              <Badge 
                                key={role} 
                                variant="secondary" 
                                className={`${roleConfig.color} flex items-center gap-1 text-xs px-2 py-1`}
                              >
                                <Icon className="h-3 w-3" />
                                {roleConfig.label}
                              </Badge>
                            )
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.enabled ? "default" : "destructive"}
                          className={`${user.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'} flex items-center gap-1`}
                        >
                          {user.enabled ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                          {user.enabled ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.lastLogin ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {formatTimestamp(user.lastLogin)}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Jamais connecté
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Créé le {formatTimestamp(user.createdAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowEditDialog(true)
                            }}
                            className="h-8 w-8 p-0 hover:bg-muted"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id, user.enabled)}
                            className={`h-8 w-8 p-0 hover:bg-muted ${user.enabled ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                            title={user.enabled ? "Désactiver" : "Activer"}
                          >
                            {user.enabled ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted text-red-600 hover:text-red-700"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5 text-red-600" />
                                  Supprimer l'utilisateur
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer <strong>{user.firstName} {user.lastName}</strong> ? 
                                  Cette action est irréversible et supprimera définitivement toutes les données associées.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer définitivement
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur. Les champs marqués d'un * sont obligatoires.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-firstName" className="text-right">Prénom *</Label>
                <Input
                  id="edit-firstName"
                  value={selectedUser.firstName}
                  onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
                  className="col-span-3 theme-input"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-lastName" className="text-right">Nom *</Label>
                <Input
                  id="edit-lastName"
                  value={selectedUser.lastName}
                  onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                  className="col-span-3 theme-input"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  className="col-span-3 theme-input"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phoneNumber" className="text-right">Téléphone</Label>
                <Input
                  id="edit-phoneNumber"
                  value={selectedUser.phoneNumber || ""}
                  onChange={(e) => setSelectedUser({...selectedUser, phoneNumber: e.target.value})}
                  className="col-span-3 theme-input"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-department" className="text-right">Département</Label>
                <Input
                  id="edit-department"
                  value={selectedUser.department || ""}
                  onChange={(e) => setSelectedUser({...selectedUser, department: e.target.value})}
                  className="col-span-3 theme-input"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-position" className="text-right">Poste</Label>
                <Input
                  id="edit-position"
                  value={selectedUser.position || ""}
                  onChange={(e) => setSelectedUser({...selectedUser, position: e.target.value})}
                  className="col-span-3 theme-input"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-address" className="text-right">Adresse</Label>
                <Input
                  id="edit-address"
                  value={selectedUser.address || ""}
                  onChange={(e) => setSelectedUser({...selectedUser, address: e.target.value})}
                  className="col-span-3 theme-input"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-roles" className="text-right">Rôles *</Label>
                <Select
                  value={selectedUser.roles[0] || ""}
                  onValueChange={(value) => handleRoleSelection([value], false)}
                >
                  <SelectTrigger className="col-span-3 theme-input">
                    <SelectValue placeholder="Sélectionner un rôle principal" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <role.icon className="h-4 w-4" />
                          {role.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={updateUser} className="theme-button-primary">
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
