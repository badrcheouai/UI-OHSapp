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
  Upload,
  CheckCircle,
  XCircle,
  Globe,
  Briefcase,
  Activity,
  Key,
  AlertCircle,
  ChevronRight,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { AdminNavigation } from "@/components/admin-navigation"

// Language translations
const translations = {
  en: {
    // Page titles
    pageTitle: "User Management",
    pageDescription: "Manage users and their permissions",
    
    // Headers
    filtersAndSearch: "Filters and Search",
    users: "Users",
    contact: "Contact",
    roles: "Roles",
    status: "Status",
    actions: "Actions",
    
    // Buttons
    refresh: "Refresh",
    newUser: "New User",
    update: "Update",
    cancel: "Cancel",
    create: "Create",
    delete: "Delete",
    view: "View",
    edit: "Edit",
    
    // Form labels
    username: "Username",
    email: "Email",
    firstName: "First Name",
    lastName: "Last Name",
    password: "Password",
    gender: "Gender",
    birthDate: "Birth Date",
    address: "Address",
    company: "Company",
    hireDate: "Hire Date",
    profession: "Profession",
    phoneNumber: "Phone Number",
    department: "Department",
    
    // Placeholders
    usernamePlaceholder: "Ex: john.doe",
    emailPlaceholder: "Ex: john.doe@company.com",
    firstNamePlaceholder: "Ex: John",
    lastNamePlaceholder: "Ex: Doe",
    passwordPlaceholder: "Enter password",
    phonePlaceholder: "Ex: +33 1 23 45 67 89",
    departmentPlaceholder: "Ex: HR, IT, Marketing, Production...",
    addressPlaceholder: "Ex: 123 Main Street, City",
    companyPlaceholder: "Ex: Company Name",
    professionPlaceholder: "Ex: Software Engineer",
    
    // Validation messages
    requiredField: "This field is required",
    invalidEmail: "Please enter a valid email address",
    invalidPhone: "Please enter a valid phone number",
    passwordTooShort: "Password must be at least 8 characters",
    
    // Status messages
    active: "Active",
    inactive: "Inactive",
    verified: "Verified",
    notVerified: "Not Verified",
    googleSSO: "Google SSO",
    keycloak: "Keycloak",
    
    // Dialog titles
    createUserTitle: "Create New User",
    editUserTitle: "Edit User",
    viewUserTitle: "User Information",
    createUserDescription: "Fill in the information to create a new user",
    editUserDescription: "Edit user information. Fields marked with * are required",
    viewUserDescription: "Complete details of the selected user",
    
    // Information sections
    basicInfo: "Basic Information",
    personalInfo: "Personal Information",
    professionalInfo: "Professional Information",
    authInfo: "Authentication Information",
    
    // Connection method
    connectionMethod: "Connection Method",
    lastLogin: "Last Login",
    creationDate: "Creation Date",
    keycloakId: "Keycloak ID",
    neverConnected: "Never Connected",
    notSpecified: "Not Specified",
    
    // Success/Error messages
    userCreatedSuccess: "User created successfully",
    userUpdatedSuccess: "User updated successfully",
    userDeletedSuccess: "User deleted successfully",
    userStatusUpdated: "User status updated successfully",
    fillRequiredFields: "Please fill in all required fields",
    errorOccurred: "An error occurred",
    
    // Search and filters
    searchPlaceholder: "Search by name, email, phone...",
    allRoles: "All Roles",
    allStatuses: "All Statuses",
    sortByName: "Name",
    sortByEmail: "Email",
    sortByCreationDate: "Creation Date",
    sortByLastLogin: "Last Login",
    
    // Gender options
    male: "Male",
    female: "Female",
    
    // Additional translations
    deleteUser: "Delete User",
    deleteUserConfirm: "Are you sure you want to delete",
    deleteUserWarning: "This action is irreversible and will permanently delete all associated data.",
    deletePermanently: "Delete Permanently",
    enableAccount: "Enable Account",
    disableAccount: "Disable Account",
    resetPassword: "Reset Password",
    resetPasswordConfirm: "Are you sure you want to send a password reset email to",
    resetPasswordSuccess: "Password reset email sent successfully",
    resetPasswordError: "Failed to send password reset email",
    bulkImport: "Bulk Import",
    bulkImportTitle: "Bulk Import Users",
    bulkImportDescription: "Import multiple users from JSON, CSV, or Excel file",
    importFromFile: "Import from File",
    importFromJSON: "Import from JSON",
    downloadTemplate: "Download Template",
    uploadFile: "Upload File",
    dragAndDrop: "Drag and drop files here, or click to select",
    supportedFormats: "Supported formats: JSON, CSV, Excel",
    importSuccess: "Import completed successfully",
    importError: "Import failed",
    templateDownloaded: "Template downloaded successfully",
    
    // View dialog translations
    fullName: "Full Name",
    rolesAndPermissions: "Roles and Permissions",
    assignedRoles: "Assigned Roles",
    notGenerated: "Not Generated",
    emailVerified: "Email Verified",
    lastConnection: "Last Connection",
    dossierNumber: "Dossier Number",
    activityAndHistory: "Activity and History",
    ssoGoogle: "Google SSO",
    standard: "Standard",
    connected: "Connected",
    selectRole: "Select Role",
    employeeRole: "Employee",
    administratorRole: "Administrator",
    hseTeamRole: "HSE Team",
    hrManagerRole: "HR Manager",
    nurseRole: "Nurse",
    doctorRole: "Doctor",
    matriculeNumber: "Matricule Number"
  },
  fr: {
    // Page titles
    pageTitle: "Gestion des Utilisateurs",
    pageDescription: "Gérez les utilisateurs et leurs permissions",
    
    // Headers
    filtersAndSearch: "Filtres et Recherche",
    users: "Utilisateurs",
    contact: "Contact",
    roles: "Rôles",
    status: "Statut",
    actions: "Actions",
    
    // Buttons
    refresh: "Actualiser",
    newUser: "Nouvel Utilisateur",
    update: "Mettre à jour",
    cancel: "Annuler",
    create: "Créer",
    delete: "Supprimer",
    view: "Voir",
    edit: "Modifier",
    
    // Form labels
    username: "Nom d'utilisateur",
    email: "Email",
    firstName: "Prénom",
    lastName: "Nom",
    password: "Mot de passe",
    gender: "Sexe",
    birthDate: "Date de naissance",
    address: "Adresse",
    company: "Entreprise",
    hireDate: "Date d'embauche",
    profession: "Profession",
    phoneNumber: "Téléphone",
    department: "Département",
    
    // Placeholders
    usernamePlaceholder: "Ex: john.doe",
    emailPlaceholder: "Ex: john.doe@entreprise.com",
    firstNamePlaceholder: "Ex: Jean",
    lastNamePlaceholder: "Ex: Dupont",
    passwordPlaceholder: "Entrez le mot de passe",
    phonePlaceholder: "Ex: +33 1 23 45 67 89",
    departmentPlaceholder: "Ex: RH, IT, Marketing, Production...",
    addressPlaceholder: "Ex: 123 Rue Principale, Ville",
    companyPlaceholder: "Ex: Nom de l'entreprise",
    professionPlaceholder: "Ex: Ingénieur Logiciel",
    
    // Validation messages
    requiredField: "Ce champ est obligatoire",
    invalidEmail: "Veuillez entrer une adresse email valide",
    invalidPhone: "Veuillez entrer un numéro de téléphone valide",
    passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères",
    
    // Status messages
    active: "Actif",
    inactive: "Inactif",
    verified: "Vérifié",
    notVerified: "Non vérifié",
    googleSSO: "Google SSO",
    keycloak: "Keycloak",
    
    // Dialog titles
    createUserTitle: "Créer un nouvel utilisateur",
    editUserTitle: "Modifier l'utilisateur",
    viewUserTitle: "Informations de l'Utilisateur",
    createUserDescription: "Remplissez les informations pour créer un nouvel utilisateur",
    editUserDescription: "Modifiez les informations de l'utilisateur. Les champs marqués d'un * sont obligatoires",
    viewUserDescription: "Détails complets de l'utilisateur sélectionné",
    
    // Information sections
    basicInfo: "Informations de Base",
    personalInfo: "Informations Personnelles",
    professionalInfo: "Informations Professionnelles",
    authInfo: "Informations d'Authentification",
    
    // Connection method
    connectionMethod: "Méthode de connexion",
    lastLogin: "Dernière connexion",
    creationDate: "Date de création",
    keycloakId: "ID Keycloak",
    neverConnected: "Jamais connecté",
    notSpecified: "Non spécifié",
    
    // Success/Error messages
    userCreatedSuccess: "Utilisateur créé avec succès",
    userUpdatedSuccess: "Utilisateur mis à jour avec succès",
    userDeletedSuccess: "Utilisateur supprimé avec succès",
    userStatusUpdated: "Statut de l'utilisateur mis à jour avec succès",
    fillRequiredFields: "Veuillez remplir tous les champs obligatoires",
    errorOccurred: "Une erreur s'est produite",
    
    // Search and filters
    searchPlaceholder: "Rechercher par nom, email, téléphone...",
    allRoles: "Tous les rôles",
    allStatuses: "Tous les statuts",
    sortByName: "Nom",
    sortByEmail: "Email",
    sortByCreationDate: "Date de création",
    sortByLastLogin: "Dernière connexion",
    
    // Gender options
    male: "Homme",
    female: "Femme",
    
    // Additional translations
    deleteUser: "Supprimer l'utilisateur",
    deleteUserConfirm: "Êtes-vous sûr de vouloir supprimer",
    deleteUserWarning: "Cette action est irréversible et supprimera définitivement toutes les données associées.",
    deletePermanently: "Supprimer définitivement",
    enableAccount: "Activer le compte",
    disableAccount: "Désactiver le compte",
    resetPassword: "Réinitialiser le mot de passe",
    resetPasswordConfirm: "Êtes-vous sûr de vouloir envoyer un email de réinitialisation de mot de passe à",
    resetPasswordSuccess: "Email de réinitialisation de mot de passe envoyé avec succès",
    resetPasswordError: "Échec de l'envoi de l'email de réinitialisation de mot de passe",
    bulkImport: "Import en masse",
    bulkImportTitle: "Import en masse d'utilisateurs",
    bulkImportDescription: "Importer plusieurs utilisateurs depuis un fichier JSON, CSV ou Excel",
    importFromFile: "Importer depuis un fichier",
    importFromJSON: "Importer depuis JSON",
    downloadTemplate: "Télécharger le modèle",
    uploadFile: "Télécharger le fichier",
    dragAndDrop: "Glissez et déposez les fichiers ici, ou cliquez pour sélectionner",
    supportedFormats: "Formats supportés: JSON, CSV, Excel",
    importSuccess: "Import terminé avec succès",
    importError: "Échec de l'import",
    templateDownloaded: "Modèle téléchargé avec succès",
    
    // View dialog translations
    fullName: "Nom complet",
    rolesAndPermissions: "Rôles et Permissions",
    assignedRoles: "Rôles assignés",
    notGenerated: "Non généré",
    emailVerified: "Email vérifié",
    lastConnection: "Dernière connexion",
    dossierNumber: "Numéro de dossier",
    activityAndHistory: "Activité et Historique",
    ssoGoogle: "SSO Google",
    standard: "Standard",
    connected: "Connecté",
    selectRole: "Sélectionner un rôle",
    employeeRole: "Salarié",
    administratorRole: "Administrateur",
    hseTeamRole: "Teams HSE",
    hrManagerRole: "Responsable RH",
    nurseRole: "Infirmier",
    doctorRole: "Médecin",
    matriculeNumber: "Numéro de matricule"
  }
}

// User interface matching backend User model with all required fields
interface AdminUser {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
  enabled: boolean
  emailVerified: boolean
  lastLogin?: string
  createdAt: string
  
  // General Information Fields (Informations Générales)
  dossierNumber?: string // Numéro de dossier (auto-generated)
  matriculeNumber?: string // Numéro de matricule (employee number)
  gender?: string // Sexe (Homme/Femme)
  birthDate?: string // Date de naissance
  address?: string // Adresse du domicile
  company?: string // Nom de l'entreprise
  hireDate?: string // Date d'embauche
  profession?: string // Poste occupé
  
  // Additional fields
  phoneNumber?: string
  department?: string
  keycloakId?: string
  
  // SSO and verification fields
  googleSSO?: boolean
}

// Role configuration with enhanced colors and no pink
const getRoleColors = (themeColors: any) => [
  { value: "ADMIN", label: "Administrateur", icon: Crown, color: "bg-gradient-to-br from-red-600 via-red-500 to-red-700 text-white border-2 border-red-400 dark:border-red-600 font-bold shadow-lg" },
  { value: "RESP_HSE", label: "Teams HSE", icon: Shield, color: "bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 text-white shadow-md" },
  { value: "RESP_RH", label: "Responsable RH", icon: Users, color: "bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 text-white shadow-md" },
  { value: "INFIRMIER_ST", label: "Infirmier", icon: Stethoscope, color: "bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white shadow-md" },
  { value: "MEDECIN_TRAVAIL", label: "Médecin", icon: User, color: "bg-gradient-to-br from-emerald-600 via-green-500 to-teal-700 text-white shadow-md" },
  { value: "EMPLOYEE", label: "Salarié", icon: User, color: "bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-600 text-white shadow-md" }
]

// Function to translate gender values
const translateGender = (gender: string, lang: string) => {
  if (!gender) return lang === 'fr' ? 'Non renseigné' : 'Not specified';
  
  const map: Record<string, { fr: string; en: string }> = {
    'MALE': { fr: 'Homme', en: 'Male' },
    'FEMALE': { fr: 'Femme', en: 'Female' },
    'Homme': { fr: 'Homme', en: 'Male' },
    'Femme': { fr: 'Femme', en: 'Female' },
    'homme': { fr: 'Homme', en: 'Male' },
    'femme': { fr: 'Femme', en: 'Female' }
  };
  
  if (Object.prototype.hasOwnProperty.call(map, gender)) {
    return map[gender][lang as keyof typeof map[string]];
  }
  return gender;
}

// Function to validate and normalize gender values
const validateAndNormalizeGender = (gender: string): string | null => {
  if (!gender || gender.trim() === '') return null;
  
  const normalizedGender = gender.trim();
  const validGenders = ['MALE', 'FEMALE', 'Homme', 'Femme', 'homme', 'femme'];
  
  if (validGenders.includes(normalizedGender)) {
    // Convert to backend format
    if (['Homme', 'homme'].includes(normalizedGender)) return 'MALE';
    if (['Femme', 'femme'].includes(normalizedGender)) return 'FEMALE';
    if (['Autre', 'autre'].includes(normalizedGender)) return 'OTHER';
    return normalizedGender; // Already in correct format
  }
  
  return null;
}

export default function AdminUsersPage() {
  const { user, accessToken } = useAuth()
  const { themeColors } = useTheme()
  const router = useRouter()
  
  // Language state
  const [language, setLanguage] = useState<"en" | "fr">("fr")
  const t = translations[language]

  // Custom date picker state
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false)
  const [showHireDatePicker, setShowHireDatePicker] = useState(false)
  const [showCreateBirthDatePicker, setShowCreateBirthDatePicker] = useState(false)
  const [showCreateHireDatePicker, setShowCreateHireDatePicker] = useState(false)

  // Custom date picker component
  const CustomDatePicker = ({ 
    value, 
    onChange, 
    isOpen, 
    onToggle, 
    placeholder 
  }: {
    value: string
    onChange: (date: string) => void
    isOpen: boolean
    onToggle: () => void
    placeholder: string
  }) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null)
    const [showMonthPicker, setShowMonthPicker] = useState(false)
    const [showYearPicker, setShowYearPicker] = useState(false)

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0]
    }

    const getDaysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const handleDateSelect = (day: number) => {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      setSelectedDate(newDate)
      onChange(formatDate(newDate))
      onToggle()
    }

    const previousMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const selectMonth = (monthIndex: number) => {
      setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1))
      setShowMonthPicker(false)
    }

    const selectYear = (year: number) => {
      setCurrentDate(new Date(year, currentDate.getMonth(), 1))
      setShowYearPicker(false)
    }

    const today = new Date()
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDayOfMonth = getFirstDayOfMonth(currentDate)
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]

    // Generate years for year picker (current year ± 50 years)
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i)

    return (
      <div className="relative">
        <div 
          className="relative cursor-pointer"
          onClick={onToggle}
        >
                     <Input
             value={selectedDate ? formatDate(selectedDate) : ""}
             placeholder={placeholder}
             readOnly
             className="pr-12 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md text-slate-900 dark:text-slate-100 cursor-pointer placeholder:text-slate-500 dark:placeholder:text-slate-400"
           />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Calendar className="h-5 w-5 text-slate-400 dark:text-slate-500 transition-colors duration-300" />
          </div>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-2xl p-4 min-w-[280px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="px-3 py-1 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {monthNames[currentDate.getMonth()]}
                </button>
                <button
                  onClick={() => setShowYearPicker(!showYearPicker)}
                  className="px-3 py-1 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {currentDate.getFullYear()}
                </button>
              </div>
              
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Month Picker */}
            {showMonthPicker && (
              <div className="absolute top-12 left-0 right-0 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg p-3">
                <div className="grid grid-cols-3 gap-2">
                  {monthNames.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => selectMonth(index)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        index === currentDate.getMonth()
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Year Picker */}
            {showYearPicker && (
              <div className="absolute top-12 left-0 right-0 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => selectYear(year)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        year === currentDate.getFullYear()
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div key={`empty-${i}`} className="h-10"></div>
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                const isSelected = selectedDate && formatDate(selectedDate) === formatDate(date)
                const isToday = formatDate(today) === formatDate(date)
                const isPast = date < new Date(today.setHours(0, 0, 0, 0))

                return (
                  <button
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    className={`
                      h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200
                      ${isSelected 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : isToday 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500' 
                          : isPast 
                            ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Footer buttons */}
            <div className="flex justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
              <button
                onClick={() => {
                  setSelectedDate(null)
                  onChange("")
                  onToggle()
                }}
                className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  setSelectedDate(today)
                  onChange(formatDate(today))
                  onToggle()
                }}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  // User data state
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  
  // Form state
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    roles: [] as string[],
    
    // General Information Fields (Informations Générales)
    gender: "",
    birthDate: "",
    address: "",
    company: "",
    hireDate: "",
    profession: "",
    
    // Additional fields
    phoneNumber: "",
    department: "",
    matriculeNumber: ""
  })
  
  // Form validation state
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const [showPassword, setShowPassword] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "email" | "createdAt" | "lastLogin">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Bulk import state
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false)
  const [bulkImportData, setBulkImportData] = useState("")
  const [importResults, setImportResults] = useState<any[]>([])
  const [isImporting, setIsImporting] = useState(false)

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true // Optional field
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/
    return phoneRegex.test(phone)
  }

  const validateMatriculeNumber = (matriculeNumber: string): boolean => {
    if (!matriculeNumber) return true // Optional field
    const matriculeRegex = /^MAT-\d+$/
    return matriculeRegex.test(matriculeNumber)
  }

  const validateForm = (formData: any, isCreate: boolean = true): boolean => {
    const errors: {[key: string]: string} = {}
    
    // Required fields validation with specific error messages
    if (!formData.username?.trim()) {
      errors.username = "Le nom d'utilisateur est obligatoire"
    } else if (formData.username.length < 3) {
      errors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères"
    }
    
    if (!formData.email?.trim()) {
      errors.email = "L'adresse email est obligatoire"
    } else if (!validateEmail(formData.email)) {
      errors.email = "Veuillez entrer une adresse email valide"
    }
    
    if (!formData.firstName?.trim()) {
      errors.firstName = "Le prénom est obligatoire"
    } else if (formData.firstName.length < 2) {
      errors.firstName = "Le prénom doit contenir au moins 2 caractères"
    }
    
    if (!formData.lastName?.trim()) {
      errors.lastName = "Le nom est obligatoire"
    } else if (formData.lastName.length < 2) {
      errors.lastName = "Le nom doit contenir au moins 2 caractères"
    }
    
    if (isCreate && !formData.password?.trim()) {
      errors.password = "Le mot de passe est obligatoire"
    } else if (isCreate && formData.password && formData.password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères"
    }
    
    if (!formData.gender?.trim()) {
      errors.gender = "Le sexe est obligatoire"
    }
    
    if (!formData.birthDate?.trim()) {
      errors.birthDate = "La date de naissance est obligatoire"
    }
    
    if (!formData.address?.trim()) {
      errors.address = "L'adresse est obligatoire"
    }
    
    if (!formData.company?.trim()) {
      errors.company = "L'entreprise est obligatoire"
    }
    
    if (!formData.hireDate?.trim()) {
      errors.hireDate = "La date d'embauche est obligatoire"
    }
    
    if (!formData.profession?.trim()) {
      errors.profession = "La profession est obligatoire"
    }
    
    // Optional field validation
    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      errors.phoneNumber = "Veuillez entrer un numéro de téléphone valide"
    }
    
    if (formData.department && formData.department.length < 2) {
      errors.department = "Le département doit contenir au moins 2 caractères"
    }
    
    if (formData.matriculeNumber && !validateMatriculeNumber(formData.matriculeNumber)) {
      errors.matriculeNumber = "Le format du numéro de matricule est invalide"
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const clearValidationErrors = () => {
    setValidationErrors({})
  }

  // Check if user is admin
  useEffect(() => {
    if (user && !user.roles?.includes("ADMIN")) {
      router.push("/dashboard")
    }
  }, [user, router])

  // Ensure edit form is properly initialized when user is selected
  useEffect(() => {
    if (selectedUser && showEditDialog) {
      // Only initialize if the user doesn't already have the required fields
      const needsInitialization = !selectedUser.firstName || !selectedUser.lastName || !selectedUser.email || 
                                 !selectedUser.gender || !selectedUser.birthDate || !selectedUser.address || 
                                 !selectedUser.company || !selectedUser.hireDate || !selectedUser.profession ||
                                 !selectedUser.phoneNumber || !selectedUser.department
      
      if (needsInitialization) {
        // Ensure all required fields are present for the update to work
        const userWithDefaults = {
          ...selectedUser,
          firstName: selectedUser.firstName || "",
          lastName: selectedUser.lastName || "",
          email: selectedUser.email || "",
          gender: selectedUser.gender || "",
          birthDate: selectedUser.birthDate ? selectedUser.birthDate.split('T')[0] : "",
          address: selectedUser.address || "",
          company: selectedUser.company || "",
          hireDate: selectedUser.hireDate ? selectedUser.hireDate.split('T')[0] : "",
          profession: selectedUser.profession || "",
          phoneNumber: selectedUser.phoneNumber || "",
          department: selectedUser.department || ""
        }
        setSelectedUser(userWithDefaults)
      }
    }
  }, [showEditDialog]) // Remove selectedUser from dependencies to prevent infinite loop

  // Fetch users with enhanced error handling and role fetching
  const fetchUsers = async () => {
    try {
      setLoading(true)
      // First, fetch basic user data from Keycloak
      const response = await fetch(`/api/v1/admin/users`, {
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
        const keycloakUsers = await response.json()
        
        // For each user, fetch their roles and profile data
        const enrichedUsers = await Promise.all(
          keycloakUsers.map(async (keycloakUser: any) => {
            try {
              // Fetch user roles from Keycloak
              const rolesResponse = await fetch(`/api/v1/admin/keycloak/users/${keycloakUser.id}/role-mappings/realm`, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                }
              })
              
              let roles: string[] = []
              if (rolesResponse.ok) {
                const rolesData = await rolesResponse.json()
                roles = rolesData.map((role: any) => role.name || role).filter(Boolean)
              } else {
                console.warn(`Failed to fetch roles for user ${keycloakUser.id}:`, rolesResponse.status, rolesResponse.statusText)
              }
              
              // Only add EMPLOYEE as fallback if user has no roles at all
              if (roles.length === 0) {
                roles = ["EMPLOYEE"]
              }
              
              // Fetch user profile data (additional fields)
              let profileData: any = {}
              try {
                const profileResponse = await fetch(`/api/v1/admin/keycloak/users/${keycloakUser.id}/profile`, {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                  }
                })
                
                if (profileResponse.ok) {
                  const profileResult = await profileResponse.json()
                  if (profileResult.success && profileResult.profile) {
                    profileData = profileResult.profile
                  }
                }
              } catch (profileError) {
                console.warn(`Could not fetch profile for user ${keycloakUser.id}:`, profileError)
              }
              
              // Combine Keycloak data with profile data
              const enrichedUser: AdminUser = {
                id: keycloakUser.id,
                username: keycloakUser.username || '',
                email: keycloakUser.email || '',
                firstName: keycloakUser.firstName || '',
                lastName: keycloakUser.lastName || '',
                roles: roles,
                enabled: keycloakUser.enabled !== false,
                emailVerified: keycloakUser.emailVerified === true,
                lastLogin: (() => {
                  const lastLogin = keycloakUser.lastLoginTimestamp ? new Date(keycloakUser.lastLoginTimestamp).toISOString() : 
                                   keycloakUser.lastLogin ? new Date(keycloakUser.lastLogin).toISOString() : undefined;
                  return lastLogin;
                })(),
                createdAt: keycloakUser.createdTimestamp ? new Date(keycloakUser.createdTimestamp).toISOString() : new Date().toISOString(),
                keycloakId: keycloakUser.id,
                
                // Profile fields
                dossierNumber: profileData.dossierNumber || undefined,
                matriculeNumber: profileData.matriculeNumber || undefined,
                gender: profileData.gender || undefined,
                birthDate: profileData.birthDate || undefined,
                address: profileData.address || undefined,
                company: profileData.company || undefined,
                hireDate: profileData.hireDate || undefined,
                profession: profileData.profession || undefined,
                phoneNumber: profileData.phoneNumber || undefined,
                department: profileData.department || undefined,
                
                // SSO detection - check if user has Google federated identity
                googleSSO: keycloakUser.federatedIdentities && keycloakUser.federatedIdentities.length > 0
              }
              

              

              
              return enrichedUser
            } catch (userError) {
              console.error(`Error enriching user ${keycloakUser.id}:`, userError)
              // Return basic user data if enrichment fails
              return {
                id: keycloakUser.id,
                username: keycloakUser.username || '',
                email: keycloakUser.email || '',
                firstName: keycloakUser.firstName || '',
                lastName: keycloakUser.lastName || '',
                roles: ["EMPLOYEE"],
                enabled: keycloakUser.enabled !== false,
                emailVerified: keycloakUser.emailVerified === true,
                lastLogin: (() => {
                  const lastLogin = keycloakUser.lastLoginTimestamp ? new Date(keycloakUser.lastLoginTimestamp).toISOString() : 
                                   keycloakUser.lastLogin ? new Date(keycloakUser.lastLogin).toISOString() : undefined;
                  return lastLogin;
                })(),
                createdAt: keycloakUser.createdTimestamp ? new Date(keycloakUser.createdTimestamp).toISOString() : new Date().toISOString(),
                keycloakId: keycloakUser.id,
              }
            }
          })
        )
        
        setUsers(enrichedUsers)
      } else {
        throw new Error(`HTTP ${response.status}`)
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

  // Refresh user data when view dialog opens to get latest information
  useEffect(() => {
    if (showViewDialog && selectedUser) {
      // Fetch the latest user data to ensure we show current information
      const refreshUserData = async () => {
        try {
          console.log("Fetching user profile for view dialog:", selectedUser.keycloakId);
          
          // Use the Keycloak profile endpoint that works with Keycloak IDs
          const response = await fetch(`/api/v1/admin/keycloak/users/${selectedUser.keycloakId}/profile`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const result = await response.json()
            console.log("User profile data received:", result);
            
            if (result.success && result.profile) {
              const updatedUser = {
                ...selectedUser,
                ...result.profile,
                // Preserve email verification status from the original user data (Keycloak)
                emailVerified: selectedUser.emailVerified,
                // Ensure gender is properly set
                gender: result.profile.gender || selectedUser.gender
              }
              setSelectedUser(updatedUser)
            } else {
              console.warn("No profile data received for user:", selectedUser.keycloakId);
            }
          } else {
            console.warn("Failed to fetch user profile:", response.status);
          }
        } catch (error) {
          console.warn("Could not refresh user data for view:", error)
        }
      }
      
      refreshUserData()
    }
  }, [showViewDialog, selectedUser?.keycloakId, accessToken])

  // Create new user with enhanced validation
  const createUser = async () => {
    try {
      if (!newUser.username || !newUser.email || !newUser.firstName || !newUser.lastName || !newUser.password) {
        toast.error("Veuillez remplir tous les champs obligatoires")
        return
      }

      if (!newUser.gender || !newUser.birthDate || !newUser.address || !newUser.company || !newUser.hireDate || !newUser.profession) {
        toast.error("Veuillez remplir toutes les informations générales obligatoires")
        return
      }

      // Validate and normalize gender before sending
      const normalizedGender = validateAndNormalizeGender(newUser.gender || '');
      if (!normalizedGender) {
        toast.error("❌ Erreur de validation", {
          description: "Veuillez sélectionner un sexe valide (Homme, Femme, ou Autre)",
          duration: 5000
        });
        return;
      }

      // Format dates for backend
      const userData = {
        ...newUser,
        gender: normalizedGender,
        birthDate: newUser.birthDate ? `${newUser.birthDate}T00:00:00` : null,
        hireDate: newUser.hireDate ? `${newUser.hireDate}T00:00:00` : null
      }

      const response = await fetch(`/api/v1/admin/users`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (response.ok) {
        toast.success("Utilisateur créé avec succès")
        setShowCreateDialog(false)
        setNewUser({ 
          username: "", 
          email: "", 
          firstName: "", 
          lastName: "", 
          password: "", 
          roles: [],
          
          // General Information Fields (Informations Générales)
          gender: "",
          birthDate: "",
          address: "",
          company: "",
          hireDate: "",
          profession: "",
          
          // Additional fields
          phoneNumber: "",
          department: "",
          matriculeNumber: ""
        })
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || "Erreur lors de la création")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error("Erreur lors de la création")
    }
  }

  // Update user with enhanced fields
  const updateUser = async () => {
    if (!selectedUser) return

    // Clear previous validation errors
    clearValidationErrors()

    // Use the same validation as createUser but for editing
    if (!validateForm(selectedUser, false)) {
      toast.error("Veuillez corriger les erreurs dans le formulaire", {
        description: "Certains champs sont manquants ou incorrects",
        duration: 5000,
        action: {
          label: "Voir les erreurs",
          onClick: () => {
            // Scroll to first error field
            const firstError = document.querySelector('.error-message')
            if (firstError) {
              firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }
        }
      })
      return
    }

    try {
      // Validate and normalize gender before sending
      const normalizedGender = validateAndNormalizeGender(selectedUser.gender || '');
      if (!normalizedGender) {
        toast.error("❌ Erreur de validation", {
          description: "Veuillez sélectionner un sexe valide (Homme, Femme, ou Autre)",
          duration: 5000
        });
        return;
      }

      // Update user profile using Keycloak UUID
      const requestBody = {
        username: selectedUser.username,
        email: selectedUser.email,
        gender: normalizedGender,
        birthDate: selectedUser.birthDate ? `${selectedUser.birthDate}T00:00:00` : null,
        address: selectedUser.address,
        company: selectedUser.company,
        hireDate: selectedUser.hireDate ? `${selectedUser.hireDate}T00:00:00` : null,
        profession: selectedUser.profession,
        phoneNumber: selectedUser.phoneNumber,
        department: selectedUser.department,
        matriculeNumber: selectedUser.matriculeNumber
      }
      
      console.log("Sending update request with data:", requestBody)
      console.log("Selected user keycloakId:", selectedUser.keycloakId)
      console.log("Gender value being sent:", normalizedGender)
      
      const response = await fetch(`/api/v1/admin/keycloak/users/${selectedUser.keycloakId}/profile`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (response.ok) {
        const result = await response.json()
        console.log("Update successful:", result)
        
        // Show success message with animation
        toast.success("✅ Utilisateur mis à jour avec succès", {
          description: `Les informations de ${selectedUser.firstName} ${selectedUser.lastName} ont été mises à jour`,
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none'
          }
        })
        
        // Show success message at top of page
        setSuccessMessage(`✅ Utilisateur ${selectedUser.firstName} ${selectedUser.lastName} mis à jour avec succès`)
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 5000)
        
        setShowEditDialog(false)
        setSelectedUser(null)
        
        // Force refresh the users list to get updated data
        setTimeout(() => {
        fetchUsers()
        }, 500)
      } else {
        const error = await response.json()
        console.error("Update failed with error:", error)
        console.error("Response status:", response.status)
        
        // Show detailed error message
        toast.error("❌ Erreur lors de la mise à jour", {
          description: error.message || error.error || "Une erreur s'est produite lors de la mise à jour",
          duration: 6000,
          style: {
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            border: 'none'
          }
        })
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("❌ Erreur de connexion", {
        description: "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
        duration: 6000,
        style: {
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
          border: 'none'
        }
      })
    }
  }

  // Delete user with confirmation
  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/v1/admin/users/complete/${userId}`, {
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
        const result = await response.json()
        toast.success(result.message || "Utilisateur supprimé avec succès")
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || "Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Erreur lors de la suppression")
    }
  }

  // Toggle user status with enhanced feedback
  const toggleUserStatus = async (userId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}/status`, {
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
        toast.success(`Utilisateur ${enabled ? 'désactivé' : 'activé'} avec succès`)
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || "Erreur lors du changement de statut")
      }
    } catch (error) {
      console.error("Error toggling user status:", error)
      toast.error("Erreur lors du changement de statut")
    }
  }

  // Reset user password
  const resetUserPassword = async (userId: string, userName: string) => {
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}/reset-password`, {
        method: "POST",
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
        toast.success(t.resetPasswordSuccess)
      } else {
        const error = await response.json()
        toast.error(error.message || t.resetPasswordError)
      }
    } catch (error) {
      console.error("Error resetting user password:", error)
      toast.error(t.resetPasswordError)
    }
  }

  // Bulk import functions
  const downloadTemplate = () => {
    // Complete template with all profile information fields
    // This template includes all the fields that are available in the user profile
    // Matricule number format: MAT-XXXXXXXXX (e.g., MAT-1234567890)
    const template = [
      {
        username: "john.doe",
        email: "john.doe@company.com",
        firstName: "John",
        lastName: "Doe",
        password: "SecurePassword123!", // Initial password for the user
        roles: ["EMPLOYEE"],
        // Personal Information
        gender: "MALE", // MALE, FEMALE
        birthDate: "1990-05-15", // YYYY-MM-DD format
        address: "123 Rue de la Paix, 75001 Paris, France",
        // Professional Information
        company: "OHSE CAPITAL",
        hireDate: "2023-01-15", // YYYY-MM-DD format
        profession: "Software Engineer",
        phoneNumber: "+33 1 23 45 67 89",
        department: "IT",
        dossierNumber: "OHSE-2023001", // Optional, will be auto-generated if not provided
        matriculeNumber: "MAT-1234567890" // Optional, will be auto-generated if not provided
      },
      {
        username: "jane.smith",
        email: "jane.smith@company.com",
        firstName: "Jane",
        lastName: "Smith",
        password: "SecurePassword123!", // Initial password for the user
        roles: ["RESP_RH"],
        // Personal Information
        gender: "FEMALE",
        birthDate: "1985-08-22",
        address: "456 Avenue des Champs, 75008 Paris, France",
        // Professional Information
        company: "OHSE CAPITAL",
        hireDate: "2022-03-10",
        profession: "HR Manager",
        phoneNumber: "+33 1 98 76 54 32",
        department: "HR",
        dossierNumber: "OHSE-2022001",
        matriculeNumber: "MAT-1234567891" // Optional, will be auto-generated if not provided
      },
      {
        username: "mohammed.alami",
        email: "mohammed.alami@company.com",
        firstName: "Mohammed",
        lastName: "Alami",
        password: "SecurePassword123!", // Initial password for the user
        roles: ["INFIRMIER_ST"],
        // Personal Information
        gender: "MALE",
        birthDate: "1988-12-03",
        address: "789 Boulevard Mohammed V, Casablanca, Maroc",
        // Professional Information
        company: "OHSE CAPITAL",
        hireDate: "2023-06-20",
        profession: "Infirmier",
        phoneNumber: "+212 5 22 34 56 78",
        department: "Santé",
        dossierNumber: "OHSE-2023002",
        matriculeNumber: "MAT-1234567892" // Optional, will be auto-generated if not provided
      }
    ]

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users_template_complete.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(t.templateDownloaded)
  }

  const handleBulkImport = async () => {
    if (!bulkImportData.trim()) {
      toast.error("Please enter JSON data")
      return
    }

    try {
      setIsImporting(true)
      const usersData = JSON.parse(bulkImportData)
      
      if (!Array.isArray(usersData)) {
        toast.error("JSON data must be an array of users")
        return
      }

      // Validate matricule numbers in the import data
      const invalidMatriculeUsers = usersData.filter((user: any) => {
        if (user.matriculeNumber && !validateMatriculeNumber(user.matriculeNumber)) {
          return true
        }
        return false
      })

      if (invalidMatriculeUsers.length > 0) {
        toast.error(`Invalid matricule number format found in ${invalidMatriculeUsers.length} user(s). Format should be MAT-XXXXXXXXX`)
        setIsImporting(false)
        return
      }



      const response = await fetch('/api/v1/admin/users/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(usersData)
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      const result = await response.json()

      if (result.success) {
        setImportResults(result.results)
        toast.success(`${result.successCount} users imported successfully, ${result.errorCount} failed`)
        fetchUsers() // Refresh the user list
      } else {
        toast.error(result.message || t.importError)
      }
    } catch (error) {
      console.error("Error during bulk import:", error)
      toast.error("Invalid JSON format or import failed")
    } finally {
      setIsImporting(false)
    }
  }

  // Enhanced filtering and sorting
  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.matriculeNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = roleFilter === "all" || 
                         (roleFilter === "EMPLOYEE" && (getFilteredRoles(user.roles).includes("EMPLOYEE"))) ||
                         getFilteredRoles(user.roles).includes(roleFilter)
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
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case "lastLogin":
          aValue = a.lastLogin ? new Date(a.lastLogin) : new Date(0)
          bValue = b.lastLogin ? new Date(b.lastLogin) : new Date(0)
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
    // Filter out default roles that shouldn't be displayed
    if (role === "default-roles-oshapp" || role === "offline_access" || role === "uma_authorization") {
      return null
    }
    
    // Handle both EMPLOYEE and SALARIE as the same role
    if (role === "SALARIE") {
      role = "EMPLOYEE"
    }
    
    const availableRoles = getRoleColors(themeColors)
    const roleConfig = availableRoles.find((r: any) => r.value === role)
    if (!roleConfig) {
      return { icon: User, label: role, color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" }
    }
    return roleConfig
  }

  // Filter roles to show only meaningful ones
  const getFilteredRoles = (roles: string[]) => {
    return roles
      .filter(role => role !== "default-roles-oshapp" && role !== "offline_access" && role !== "uma_authorization")
      .map(role => role === "SALARIE" ? "EMPLOYEE" : role)
  }

  // Handle role selection for multiple roles
  const handleRoleSelection = (selectedRoles: string[], isNewUser: boolean = true) => {
    console.log("Selected roles:", selectedRoles) // Debug log
    
    if (isNewUser) {
      // Use selected roles directly, including EMPLOYEE if selected
      let updatedRoles = selectedRoles.filter(role => role !== "none")
      // If EMPLOYEE is explicitly selected, include it
      if (updatedRoles.includes("EMPLOYEE")) {
        setNewUser({ ...newUser, roles: updatedRoles })
      } else if (updatedRoles.length === 0) {
        // Only add EMPLOYEE if no specific role selected
        setNewUser({ ...newUser, roles: ["EMPLOYEE"] })
      } else {
        // Add EMPLOYEE to other selected roles
        setNewUser({ ...newUser, roles: [...updatedRoles, "EMPLOYEE"] })
      }
    } else if (selectedUser) {
      // Use selected roles directly, including EMPLOYEE if selected
      let updatedRoles = selectedRoles.filter(role => role !== "none")
      // If EMPLOYEE is explicitly selected, include it
      if (updatedRoles.includes("EMPLOYEE")) {
        setSelectedUser({ ...selectedUser, roles: updatedRoles })
      } else if (updatedRoles.length === 0) {
        // Only add EMPLOYEE if no specific role selected
        setSelectedUser({ ...selectedUser, roles: ["EMPLOYEE"] })
      } else {
        // Add EMPLOYEE to other selected roles
        setSelectedUser({ ...selectedUser, roles: [...updatedRoles, "EMPLOYEE"] })
      }
    }
  }

  // Success/Error message state
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)

  // Fix all users gender
  const fixAllUsersGender = async () => {
    try {
      const response = await fetch(`/api/v1/admin/users/fix-gender`, {
        method: "POST",
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
        const result = await response.json()
        toast.success("✅ Gender fix completed", {
          description: result.message,
          duration: 5000
        })
        // Refresh the users list to show updated data
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error("❌ Error fixing gender", {
          description: error.message || "Failed to fix user genders"
        })
      }
    } catch (error) {
      console.error("Error fixing user genders:", error)
      toast.error("❌ Error fixing gender", {
        description: "Failed to fix user genders"
      })
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
      
      {/* Success/Error Message Banner */}
      {showSuccessMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">{successMessage}</span>
            <button 
              onClick={() => setShowSuccessMessage(false)}
              className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {showErrorMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{errorMessage}</span>
            <button 
              onClick={() => setShowErrorMessage(false)}
              className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      <div className="container mx-auto p-6 space-y-6 relative z-10">
      {/* Enhanced Header */}
      <div className="flex justify-between items-center animate-slide-down">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-2xl transition-all duration-500 transform hover:scale-110 hover:rotate-3" style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[700]}, ${themeColors.colors.primary[800]})`}}>
              <Users className="h-6 w-6 text-white transition-transform duration-500 hover:scale-110" />
            </div>
            {t.pageTitle}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {t.pageDescription} - <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredAndSortedUsers.length}</span> utilisateur(s)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={fetchUsers} 
            variant="outline" 
            className="bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t.refresh}
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button 
                style={{
                  background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[700]}, ${themeColors.colors.primary[800]})`
                }}
                className="hover:shadow-3xl transition-all duration-500 transform hover:scale-110 active:scale-95 hover:-translate-y-1 px-6 py-3 text-lg font-semibold text-white shadow-2xl btn-premium"
              >
                <UserPlus className="h-5 w-5 mr-3" />
                {t.newUser}
              </Button>
            </DialogTrigger>
          </Dialog>

          <Dialog open={showBulkImportDialog} onOpenChange={setShowBulkImportDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm px-6 py-3 text-lg font-semibold"
              >
                <Upload className="h-5 w-5 mr-3" />
                {t.bulkImport}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">{t.createUserTitle}</DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400">
                  {t.createUserDescription}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">{t.username} *</Label>
                  <div className="col-span-3 space-y-1">
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => {
                        setNewUser({...newUser, username: e.target.value})
                        if (validationErrors.username) {
                          setValidationErrors({...validationErrors, username: ""})
                        }
                      }}
                      className={`bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                        validationErrors.username ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                      }`}
                      placeholder={t.usernamePlaceholder}
                    />
                    {validationErrors.username && (
                      <div className="flex items-center gap-1 text-red-500 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.username}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">{t.email} *</Label>
                  <div className="col-span-3 space-y-1">
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                      onChange={(e) => {
                        setNewUser({...newUser, email: e.target.value})
                        if (validationErrors.email) {
                          setValidationErrors({...validationErrors, email: ""})
                        }
                      }}
                      className={`bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                        validationErrors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                      }`}
                      placeholder={t.emailPlaceholder}
                    />
                    {validationErrors.email && (
                      <div className="flex items-center gap-1 text-red-500 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.email}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">{t.firstName} *</Label>
                  <div className="col-span-3 space-y-1">
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                      onChange={(e) => {
                        setNewUser({...newUser, firstName: e.target.value})
                        if (validationErrors.firstName) {
                          setValidationErrors({...validationErrors, firstName: ""})
                        }
                      }}
                      className={`bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                        validationErrors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                      }`}
                      placeholder={t.firstNamePlaceholder}
                    />
                    {validationErrors.firstName && (
                      <div className="flex items-center gap-1 text-red-500 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.firstName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">{t.lastName} *</Label>
                  <div className="col-span-3 space-y-1">
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                      onChange={(e) => {
                        setNewUser({...newUser, lastName: e.target.value})
                        if (validationErrors.lastName) {
                          setValidationErrors({...validationErrors, lastName: ""})
                        }
                      }}
                      className={`bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                        validationErrors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                      }`}
                      placeholder={t.lastNamePlaceholder}
                    />
                    {validationErrors.lastName && (
                      <div className="flex items-center gap-1 text-red-500 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.lastName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phoneNumber" className="text-right">{t.phoneNumber}</Label>
                  <Input
                    id="phoneNumber"
                    value={newUser.phoneNumber}
                    onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                    className="col-span-3 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    placeholder={t.phonePlaceholder}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">{t.department}</Label>
                  <Input
                    id="department"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    className="col-span-3 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    placeholder={t.departmentPlaceholder}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="matriculeNumber" className="text-right">{t.matriculeNumber}</Label>
                  <div className="col-span-3 space-y-1">
                    <Input
                      id="matriculeNumber"
                      value={newUser.matriculeNumber}
                      onChange={(e) => {
                        setNewUser({...newUser, matriculeNumber: e.target.value})
                        if (validationErrors.matriculeNumber) {
                          setValidationErrors({...validationErrors, matriculeNumber: ""})
                        }
                      }}
                      className={`bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                        validationErrors.matriculeNumber ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                      }`}
                      placeholder="Ex: MAT-1234567890"
                    />
                    {validationErrors.matriculeNumber && (
                      <div className="flex items-center gap-1 text-red-500 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.matriculeNumber}
                      </div>
                    )}
                  </div>
                </div>

                                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="gender" className="text-right">{t.gender} *</Label>
                   <div className="col-span-3 space-y-1">
                   <Select
                     value={newUser.gender}
                       onValueChange={(value) => {
                         setNewUser({...newUser, gender: value})
                         if (validationErrors.gender) {
                           setValidationErrors({...validationErrors, gender: ""})
                         }
                       }}
                     >
                       <SelectTrigger className={`bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                         validationErrors.gender ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                       }`}>
                         <SelectValue placeholder={`Ex: ${t.male}, ${t.female}`} />
                     </SelectTrigger>
                     <SelectContent>
                         <SelectItem value="MALE">{t.male}</SelectItem>
                         <SelectItem value="FEMALE">{t.female}</SelectItem>
                     </SelectContent>
                   </Select>
                     {validationErrors.gender && (
                       <div className="flex items-center gap-1 text-red-500 text-xs">
                         <AlertCircle className="h-3 w-3" />
                         {validationErrors.gender}
                       </div>
                     )}
                   </div>
                 </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="birthDate" className="text-right">{t.birthDate} *</Label>
                   <div className="col-span-3">
                     <CustomDatePicker
                     value={newUser.birthDate || ""}
                       onChange={(date) => setNewUser({...newUser, birthDate: date})}
                       isOpen={showCreateBirthDatePicker}
                       onToggle={() => setShowCreateBirthDatePicker(!showCreateBirthDatePicker)}
                       placeholder="Select birth date"
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="address" className="text-right">{t.address} *</Label>
                   <div className="col-span-3 space-y-1">
                                     <Input
                    id="address"
                    value={newUser.address}
                       onChange={(e) => {
                         setNewUser({...newUser, address: e.target.value})
                         if (validationErrors.address) {
                           setValidationErrors({...validationErrors, address: ""})
                         }
                       }}
                       className={`bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                         validationErrors.address ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                       }`}
                       placeholder={t.addressPlaceholder}
                     />
                     {validationErrors.address && (
                       <div className="flex items-center gap-1 text-red-500 text-xs">
                         <AlertCircle className="h-3 w-3" />
                         {validationErrors.address}
                       </div>
                     )}
                   </div>
                 </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="company" className="text-right">{t.company} *</Label>
                   <div className="col-span-3 space-y-1">
                                     <Input
                    id="company"
                    value={newUser.company}
                       onChange={(e) => {
                         setNewUser({...newUser, company: e.target.value})
                         if (validationErrors.company) {
                           setValidationErrors({...validationErrors, company: ""})
                         }
                       }}
                       className={`bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                         validationErrors.company ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                       }`}
                       placeholder={t.companyPlaceholder}
                     />
                     {validationErrors.company && (
                       <div className="flex items-center gap-1 text-red-500 text-xs">
                         <AlertCircle className="h-3 w-3" />
                         {validationErrors.company}
                       </div>
                     )}
                   </div>
                 </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="hireDate" className="text-right">{t.hireDate} *</Label>
                   <div className="col-span-3">
                     <CustomDatePicker
                     value={newUser.hireDate || ""}
                       onChange={(date) => setNewUser({...newUser, hireDate: date})}
                       isOpen={showCreateHireDatePicker}
                       onToggle={() => setShowCreateHireDatePicker(!showCreateHireDatePicker)}
                       placeholder="Select hire date"
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="profession" className="text-right">{t.profession} *</Label>
                   <div className="col-span-3 space-y-1">
                                     <Input
                    id="profession"
                    value={newUser.profession}
                       onChange={(e) => {
                         setNewUser({...newUser, profession: e.target.value})
                         if (validationErrors.profession) {
                           setValidationErrors({...validationErrors, profession: ""})
                         }
                       }}
                       className={`bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 ${
                         validationErrors.profession ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                       }`}
                       placeholder={t.professionPlaceholder}
                     />
                     {validationErrors.profession && (
                       <div className="flex items-center gap-1 text-red-500 text-xs">
                         <AlertCircle className="h-3 w-3" />
                         {validationErrors.profession}
                       </div>
                     )}
                   </div>
                 </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">{t.password} *</Label>
                  <div className="col-span-3 relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md pr-10 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      placeholder={t.passwordPlaceholder}
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
                   <Label htmlFor="roles" className="text-right">Rôle spécifique</Label>
                                                           <Select
                     value={newUser.roles.find(role => role !== "SALARIE") || "EMPLOYEE"}
                     onValueChange={(value) => handleRoleSelection([value], true)}
                   >
                     <SelectTrigger className="col-span-3 border-slate-300 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90 shadow-lg hover:shadow-xl transition-all duration-300">
                       <SelectValue placeholder={t.selectRole} />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="EMPLOYEE">
                         <div className="flex items-center gap-2">
                           <User className="h-4 w-4" />
                           {t.employeeRole}
                         </div>
                       </SelectItem>
                       {getRoleColors(themeColors).filter((role: any) => role.value !== "EMPLOYEE" && role.value !== "SALARIE").map((role: any) => (
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
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-lg transition-all duration-300 hover:shadow-xl">
                  {t.cancel}
                </Button>
                <Button 
                  onClick={createUser} 
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[700]})`
                  }}
                  className="hover:shadow-3xl transition-all duration-500 transform hover:scale-110 active:scale-95 hover:-translate-y-1 text-white shadow-2xl"
                >
                  {t.create}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bulk Import Dialog */}
          <Dialog open={showBulkImportDialog} onOpenChange={setShowBulkImportDialog}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">{t.bulkImportTitle}</DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                {t.bulkImportDescription}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Template Download Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Download Template</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Get a sample JSON template to understand the required format</p>
                  </div>
                  <Button
                    onClick={downloadTemplate}
                    variant="outline"
                    className="bg-white dark:bg-slate-700 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t.downloadTemplate}
                  </Button>
                </div>
              </div>

              {/* JSON Input Section */}
              <div className="space-y-3">
                <Label htmlFor="bulk-import-data" className="text-slate-700 dark:text-slate-300 font-medium">
                  {t.importFromJSON}
                </Label>
                <textarea
                  id="bulk-import-data"
                  value={bulkImportData}
                  onChange={(e) => setBulkImportData(e.target.value)}
                  placeholder={`[
  {
    "username": "john.doe",
    "email": "john.doe@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "SecurePassword123!", // Initial password for the user
    "roles": ["EMPLOYEE"],
    "phoneNumber": "+33 1 23 45 67 89",
    "department": "IT",
    "position": "Software Engineer"
  }
]`}
                  className="w-full h-64 p-4 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100 font-mono text-sm resize-none"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.supportedFormats}
                </p>
              </div>

              {/* Import Results */}
              {importResults.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Import Results</Label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {importResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.status === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {result.username}
                          </span>
                          <Badge
                            variant={result.status === 'success' ? 'default' : 'destructive'}
                            className={result.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}
                          >
                            {result.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {result.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowBulkImportDialog(false)
                  setBulkImportData("")
                  setImportResults([])
                }} 
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-lg"
              >
                {t.cancel}
              </Button>
              <Button 
                onClick={handleBulkImport}
                disabled={isImporting || !bulkImportData.trim()}
                style={{
                  background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[700]})`
                }}
                className="hover:shadow-3xl transition-all duration-500 transform hover:scale-110 active:scale-95 hover:-translate-y-1 text-white shadow-2xl"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {t.importFromFile}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>



        </div>
      </div>

      {/* Enhanced Filters */}
      <Card className="bg-gradient-to-br from-white/95 via-slate-50/50 to-white/95 backdrop-blur-xl dark:from-slate-800/95 dark:via-slate-700/50 dark:to-slate-800/95 shadow-2xl rounded-2xl border-0 overflow-hidden animate-admin-card hover:shadow-3xl transition-all duration-700 transform hover:scale-[1.01] premium-hover" style={{ animationDelay: "0.1s" }}>
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-600">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200">
            <Filter className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
            {t.filtersAndSearch}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-slate-700 dark:text-white font-medium">{t.searchPlaceholder}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <Input
                  id="search"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-filter" className="text-slate-700 dark:text-white font-medium">{t.roles}</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90 shadow-lg hover:shadow-xl transition-all duration-300 text-slate-700 dark:text-white">
                  <SelectValue className="text-slate-700 dark:text-white" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allRoles}</SelectItem>
                  {getRoleColors(themeColors).map((role: any) => (
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
              <Label htmlFor="status-filter" className="text-slate-700 dark:text-white font-medium">{t.status}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90 shadow-lg hover:shadow-xl transition-all duration-300 text-slate-700 dark:text-white">
                  <SelectValue className="text-slate-700 dark:text-white" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allStatuses}</SelectItem>
                  <SelectItem value="active">{t.active}</SelectItem>
                  <SelectItem value="inactive">{t.inactive}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort-by" className="text-slate-700 dark:text-white font-medium">Trier par</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90 shadow-lg hover:shadow-xl transition-all duration-300 text-slate-700 dark:text-white">
                  <SelectValue className="text-slate-700 dark:text-white" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{t.sortByName}</SelectItem>
                  <SelectItem value="email">{t.sortByEmail}</SelectItem>
                  <SelectItem value="createdAt">{t.sortByCreationDate}</SelectItem>
                  <SelectItem value="lastLogin">{t.sortByLastLogin}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Users Table */}
      <Card className="bg-gradient-to-br from-white/95 via-slate-50/50 to-white/95 backdrop-blur-xl dark:from-slate-800/95 dark:via-slate-700/50 dark:to-slate-800/95 shadow-2xl rounded-2xl border-0 overflow-hidden animate-admin-card hover:shadow-3xl transition-all duration-700 transform hover:scale-[1.01] premium-hover" style={{ animationDelay: "0.2s" }}>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-600">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6" style={{ color: themeColors.colors.primary[600] }} />
              <span className="text-2xl font-bold text-slate-800 dark:text-white">
                Utilisateurs ({filteredAndSortedUsers.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-300 text-slate-700 dark:text-slate-200"
              >
                {sortOrder === "asc" ? "↑" : "↓"} {sortBy}
              </Button>
            </div>
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-lg">
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
                  <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-600">
                    <TableHead className="text-slate-700 dark:text-white font-semibold text-base py-4">{t.users}</TableHead>
                    <TableHead className="text-slate-700 dark:text-white font-semibold text-base py-4">{t.contact}</TableHead>
                    <TableHead className="text-slate-700 dark:text-white font-semibold text-base py-4">{t.roles}</TableHead>
                    <TableHead className="text-slate-700 dark:text-white font-semibold text-base py-4">{t.status}</TableHead>
                    <TableHead className="text-slate-700 dark:text-white font-semibold text-base py-4 text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.map((user, index) => (
                                         <TableRow 
                       key={user.id}
                       className={`hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-${themeColors.colors.primary[50]}/80 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 transition-all duration-300 animate-fade-in border-b border-slate-200/50 dark:border-slate-700/50 transform hover:scale-[1.01] shadow-md hover:shadow-lg`}
                       style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                     >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-lg border-2 transition-all duration-500 transform hover:scale-110 hover:rotate-3 group-hover:shadow-xl`} 
                            style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[700]}, ${themeColors.colors.primary[800]})`, borderColor: themeColors.colors.primary[400]}}
                            title={`Roles: ${user.roles.join(', ')}`}
                          >
                            <span className="transition-transform duration-500 group-hover:scale-110">{user.firstName?.charAt(0) || user.username?.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-800 dark:text-white">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1">
                              <User className="h-3 w-3" />
                              @{user.username}
                            </div>
                            {user.department && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {user.department}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                                             <TableCell>
                         <div className="space-y-1">
                           <div className="flex items-center gap-2 text-sm">
                             <Mail className="h-3 w-3" style={{ color: themeColors.colors.primary[600] }} />
                             <span className="truncate max-w-[200px] text-slate-800 dark:text-white" title={user.email}>
                               {user.email}
                             </span>
                             {user.emailVerified && (
                               <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs px-1.5 py-0.5 flex items-center gap-1">
                                 <CheckCircle className="h-2.5 w-2.5" />
                                 {t.verified}
                               </Badge>
                             )}
                             {!user.emailVerified && (
                               <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs px-1.5 py-0.5 flex items-center gap-1">
                                 <XCircle className="h-2.5 w-2.5" />
                                 {t.notVerified}
                               </Badge>
                             )}
                           </div>
                           {user.googleSSO && (
                             <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md shadow-sm transition-all duration-300 hover:shadow-md w-fit" style={{
                               background: `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`,
                               border: `1px solid ${themeColors.colors.primary[300]}`
                             }}>
                               <Globe className="h-3 w-3" style={{ color: themeColors.colors.primary[600] }} />
                               <span className="text-xs font-medium" style={{ color: themeColors.colors.primary[700] }}>Google SSO</span>
                             </div>
                           )}
                         </div>
                       </TableCell>
                                             <TableCell>
                         <div className="flex flex-wrap gap-1">
                           {/* Show filtered roles only */}
                           {getFilteredRoles(user.roles).map((role) => {
                             const roleConfig = getRoleDisplay(role)
                             if (!roleConfig) return null // Skip null roles
                             const Icon = roleConfig.icon
                             return (
                               <Badge 
                                 key={role} 
                                 variant="secondary" 
                                 className={`${roleConfig.color} flex items-center gap-1 text-xs px-3 py-1.5 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
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
                          className={`${user.enabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'} flex items-center gap-1 w-fit px-2 py-1`}
                        >
                          {user.enabled ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                          {user.enabled ? t.active : t.inactive}
                        </Badge>
                      </TableCell>

                                             <TableCell>
                         <div className="flex items-center gap-2 justify-end">
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => {
                               const userFromList = users.find(u => u.keycloakId === user.keycloakId || u.email === user.email);
                               setSelectedUser(userFromList || user);
                               setShowViewDialog(true);
                             }}
                             className="h-8 w-8 p-0 bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 dark:from-blue-900/20 dark:to-indigo-800/20 dark:hover:from-blue-800/30 dark:hover:to-indigo-700/30 hover:text-blue-700 dark:text-white dark:hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                             title={t.view}
                           >
                             <Eye className="h-4 w-4" />
                           </Button>
                           
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => {
                               setSelectedUser(user)
                               setShowEditDialog(true)
                             }}
                             className="h-8 w-8 p-0 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 dark:from-slate-900/20 dark:to-slate-800/20 dark:hover:from-slate-800/30 dark:hover:to-slate-700/30 hover:text-slate-700 dark:text-white dark:hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                             title={t.edit}
                           >
                             <Edit className="h-4 w-4" />
                           </Button>
                           
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => toggleUserStatus(user.id, user.enabled)}
                             className={`h-8 w-8 p-0 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg dark:text-white dark:hover:text-white ${
                               user.enabled 
                                 ? `bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:hover:from-red-800/30 dark:hover:to-red-700/30 hover:text-red-700` 
                                 : `bg-gradient-to-br from-emerald-50 to-green-100 hover:from-emerald-100 hover:to-green-200 dark:from-emerald-900/20 dark:to-green-800/20 dark:hover:from-emerald-800/30 dark:hover:to-green-700/30 hover:text-emerald-700`
                             }`}
                             title={user.enabled ? t.disableAccount : t.enableAccount}
                           >
                             {user.enabled ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                           </Button>
                           
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                               <Button 
                                 variant="ghost" 
                                 size="sm"
                                 className="h-8 w-8 p-0 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 dark:hover:from-orange-800/30 dark:hover:to-orange-700/30 hover:text-orange-700 dark:text-white dark:hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                                 title={t.resetPassword}
                               >
                                 <Key className="h-4 w-4" />
                               </Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
                               <AlertDialogHeader>
                                 <AlertDialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                                   <Key className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                   {t.resetPassword}
                                 </AlertDialogTitle>
                                 <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                                   {t.resetPasswordConfirm} <strong className="text-slate-900 dark:text-white">{user.firstName} {user.lastName}</strong> ?
                                 </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                 <AlertDialogCancel className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
                                   {t.cancel}
                                 </AlertDialogCancel>
                                 <AlertDialogAction
                                   onClick={() => resetUserPassword(user.id, `${user.firstName} ${user.lastName}`)}
                                   className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                                 >
                                   <Key className="h-4 w-4 mr-2" />
                                   {t.resetPassword}
                                 </AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                           </AlertDialog>
                           
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                               <Button 
                                 variant="ghost" 
                                 size="sm"
                                 className="h-8 w-8 p-0 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:hover:from-red-800/30 dark:hover:to-red-700/30 hover:text-red-700 dark:text-white dark:hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                                 title={t.delete}
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                  {t.deleteUser}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                                  {t.deleteUserConfirm} <strong className="text-slate-900 dark:text-white">{user.firstName} {user.lastName}</strong> ? 
                                  {t.deleteUserWarning}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
                                  {t.cancel}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(user.id)}
                                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t.deletePermanently}
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">{t.editUserTitle}</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {t.editUserDescription}
            </DialogDescription>
          </DialogHeader>
                     {selectedUser && (
             <div className="grid gap-4 py-4">
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="edit-firstName" className="text-right text-slate-700 dark:text-slate-300">{t.firstName} *</Label>
                 <div className="col-span-3 space-y-1">
                 <Input
                   id="edit-firstName"
                   value={selectedUser.firstName}
                     onChange={(e) => {
                       setSelectedUser({...selectedUser, firstName: e.target.value})
                       if (validationErrors.firstName) {
                         setValidationErrors({...validationErrors, firstName: ""})
                       }
                     }}
                     className={`bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md text-slate-900 dark:text-slate-100 ${
                       validationErrors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                     }`}
                   />
                   {validationErrors.firstName && (
                     <div className="flex items-center gap-1 text-red-500 text-xs">
                       <AlertCircle className="h-3 w-3" />
                       {validationErrors.firstName}
                     </div>
                   )}
                 </div>
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="edit-lastName" className="text-right text-slate-700 dark:text-slate-300">{t.lastName} *</Label>
                 <div className="col-span-3 space-y-1">
                 <Input
                   id="edit-lastName"
                   value={selectedUser.lastName}
                     onChange={(e) => {
                       setSelectedUser({...selectedUser, lastName: e.target.value})
                       if (validationErrors.lastName) {
                         setValidationErrors({...validationErrors, lastName: ""})
                       }
                     }}
                     className={`bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md text-slate-900 dark:text-slate-100 ${
                       validationErrors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                     }`}
                   />
                   {validationErrors.lastName && (
                     <div className="flex items-center gap-1 text-red-500 text-xs">
                       <AlertCircle className="h-3 w-3" />
                       {validationErrors.lastName}
                     </div>
                   )}
                 </div>
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="edit-email" className="text-right text-slate-700 dark:text-slate-300">{t.email} *</Label>
                 <div className="col-span-3 space-y-1">
                 <Input
                   id="edit-email"
                   type="email"
                   value={selectedUser.email}
                     onChange={(e) => {
                       setSelectedUser({...selectedUser, email: e.target.value})
                       if (validationErrors.email) {
                         setValidationErrors({...validationErrors, email: ""})
                       }
                     }}
                     className={`bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100 ${
                       validationErrors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                     }`}
                     placeholder={t.emailPlaceholder}
                   />
                   {validationErrors.email && (
                     <div className="flex items-center gap-1 text-red-500 text-xs">
                       <AlertCircle className="h-3 w-3" />
                       {validationErrors.email}
                     </div>
                   )}
                 </div>
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="edit-gender" className="text-right text-slate-700 dark:text-slate-300">{t.gender} *</Label>
                 <Select
                   value={selectedUser.gender || ""}
                   onValueChange={(value) => setSelectedUser({...selectedUser, gender: value})}
                 >
                   <SelectTrigger className="col-span-3 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100">
                     <SelectValue placeholder={`Ex: ${t.male}, ${t.female}`} />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="MALE">{t.male}</SelectItem>
                     <SelectItem value="FEMALE">{t.female}</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="edit-birthDate" className="text-right text-slate-700 dark:text-slate-300">{t.birthDate} *</Label>
                 <div className="col-span-3">
                   <CustomDatePicker
                   value={selectedUser.birthDate ? selectedUser.birthDate.split('T')[0] : ""}
                     onChange={(date) => setSelectedUser({...selectedUser, birthDate: date})}
                     isOpen={showBirthDatePicker}
                     onToggle={() => setShowBirthDatePicker(!showBirthDatePicker)}
                     placeholder="Select birth date"
                   />
                 </div>
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="edit-address" className="text-right text-slate-700 dark:text-slate-300">{t.address} *</Label>
                                    <Input
                     id="edit-address"
                     value={selectedUser.address || ""}
                     onChange={(e) => setSelectedUser({...selectedUser, address: e.target.value})}
                     className="col-span-3 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                     placeholder={t.addressPlaceholder}
                   />
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="edit-company" className="text-right text-slate-700 dark:text-slate-300">{t.company} *</Label>
                                    <Input
                     id="edit-company"
                     value={selectedUser.company || ""}
                     onChange={(e) => setSelectedUser({...selectedUser, company: e.target.value})}
                     className="col-span-3 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                     placeholder={t.companyPlaceholder}
                   />
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="edit-hireDate" className="text-right text-slate-700 dark:text-slate-300">{t.hireDate} *</Label>
                 <div className="col-span-3">
                   <CustomDatePicker
                   value={selectedUser.hireDate ? selectedUser.hireDate.split('T')[0] : ""}
                     onChange={(date) => setSelectedUser({...selectedUser, hireDate: date})}
                     isOpen={showHireDatePicker}
                     onToggle={() => setShowHireDatePicker(!showHireDatePicker)}
                     placeholder="Select hire date"
                   />
                 </div>
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="edit-profession" className="text-right text-slate-700 dark:text-slate-300">{t.profession} *</Label>
                                    <Input
                     id="edit-profession"
                     value={selectedUser.profession || ""}
                     onChange={(e) => setSelectedUser({...selectedUser, profession: e.target.value})}
                     className="col-span-3 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                     placeholder={t.professionPlaceholder}
                   />
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="edit-phoneNumber" className="text-right text-slate-700 dark:text-slate-300">{t.phoneNumber}</Label>
                 <Input
                   id="edit-phoneNumber"
                   value={selectedUser.phoneNumber || ""}
                   onChange={(e) => setSelectedUser({...selectedUser, phoneNumber: e.target.value})}
                   className="col-span-3 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                   placeholder="Ex: +33 1 23 45 67 89"
                 />
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="edit-department" className="text-right text-slate-700 dark:text-slate-300">{t.department}</Label>
                 <Input
                   id="edit-department"
                   value={selectedUser.department || ""}
                   onChange={(e) => setSelectedUser({...selectedUser, department: e.target.value})}
                   className="col-span-3 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                   placeholder="Ex: RH, IT, Marketing, Production..."
                 />
               </div>

               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="edit-matriculeNumber" className="text-right text-slate-700 dark:text-slate-300">{t.matriculeNumber}</Label>
                 <div className="col-span-3 space-y-1">
                   <Input
                     id="edit-matriculeNumber"
                     value={selectedUser.matriculeNumber || ""}
                     onChange={(e) => {
                       setSelectedUser({...selectedUser, matriculeNumber: e.target.value})
                       if (validationErrors.matriculeNumber) {
                         setValidationErrors({...validationErrors, matriculeNumber: ""})
                       }
                     }}
                     className={`bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-slate-500 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100 ${
                       validationErrors.matriculeNumber ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                     }`}
                     placeholder="Ex: MAT-1234567890"
                   />
                   {validationErrors.matriculeNumber && (
                     <div className="flex items-center gap-1 text-red-500 text-xs">
                       <AlertCircle className="h-3 w-3" />
                       {validationErrors.matriculeNumber}
                     </div>
                   )}
                 </div>
               </div>

               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="edit-roles" className="text-right text-slate-700 dark:text-slate-300">Rôle spécifique</Label>
                                    <Select
                     value={selectedUser.roles.find(role => role !== "SALARIE") || "EMPLOYEE"}
                     onValueChange={(value) => handleRoleSelection([value], false)}
                   >
                   <SelectTrigger className="col-span-3 border-slate-300 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90 shadow-lg hover:shadow-xl transition-all duration-300 text-slate-900 dark:text-slate-100">
                     <SelectValue placeholder={t.selectRole} />
                   </SelectTrigger>
                                        <SelectContent>
                       <SelectItem value="EMPLOYEE">
                         <div className="flex items-center gap-2">
                           <User className="h-4 w-4" />
                           {t.employeeRole}
                         </div>
                       </SelectItem>
                       {getRoleColors(themeColors).filter((role: any) => role.value !== "EMPLOYEE" && role.value !== "SALARIE").map((role: any) => (
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
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-lg transition-all duration-300 hover:shadow-xl">
              Annuler
            </Button>
            <Button 
              onClick={updateUser} 
              style={{
                background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[700]})`
              }}
              className="hover:shadow-3xl transition-all duration-500 transform hover:scale-110 active:scale-95 hover:-translate-y-1 text-white shadow-2xl"
            >
              {t.update}
            </Button>
          </DialogFooter>
                 </DialogContent>
       </Dialog>

       {/* View User Dialog */}
       <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
         <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
           <DialogHeader>
             <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">{t.viewUserTitle}</DialogTitle>
             <DialogDescription className="text-slate-600 dark:text-slate-400">
               {t.viewUserDescription}
             </DialogDescription>
           </DialogHeader>
           
           {selectedUser && (
             <div className="space-y-6 py-4">
               {/* Basic Information */}
               <div className="modal-section-subtle-border rounded-xl p-6 relative overflow-hidden shadow-lg">
                 <div className="absolute inset-0 opacity-20 dark:opacity-0" style={{
                   background: `linear-gradient(135deg, ${themeColors.colors.primary[300]}, ${themeColors.colors.primary[400]})`
                 }}></div>
                 <div className="relative z-10 dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-600 dark:rounded-xl dark:p-6">
                   <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                     <User className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
                     {t.basicInfo}
                   </h3>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.fullName}</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.username}</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">@{selectedUser.username}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedUser.email}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Statut</Label>
                       <Badge 
                         variant={selectedUser.enabled ? "default" : "destructive"}
                         className={`${selectedUser.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'} flex items-center gap-1 w-fit`}
                       >
                         {selectedUser.enabled ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                         {selectedUser.enabled ? "Actif" : "Inactif"}
                       </Badge>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.connectionMethod}</Label>
                       <div className="flex items-center gap-2">
                         {selectedUser.googleSSO ? (
                           <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1">
                             <Globe className="h-3 w-3" />
                             Google SSO
                           </Badge>
                         ) : (
                           <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300 flex items-center gap-1">
                             <Key className="h-3 w-3" />
                             Keycloak
                           </Badge>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Personal Information */}
               <div className="modal-section-subtle-border rounded-xl p-6 relative overflow-hidden shadow-lg">
                 <div className="absolute inset-0 opacity-20 dark:opacity-0" style={{
                   background: `linear-gradient(135deg, ${themeColors.colors.primary[300]}, ${themeColors.colors.primary[400]})`
                 }}></div>
                 <div className="relative z-10 dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-600 dark:rounded-xl dark:p-6">
                   <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                     <UserCheck className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
                     {t.personalInfo}
                   </h3>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Sexe</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">
                         {selectedUser.gender ? translateGender(selectedUser.gender, language) : t.notSpecified}
                       </p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date de naissance</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">
                         {selectedUser.birthDate ? new Date(selectedUser.birthDate).toLocaleDateString('fr-FR') : t.notSpecified}
                       </p>
                     </div>
                     <div className="col-span-2">
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Adresse</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedUser.address || t.notSpecified}</p>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Authentication Information */}
               <div className="modal-section-subtle-border rounded-xl p-6 relative overflow-hidden shadow-lg">
                 <div className="absolute inset-0 opacity-20 dark:opacity-0" style={{
                   background: `linear-gradient(135deg, ${themeColors.colors.primary[300]}, ${themeColors.colors.primary[400]})`
                 }}></div>
                 <div className="relative z-10 dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-600 dark:rounded-xl dark:p-6">
                   <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                     <Shield className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
                     {t.authInfo}
                   </h3>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.emailVerified}</Label>
                       <Badge 
                         variant={selectedUser.emailVerified ? "default" : "destructive"}
                         className={`${selectedUser.emailVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'} flex items-center gap-1 w-fit`}
                       >
                         {selectedUser.emailVerified ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                         {selectedUser.emailVerified ? t.verified : t.notVerified}
                       </Badge>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Dernière connexion</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">
                         {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString('fr-FR') : "Jamais connecté"}
                       </p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.creationDate}</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">
                         {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}
                       </p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.keycloakId}</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium text-xs font-mono">{selectedUser.keycloakId || t.notGenerated}</p>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Professional Information */}
               <div className="modal-section-subtle-border rounded-xl p-6 relative overflow-hidden shadow-lg">
                 <div className="absolute inset-0 opacity-20 dark:opacity-0" style={{
                   background: `linear-gradient(135deg, ${themeColors.colors.primary[300]}, ${themeColors.colors.primary[400]})`
                 }}></div>
                 <div className="relative z-10 dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-600 dark:rounded-xl dark:p-6">
                   <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                     <Briefcase className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
                     {t.professionalInfo}
                   </h3>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.company}</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedUser.company || t.notSpecified}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.hireDate}</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">
                         {selectedUser.hireDate ? new Date(selectedUser.hireDate).toLocaleDateString('fr-FR') : t.notSpecified}
                       </p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.profession}</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedUser.profession || t.notSpecified}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.department}</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedUser.department || t.notSpecified}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.phoneNumber}</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedUser.phoneNumber || t.notSpecified}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.dossierNumber}</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedUser.dossierNumber || t.notGenerated}</p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.matriculeNumber}</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedUser.matriculeNumber || t.notGenerated}</p>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Roles and Permissions */}
               <div className="modal-section-subtle-border rounded-xl p-6 relative overflow-hidden shadow-lg">
                 <div className="absolute inset-0 opacity-20 dark:opacity-0" style={{
                   background: `linear-gradient(135deg, ${themeColors.colors.primary[300]}, ${themeColors.colors.primary[400]})`
                 }}></div>
                 <div className="relative z-10 dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-600 dark:rounded-xl dark:p-6">
                   <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                     <Shield className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
                     {t.rolesAndPermissions}
                   </h3>
                   <div className="space-y-3">
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.assignedRoles}</Label>
                       <div className="flex flex-wrap gap-2 mt-2">
                         {getFilteredRoles(selectedUser.roles).map((role) => {
                           const roleConfig = getRoleDisplay(role)
                           if (!roleConfig) return null // Skip null roles
                           const Icon = roleConfig.icon
                           return (
                             <Badge 
                               key={role} 
                               variant="secondary" 
                               className={`${roleConfig.color} flex items-center gap-1`}
                             >
                               <Icon className="h-3 w-3" />
                               {roleConfig.label}
                             </Badge>
                           )
                         })}
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.emailVerified}</Label>
                         <Badge 
                           variant={selectedUser.emailVerified ? "default" : "destructive"}
                           className={`${selectedUser.emailVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'} flex items-center gap-1 w-fit`}
                         >
                           {selectedUser.emailVerified ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                           {selectedUser.emailVerified ? t.verified : t.notVerified}
                         </Badge>
                       </div>
                       <div>
                         <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.ssoGoogle}</Label>
                         <div className="flex items-center gap-2 mt-2">
                           {selectedUser.googleSSO ? (
                             <div className="flex items-center gap-1.5 px-2 py-1 rounded-md shadow-sm transition-all duration-300 hover:shadow-md w-fit" style={{
                               background: `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`,
                               border: `1px solid ${themeColors.colors.primary[300]}`
                             }}>
                               <Globe className="h-3 w-3" style={{ color: themeColors.colors.primary[600] }} />
                               <span className="text-xs font-medium" style={{ color: themeColors.colors.primary[700] }}>{t.connected}</span>
                             </div>
                           ) : (
                             <div className="flex items-center gap-1.5 px-2 py-1 rounded-md shadow-sm transition-all duration-300 hover:shadow-md w-fit bg-slate-100 border border-slate-300">
                               <User className="h-3 w-3 text-slate-600" />
                               <span className="text-xs font-medium text-slate-700">{t.standard}</span>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Activity Information */}
               <div className="modal-section-subtle-border rounded-xl p-6 relative overflow-hidden shadow-lg">
                 <div className="absolute inset-0 opacity-20 dark:opacity-0" style={{
                   background: `linear-gradient(135deg, ${themeColors.colors.primary[300]}, ${themeColors.colors.primary[400]})`
                 }}></div>
                 <div className="relative z-10 dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-600 dark:rounded-xl dark:p-6">
                   <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                     <Activity className="h-5 w-5" style={{ color: themeColors.colors.primary[600] }} />
                     {t.activityAndHistory}
                   </h3>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.lastConnection}</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">
                         {(() => {
                           const lastLogin = selectedUser.lastLogin
                           
                           if (lastLogin) {
                             try {
                               return new Date(lastLogin).toLocaleString('fr-FR')
                             } catch (error) {
                               return "Format de date invalide"
                             }
                           } else {
                             return t.neverConnected
                           }
                         })()}
                       </p>
                     </div>
                     <div>
                       <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.creationDate}</Label>
                       <p className="text-slate-800 dark:text-slate-200 font-medium">
                         {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           )}
           
           <DialogFooter>
             <Button 
               variant="outline" 
               onClick={() => setShowViewDialog(false)}
               className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-lg transition-all duration-300 hover:shadow-xl"
             >
               {t.cancel}
             </Button>
             <Button 
               variant="outline" 
               onClick={() => {
                 if (selectedUser) {
                   // Refresh the user data
                   const refreshUserData = async () => {
                     try {
                       const response = await fetch(`/api/v1/admin/keycloak/users/${selectedUser.keycloakId}/profile`, {
                         headers: {
                           'Authorization': `Bearer ${accessToken}`,
                           'Content-Type': 'application/json'
                         }
                       })
                       
                       if (response.ok) {
                         const result = await response.json()
                         if (result.success && result.profile) {
                           const updatedUser = {
                             ...selectedUser,
                             ...result.profile
                           }
                           setSelectedUser(updatedUser)
                           toast.success("Données utilisateur actualisées")
                         }
                       }
                     } catch (error) {
                       console.warn("Could not refresh user data:", error)
                       toast.error("Erreur lors de l'actualisation")
                     }
                   }
                   
                   refreshUserData()
                 }
               }}
               className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-lg transition-all duration-300 hover:shadow-xl"
             >
               <RefreshCw className="h-4 w-4 mr-2" />
               Actualiser
             </Button>
             <Button 
               onClick={() => {
                 setShowViewDialog(false)
                 setShowEditDialog(true)
               }}
               style={{
                 background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[700]})`
               }}
               className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-white shadow-lg"
             >
               <Edit className="h-4 w-4 mr-2" />
               {t.edit}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
       </div>
     </div>
   )
 } 