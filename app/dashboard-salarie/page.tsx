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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EnhancedCalendar } from "@/components/enhanced-calendar"
import { EnhancedTimePicker } from "@/components/enhanced-time-picker"
import {
  LogOut,
  User,
  Globe,
  Briefcase,
  FileText,
  Calendar,
  Shield,
  Activity,
  CalendarCheck,
  ChevronDown,
  Stethoscope,
  Clock,
  XCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { MedicalVisitStatus } from "@/components/medical-visit-status"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { medicalVisitAPI, MedicalVisitRequest } from "@/lib/api"

export default function DashboardSalarie() {
  const { user, logout, loading } = useAuth()
  const { t } = useTranslation()
  const { themeColors, isDark } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  const [language, setLanguage] = useState<"en" | "fr">("fr")
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [proposalData, setProposalData] = useState({
    date: null as Date | null,
    time: "",
    reason: ""
  })
  
  // Medical visit request state
  const [currentRequest, setCurrentRequest] = useState<MedicalVisitRequest | null>(null)
  const [allRequests, setAllRequests] = useState<MedicalVisitRequest[]>([])
  const [loadingRequest, setLoadingRequest] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Add loading state
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  // Helper function to get theme color
  const getThemeColor = (shade: keyof typeof themeColors.colors.primary) => themeColors.colors.primary[shade]

  // Helper function to get employee ID from user
  const getEmployeeId = async () => {
    // Debug: Log the current user information
    console.log("Current user:", user)
    console.log("Username:", user?.username)
    console.log("Email:", user?.email)
    
    try {
      // Try to get employee ID from backend first
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/v1/medical-visits/current-user/employee`, {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('oshapp_tokens') || '{}').access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("Backend employee data:", data)
        if (data.employeeId) {
          console.log("Found employee ID from backend:", data.employeeId)
          return data.employeeId
        }
      }
    } catch (error) {
      console.log("Could not get employee ID from backend, using fallback mapping")
    }
    
    // Fallback to email mapping if backend call fails
    const emailToEmployeeId: { [key: string]: number } = {
      'battlehuma1@gmail.com': 1,  // Try ID 1 first
      'admin@example.com': 1,      // Admin
      'rh@example.com': 2,         // RH
      'infirmier@example.com': 3,  // Infirmier
      'medecin@example.com': 4,    // Medecin
      'hse@example.com': 5,        // HSE
      'salarie@example.com': 6,    // Salarie
    }
    
    // Try to get employee ID from email first
    if (user?.email && emailToEmployeeId[user.email]) {
      console.log("Found employee ID from email mapping:", emailToEmployeeId[user.email])
      return emailToEmployeeId[user.email]
    }
    
    // Fallback to username mapping
    if (user?.username === 'badrmed') return 1  // Try ID 1 for badrmed
    if (user?.username === 'admin') return 1
    
    // Default fallback - this might be wrong!
    console.warn("Could not determine employee ID for user:", user?.email || user?.username, "Using default ID 1")
    return 1
  }

  // Filter out cancelled requests
  const activeRequests = allRequests.filter(request => request.status !== 'CANCELLED')

  // Find the latest proposal's proposer
  const latestProposalProposer = currentRequest && currentRequest.previousProposals && currentRequest.previousProposals.length > 0
    ? currentRequest.previousProposals[currentRequest.previousProposals.length - 1].proposedBy
    : null;

  // Determine if the current user can propose a new slot
  const canPropose = user && currentRequest && (
    // Only allow if the latest proposal is NOT by the current user and status is not CONFIRMED
    (!latestProposalProposer || latestProposalProposer !== user.username) && currentRequest.status !== "CONFIRMED"
  );


  // Function to load user requests
  const loadUserRequests = async () => {
    if (!user) return
    
    setLoadingRequest(true)
    try {
      const employeeId = await getEmployeeId()
      const response = await medicalVisitAPI.getEmployeeRequests(employeeId)
      
      // Get all requests
      if (response.data.length > 0) {
        setAllRequests(response.data)
        // Set the most recent request as current
        const latestRequest = response.data[0] // Assuming they're sorted by creation date
        setCurrentRequest(latestRequest)
      } else {
        // No requests found
        setAllRequests([])
        setCurrentRequest(null)
      }
      setApiError(null)
    } catch (error: any) {
      console.error("Error loading user requests:", error)
      
      // Check if it's a timeout or connection error
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.message?.includes('Network Error')) {
        const errorMessage = "Le serveur backend n'est pas accessible."
        console.warn(errorMessage)
        setApiError(errorMessage)
        setAllRequests([])
        setCurrentRequest(null)
        return
      }
      
      // Check for authentication errors
      if (error.response?.status === 401) {
        const errorMessage = "Erreur d'authentification. Vérifiez que Keycloak est démarré sur le port 8080 et que votre session est valide."
        console.warn(errorMessage)
        setApiError(errorMessage)
        setAllRequests([])
        setCurrentRequest(null)
        return
      }
      
      // Provide more specific error messages
      let errorMessage = "Le serveur backend n'est pas disponible. Affichage des données de démonstration."
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = "Erreur de connexion au serveur backend. Vérifiez que le serveur est démarré sur le port 8081. Affichage des données de démonstration."
      } else if (error.response?.status === 500) {
        // Check for CORS configuration error
        const errorData = error.response?.data;
        if (errorData?.message && errorData.message.includes('allowCredentials')) {
          errorMessage = "Erreur de configuration CORS côté serveur. Le serveur backend a été mis à jour pour corriger ce problème. Affichage des données de démonstration."
        } else {
          errorMessage = "Erreur interne du serveur (500). Affichage des données de démonstration."
        }
      } else if (error.response?.status === 403) {
        errorMessage = "Accès refusé. Vérifiez vos permissions. Affichage des données de démonstration."
      } else if (error.response?.status === 401) {
        errorMessage = "Erreur d'authentification. Le token JWT a peut-être expiré ou Keycloak n'est pas accessible. Veuillez vous reconnecter. Affichage des données de démonstration."
      }
      
      console.warn(errorMessage)
      setApiError(errorMessage)
      setAllRequests([])
      setCurrentRequest(null)
    } finally {
      setLoadingRequest(false)
    }
  }



  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    } else if (!loading && user && !user.roles.includes("SALARIE")) {
      router.replace("/403")
    }
  }, [user, loading, router])

  // Load current user's medical visit requests
  useEffect(() => {
    loadUserRequests()
  }, [user])
  if (loading) return null;
  if (!user || !user.roles.includes("SALARIE")) {
    return null;
  }

  const responsibilities = [
    {
      icon: Stethoscope,
      text: "Visite Médicale",
      color: `from-${themeColors.colors.primary[600]} to-${themeColors.colors.primary[800]}`,
    },
  ]



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950">
      {/* Navigation */}
      <DashboardNavigation userRole={user.roles[0]} currentPage="dashboard" />
      
      {/* API Error Notification */}
      {apiError && (
        <div className="max-w-2xl mx-auto mb-6 mt-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 shadow-lg animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  Mode démonstration
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {apiError}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
        {/* New Proposal Notification */}
        {currentRequest && currentRequest.status === "PROPOSED" && (
          <div className="max-w-2xl mx-auto mb-6">
            <div 
              className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4 shadow-lg animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                    Nouvelle proposition de créneau
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                    Le service médical vous a proposé un nouveau créneau pour votre visite médicale.
                  </p>
                  {/* Removed Confirmer and Proposer un autre créneau buttons from here */}
                </div>
              </div>
            </div>
          </div>
        )}

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
                  <Briefcase className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg mb-2">{t("Bienvenue sur votre espace")}</h1>
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5 text-white/80" />
                  <span className="text-lg font-semibold text-white/90">{t("Salarié")}</span>
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

            {/* Medical Visit Requests */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <div 
                  className="h-5 w-5 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`
                  }}
                >
                  <Stethoscope className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Mes demandes de visite médicale</h2>
              </div>
              
              {loadingRequest ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
                  <span className="ml-2 text-slate-600">Chargement...</span>
                </div>
                             ) : activeRequests.length > 0 ? (
                  <div className="space-y-4">
                    {activeRequests.map((request, index) => (
                      <div key={request.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`border-2 ${
                                request.status === "PENDING" ? "border-slate-500 text-slate-700 dark:text-slate-400" :
                                request.status === "PROPOSED" ? "border-orange-500 text-orange-700 dark:text-orange-400" :
                                request.status === "CONFIRMED" ? "border-green-500 text-green-700 dark:text-green-400" :
                                "border-gray-500 text-gray-700 dark:text-gray-400"
                              }`}
                            >
                              {request.status}
                            </Badge>
                            {/* Visit type badge */}
                            {request.visitType && (
                              <span className="ml-1">
                                {/* lightweight inline badge to avoid heavy imports */}
                                <span className="text-xs px-2 py-0.5 border rounded-md text-slate-700 dark:text-slate-300 border-slate-300">
                                  {request.visitType}
                                </span>
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-slate-500">
                            {format(new Date(request.createdAt), "dd/MM/yyyy", { locale: fr })}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {request.motif}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(request.dateSouhaitee), "dd/MM/yyyy", { locale: fr })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {request.heureSouhaitee}
                            </span>
                            {request.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Échéance {format(new Date(request.dueDate), "dd/MM/yyyy", { locale: fr })}
                              </span>
                            )}
                          </div>
                          {request.notes && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {request.notes}
                            </p>
                          )}
                        </div>
                        
                        {/* Action buttons for each request */}
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentRequest(request)}
                            className="border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300"
                          >
                            Voir détails
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-slate-600">
                    <Stethoscope className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <p>Aucune demande de visite médicale active</p>
                    <Link href="/demande-visite-medicale">
                      <Button className="mt-4 bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700" style={{
                        boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`
                      }}>
                        Nouvelle demande
                      </Button>
                    </Link>
                  </div>
                )}
            </div>

            {/* Current Request Details */}
            {currentRequest && (
              <div id="current-request-details" className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div 
                    className="h-5 w-5 rounded-lg flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`
                    }}
                  >
                    <Stethoscope className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-orange-600 dark:text-slate-100">Détails de la demande</h2>
                </div>
                <MedicalVisitStatus 
                  request={currentRequest} 
                  onProposeNewSlot={() => setIsDialogOpen(true)}
                  onConfirmRequest={async () => {
                    try {
                      if (!currentRequest?.id) {
                        throw new Error("No request ID found")
                      }
                      
                      console.log("Confirming request:", currentRequest.id)
                      console.log("Current request status:", currentRequest.status)
                      
                      // Call the API to confirm the request
                      const response = await medicalVisitAPI.confirmRequest(currentRequest.id, {
                        confirmedDate: new Date().toISOString().split('T')[0],
                        confirmedTime: currentRequest.proposedTime || "09:00"
                      })
                      
                      console.log("API response:", response.data)
                      
                      // Update the current request with the confirmed data
                      setCurrentRequest(response.data)
                      
                      // Reload all requests to get updated status
                      await loadUserRequests()
                      
                    } catch (error: any) {
                      console.error("Error confirming request:", error)
                      
                      // If backend is not available, simulate the confirmation
                      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.message?.includes('Network Error')) {
                        console.log("Backend not available, simulating confirmation")
                        // Update the request status locally
                        if (currentRequest) {
                          const updatedRequest = {
                            ...currentRequest,
                            status: "CONFIRMED" as const,
                            confirmedDate: currentRequest.proposedDate,
                            confirmedTime: currentRequest.proposedTime
                          }
                          console.log("Updated request:", updatedRequest)
                          setCurrentRequest(updatedRequest)
                        }
                      } else {
                        throw error // Re-throw to show error toast
                      }
                    }
                  }}
                  onResetRequest={async () => {
                    try {
                      const employeeId = await getEmployeeId()
                      
                      // Call the API to delete all requests for this employee
                      await medicalVisitAPI.resetEmployeeRequests(employeeId)
                      
                      // Reload the requests
                      await loadUserRequests()
                      
                      toast({
                        title: "Demandes supprimées",
                        description: "Toutes vos demandes de visite médicale ont été supprimées.",
                        variant: "default",
                      })
                    } catch (error: any) {
                      console.error("Error resetting requests:", error)
                      
                      // If backend is not available, simulate the reset
                      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.message?.includes('Network Error')) {
                        setCurrentRequest(null)
                        setAllRequests([])
                        
                        toast({
                          title: "Demandes réinitialisées (Mode démo)",
                          description: "Le serveur n'est pas accessible. Les demandes ont été réinitialisées en mode démonstration.",
                          variant: "default",
                        })
                      } else {
                        toast({
                          title: "Erreur",
                          description: "Une erreur est survenue lors de la réinitialisation des demandes.",
                          variant: "destructive",
                        })
                      }
                    }
                  }}
                  showCancelButton={false}
                  showHistory={false}
                />
              </div>
            )}

            {/* Proposal Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-md w-[90vw] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-white">
                    <Clock className="h-5 w-5" style={{ color: getThemeColor(600) }} />
                    Proposer un autre créneau
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400">
                    Proposez une nouvelle date et heure pour votre visite médicale
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Date Selection */}
                  <div className="space-y-3">
                    <Label className="text-slate-900 dark:text-slate-100 font-medium">
                      Nouvelle date souhaitée
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600",
                            !proposalData.date && "text-slate-500 dark:text-slate-400"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {proposalData.date ? (
                            format(proposalData.date, "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-transparent border-0 shadow-none calendar-popover z-[9999]">
                        <EnhancedCalendar
                          selectedDate={proposalData.date}
                          onDateSelect={(date) => setProposalData({ ...proposalData, date })}
                          minDate={new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time Selection */}
                  <div className="space-y-3">
                    <Label className="text-slate-900 dark:text-slate-100 font-medium">
                      Nouvelle heure souhaitée
                    </Label>
                    <EnhancedTimePicker
                      selectedTime={proposalData.time}
                      onTimeSelect={(time) => setProposalData({ ...proposalData, time })}
                      minTime="08:00"
                      maxTime="18:00"
                      interval={30}
                    />
                  </div>

                  {/* Reason (Optional) */}
                  <div className="space-y-3">
                    <Label className="text-slate-900 dark:text-slate-100 font-medium">
                      Raison du changement (optionnel)
                    </Label>
                    <Textarea
                      placeholder="Ex: Créneau plus adapté à mes disponibilités..."
                      value={proposalData.reason}
                      onChange={(e) => setProposalData({ ...proposalData, reason: e.target.value })}
                      className="min-h-[80px] resize-none bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setProposalData({ date: null, time: "", reason: "" })
                        setIsDialogOpen(false)
                      }}
                      className="flex-1 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Annuler
                    </Button>
                    {canPropose && (
                      <Button
                        className={`flex-1 text-white hover:shadow-lg transition-all duration-300 ${isSubmittingProposal ? 'animate-pulse opacity-70' : ''}`}
                        style={{
                          background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`,
                          boxShadow: `0 4px 6px -1px ${getThemeColor(500)}20`
                        }}
                        disabled={isSubmittingProposal}
                        onClick={async () => {
                          if (!proposalData.date || !proposalData.time) {
                            toast({
                              title: "Champs requis",
                              description: "Veuillez sélectionner une date et une heure.",
                              variant: "destructive",
                            })
                            return
                          }
                          setIsSubmittingProposal(true);
                          try {
                            await medicalVisitAPI.proposeSlot(currentRequest.id, {
                              proposedDate: proposalData.date.toISOString().split('T')[0],
                              proposedTime: proposalData.time,
                              reason: proposalData.reason,
                              proposedBy: user?.username || user?.email || "unknown"
                            })
                            toast({
                              title: "Proposition envoyée",
                              description: "Votre nouvelle proposition de créneau a été envoyée au service médical.",
                              variant: "default",
                            })
                            setProposalData({ date: null, time: "", reason: "" })
                            setIsDialogOpen(false)
                            loadUserRequests()
                          } catch (error) {
                            toast({
                              title: "Erreur",
                              description: "La proposition n'a pas pu être envoyée. Veuillez réessayer.",
                              variant: "destructive",
                            })
                            setProposalData({ date: null, time: "", reason: "" })
                            setIsDialogOpen(false)
                          } finally {
                            setIsSubmittingProposal(false);
                          }
                        }}
                      >
                        <Clock className="h-5 w-5 mr-2" />
                        Envoyer
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Services Available */}
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
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("Services disponibles")}</h2>
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
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Demander une visite médicale</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}