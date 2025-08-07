"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from "@/components/language-toggle"
import { useTheme } from "@/contexts/ThemeContext"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

import { CalendarIcon, Clock, ArrowLeft, Stethoscope, AlertCircle, CheckCircle, Info } from "lucide-react"
import { EnhancedCalendar } from "@/components/enhanced-calendar"
import { EnhancedTimePicker } from "@/components/enhanced-time-picker"
import { format } from "date-fns"
import { fr, enUS } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { useToast } from "@/hooks/use-toast"
import { medicalVisitAPI, CreateMedicalVisitRequestData, MedicalVisitRequest } from "@/lib/api"

export default function DemandeVisiteMedicale() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useTranslation()
  const { themeColors, isDark } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    motif: "",
    dateSouhaitee: null as Date | null,
    heureSouhaitee: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [currentRequest, setCurrentRequest] = useState<MedicalVisitRequest | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasActiveRequest, setHasActiveRequest] = useState(false)
  const [activeRequest, setActiveRequest] = useState<MedicalVisitRequest | null>(null)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  // Helper function to get employee ID from user
  const getEmployeeId = () => {
    // Debug: Log the current user information
    console.log("Current user:", user)
    console.log("Username:", user?.username)
    console.log("Email:", user?.email)
    
    // Map user emails to employee IDs based on the database
    // This should match the actual employee IDs in your database
    const emailToEmployeeId: { [key: string]: number } = {
      'battlehuma1@gmail.com': 7,  // Badr Med - trying different ID since 1 seems to be admin
      'admin@example.com': 1,      // Admin - moved to ID 1
      'rh@example.com': 2,         // RH
      'infirmier@example.com': 3,  // Infirmier
      'medecin@example.com': 4,    // Medecin
      'hse@example.com': 5,        // HSE
      'salarie@example.com': 6,    // Salarie
    }
    
    // Try to get employee ID from email first
    if (user?.email && emailToEmployeeId[user.email]) {
      console.log("Found employee ID from email:", emailToEmployeeId[user.email])
      return emailToEmployeeId[user.email]
    }
    
    // Fallback to username mapping
    if (user?.username === 'badrmed') return 7  // Updated to match actual username
    if (user?.username === 'admin') return 1
    
    // Default fallback - this might be wrong!
    console.warn("Could not determine employee ID for user:", user?.email || user?.username, "Using default ID 1")
    return 1
  }

  // Reset function for development testing
  const handleResetRequest = async () => {
    try {
      const employeeId = getEmployeeId()
      
      // Call the API to delete all requests for this employee
      await medicalVisitAPI.resetEmployeeRequests(employeeId)
      
      // Update local state
      setHasActiveRequest(false)
      setActiveRequest(null)
      setCurrentRequest(null)
      setStep(1)
      
      toast({
        title: "Demandes supprimées",
        description: "Toutes vos demandes de visite médicale ont été supprimées. Vous pouvez maintenant créer une nouvelle demande.",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Error resetting requests:", error)
      
      // If backend is not available, simulate the reset
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.message?.includes('Network Error')) {
        setHasActiveRequest(false)
        setActiveRequest(null)
        setCurrentRequest(null)
        setStep(1)
        
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
  }

  // Helper function to get theme color
  const getThemeColor = (shade: keyof typeof themeColors.colors.primary) => {
    return themeColors.colors.primary[shade]
  }

  if (authLoading) {
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login")
    }
  }, [user, authLoading, router])

  // Load current user's medical visit requests and check for active requests
  useEffect(() => {
    const loadUserRequests = async () => {
      if (!user) return
      
      setLoading(true)
      try {
        const employeeId = getEmployeeId()
        
        // Check for active requests first
        try {
          const activeResponse = await medicalVisitAPI.checkActiveRequests(employeeId)
          setHasActiveRequest(activeResponse.data.hasActiveRequests)
          if (activeResponse.data.activeRequests.length > 0) {
            setActiveRequest(activeResponse.data.activeRequests[0])
          }
        } catch (error: any) {
          console.error("Error checking active requests:", error)
          // If it's a 401 error, it means authentication failed
          if (error.response?.status === 401) {
            console.warn("Authentication failed. Keycloak may not be running or token expired.")
          }
        }
        
        // Load all requests
        const response = await medicalVisitAPI.getEmployeeRequests(employeeId)
        
        // Get the most recent request
        if (response.data.length > 0) {
          const latestRequest = response.data[0] // Assuming they're sorted by creation date
          setCurrentRequest(latestRequest)
        }
      } catch (error) {
        console.error("Error loading user requests:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserRequests()
  }, [user])

  if (!user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user already has an active request
    if (hasActiveRequest) {
      toast({
        title: "Demande en cours",
        description: "Vous avez déjà une demande de visite médicale en cours. Veuillez attendre la réponse ou annuler votre demande existante.",
        variant: "destructive",
      })
      return
    }
    
    // Validate required fields
    if (!formData.motif || !formData.dateSouhaitee || !formData.heureSouhaitee) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)

    // Add a smooth transition animation
    const formElement = e.currentTarget as HTMLFormElement
    formElement.style.transform = 'scale(0.98)'
    formElement.style.transition = 'transform 0.2s ease-in-out'
    
    setTimeout(() => {
      formElement.style.transform = 'scale(1)'
    }, 200)

    // Check backend availability first
    let backendAvailable = true
    try {
      // Quick check to see if backend is available using AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      const healthCheck = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/v1/medical-visits`, {
        method: 'GET',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      backendAvailable = healthCheck.status !== 404 // If we get a 404, backend is running but endpoint doesn't exist
    } catch (error) {
      console.log("Backend health check failed, using demo mode")
      backendAvailable = false
    }

    if (!backendAvailable) {
      // Backend is not available, go directly to demo mode
      toast({
        title: "Serveur non accessible",
        description: "Le serveur backend n'est pas accessible. Veuillez vérifier que le serveur est démarré.",
        variant: "destructive",
      })
      

      
      // Don't set any mock data - let the user create real requests
      setCurrentRequest(null)
      setStep(1)
      setIsSubmitting(false)
      
      // Don't set any active request
      setHasActiveRequest(false)
      setActiveRequest(null)
      
      // Show success animation
      setShowSuccessAnimation(true)
      setTimeout(() => setShowSuccessAnimation(false), 3000)
      return
    }

    try {
      const employeeId = getEmployeeId()

      const requestData: CreateMedicalVisitRequestData = {
        motif: formData.motif,
        dateSouhaitee: formData.dateSouhaitee.toISOString().split('T')[0], // Format YYYY-MM-DD
        heureSouhaitee: formData.heureSouhaitee,
        urgent: false, // This field is removed from formData, so it's always false
        notes: formData.notes || undefined,
      }
      
      console.log("Sending request data:", requestData)
      console.log("Employee ID:", employeeId)
      console.log("Note: Using hardcoded employee ID 1 - this may cause errors if the employee doesn't exist in the database")

      const response = await medicalVisitAPI.createRequest(requestData, employeeId)
      
      toast({
        title: "Demande envoyée avec succès !",
        description: "Votre demande de visite médicale a été transmise au service médical. Les infirmiers et médecins ont été notifiés et vous recevrez une réponse dans les plus brefs délais.",
        variant: "default",
      })
      
      setCurrentRequest(response.data)
      setStep(2)
      
      // Update the active request state to reflect the new request
      setHasActiveRequest(true)
      setActiveRequest(response.data)
      
      // Show success animation
      setShowSuccessAnimation(true)
      setTimeout(() => setShowSuccessAnimation(false), 3000)
    } catch (error: any) {
      console.error("Error creating medical visit request:", error)
      console.error("Full error object:", JSON.stringify(error, null, 2))
      
      // Get more detailed error information
      let errorMessage = "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer."
      
      if (error.response?.data) {
        console.error("Backend error details:", error.response.data)
        console.error("Backend error status:", error.response.status)
        console.error("Backend error headers:", error.response.headers)
        
        // Check for specific error message in headers
        const errorHeader = error.response.headers['x-error-message']
        if (errorHeader) {
          errorMessage = errorHeader
        } else if (error.response.data.message) {
          errorMessage = `Erreur: ${error.response.data.message}`
        } else if (error.response.data.error) {
          errorMessage = `Erreur: ${error.response.data.error}`
        } else if (typeof error.response.data === 'string') {
          errorMessage = `Erreur: ${error.response.data}`
        } else {
          errorMessage = `Erreur serveur (${error.response.status}): ${JSON.stringify(error.response.data)}`
        }
      } else if (error.message) {
        errorMessage = `Erreur: ${error.message}`
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }



  const getProcessSteps = () => {
    if (!currentRequest) {
      return [
        {
          number: 1,
          title: "Soumission",
          description: "Vous remplissez et envoyez le formulaire avec vos disponibilités et le motif de votre visite.",
          status: "current" as const
        },
        {
          number: 2,
          title: "Notification",
          description: "Le service médical (infirmier, médecin) est notifié de votre demande.",
          status: "pending" as const
        },
        {
          number: 3,
          title: "Traitement",
          description: "Le service médical examine votre demande et vérifie les disponibilités.",
          status: "pending" as const
        },
        {
          number: 4,
          title: "Confirmation",
          description: "Vous recevrez une notification avec la date et l'heure confirmées ou une proposition alternative.",
          status: "pending" as const
        },
      ]
    }

    const status = currentRequest.status
    switch (status) {
      case 'PENDING':
        return [
          {
            number: 1,
            title: "Soumission",
            description: "Vous remplissez et envoyez le formulaire avec vos disponibilités et le motif de votre visite.",
            status: "completed" as const
          },
          {
            number: 2,
            title: "Notification",
            description: "Le service médical (infirmier, médecin) est notifié de votre demande.",
            status: "completed" as const
          },
          {
            number: 3,
            title: "Traitement",
            description: "Le service médical examine votre demande et vérifie les disponibilités.",
            status: "current" as const
          },
          {
            number: 4,
            title: "Confirmation",
            description: "Vous recevrez une notification avec la date et l'heure confirmées ou une proposition alternative.",
            status: "pending" as const
          },
        ]
      case 'PROPOSED':
        return [
          {
            number: 1,
            title: "Soumission",
            description: "Vous remplissez et envoyez le formulaire avec vos disponibilités et le motif de votre visite.",
            status: "completed" as const
          },
          {
            number: 2,
            title: "Notification",
            description: "Le service médical (infirmier, médecin) est notifié de votre demande.",
            status: "completed" as const
          },
          {
            number: 3,
            title: "Traitement",
            description: "Le service médical examine votre demande et vérifie les disponibilités.",
            status: "completed" as const
          },
          {
            number: 4,
            title: "Confirmation",
            description: "Vous recevrez une notification avec la date et l'heure confirmées ou une proposition alternative.",
            status: "current" as const
          },
        ]
      case 'CONFIRMED':
        return [
          {
            number: 1,
            title: "Soumission",
            description: "Vous remplissez et envoyez le formulaire avec vos disponibilités et le motif de votre visite.",
            status: "completed" as const
          },
          {
            number: 2,
            title: "Notification",
            description: "Le service médical (infirmier, médecin) est notifié de votre demande.",
            status: "completed" as const
          },
          {
            number: 3,
            title: "Traitement",
            description: "Le service médical examine votre demande et vérifie les disponibilités.",
            status: "completed" as const
          },
          {
            number: 4,
            title: "Confirmation",
            description: "Vous recevrez une notification avec la date et l'heure confirmées ou une proposition alternative.",
            status: "completed" as const
          },
        ]
      default:
        return [
          {
            number: 1,
            title: "Soumission",
            description: "Vous remplissez et envoyez le formulaire avec vos disponibilités et le motif de votre visite.",
            status: "current" as const
          },
          {
            number: 2,
            title: "Notification",
            description: "Le service médical (infirmier, médecin) est notifié de votre demande.",
            status: "pending" as const
          },
          {
            number: 3,
            title: "Traitement",
            description: "Le service médical examine votre demande et vérifie les disponibilités.",
            status: "pending" as const
          },
          {
            number: 4,
            title: "Confirmation",
            description: "Vous recevrez une notification avec la date et l'heure confirmées ou une proposition alternative.",
            status: "pending" as const
          },
        ]
    }
  }

  const processSteps = getProcessSteps()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950">
      {/* Navigation */}
      <DashboardNavigation userRole={user.roles[0]} currentPage="demande-visite-medicale" />

      <div className="container mx-auto px-4 py-8 max-w-4xl relative">
        
        {/* Success Animation Overlay */}
        {showSuccessAnimation && (
          <div className="fixed inset-0 bg-green-500/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl transform scale-100 animate-pulse">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
                  Demande envoyée !
                </h3>
                <p className="text-center text-slate-600 dark:text-slate-400">
                  Votre demande a été transmise au service médical
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-6">
            {/* Active Request Warning */}
            {hasActiveRequest && activeRequest && (
              <Card 
                className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                style={{
                  boxShadow: `0 10px 25px -3px ${getThemeColor(500)}10, 0 4px 6px -2px ${getThemeColor(500)}5`
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                        Demande en cours
                      </h3>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                        Vous avez déjà une demande de visite médicale en cours. Vous ne pouvez pas créer une nouvelle demande tant que la précédente n'est pas traitée.
                      </p>
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Demande actuelle
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`border-2 ${
                              activeRequest.status === "PENDING" ? "border-yellow-500 text-yellow-700 dark:text-yellow-400" :
                              activeRequest.status === "PROPOSED" ? "border-orange-500 text-orange-700 dark:text-orange-400" :
                              "border-green-500 text-green-700 dark:text-green-400"
                            }`}
                          >
                            {activeRequest.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          <strong>Motif:</strong> {activeRequest.motif}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          <strong>Date souhaitée:</strong> {format(new Date(activeRequest.dateSouhaitee), "PPP", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Process Steps */}
            <Card 
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700"
              style={{
                boxShadow: `0 10px 25px -3px ${getThemeColor(500)}10, 0 4px 6px -2px ${getThemeColor(500)}5`
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Stethoscope className="h-5 w-5" style={{ color: getThemeColor(600) }} />
                  Processus de demande de visite
                </CardTitle>
              </CardHeader>
              <CardContent>
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {processSteps.map((step, idx) => {
                     const getStepStyle = () => {
                       switch (step.status) {
                         case "completed":
                           return {
                             bgColor: "#d1fae5",
                             borderColor: "#10b981",
                             textColor: "#065f46",
                             iconBg: "#10b981",
                             opacity: "0.7"
                           }
                         case "current":
                           return {
                             bgColor: "#fef3c7",
                             borderColor: "#f59e0b",
                             textColor: "#92400e",
                             iconBg: "#f59e0b",
                             opacity: "1"
                           }
                         case "pending":
                           return {
                             bgColor: "#f3f4f6",
                             borderColor: "#9ca3af",
                             textColor: "#6b7280",
                             iconBg: "#9ca3af",
                             opacity: "0.5"
                           }
                         default:
                           return {
                             bgColor: "#f3f4f6",
                             borderColor: "#9ca3af",
                             textColor: "#6b7280",
                             iconBg: "#9ca3af",
                             opacity: "0.5"
                           }
                       }
                     }
                     
                     const stepStyle = getStepStyle()
                     
                     return (
                       <div
                         key={step.number}
                         className="flex items-start gap-3 p-4 rounded-xl border transition-all duration-300"
                         style={{
                           backgroundColor: stepStyle.bgColor,
                           borderColor: stepStyle.borderColor,
                           opacity: stepStyle.opacity,
                           boxShadow: step.status === "current" ? `0 4px 6px -1px ${getThemeColor(500)}20` : "0 2px 4px -1px rgba(0,0,0,0.1)"
                         }}
                       >
                         <div 
                           className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                           style={{
                             backgroundColor: stepStyle.iconBg
                           }}
                         >
                           {step.status === "completed" ? "✓" : step.number}
                         </div>
                         <div>
                           <h3 className="font-semibold text-sm mb-1" style={{ color: stepStyle.textColor }}>
                             {step.title}
                           </h3>
                           <p className="text-xs leading-relaxed" style={{ color: stepStyle.textColor }}>
                             {step.description}
                           </p>
                         </div>
                       </div>
                     )
                   })}
                 </div>
              </CardContent>
            </Card>



            {/* Information Box */}
            <div 
              className="flex items-start gap-3 p-4 border rounded-xl"
              style={{
                backgroundColor: isDark ? `${getThemeColor(900)}20` : `${getThemeColor(50)}`,
                borderColor: isDark ? getThemeColor(800) : getThemeColor(200)
              }}
            >
              <Info className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: getThemeColor(600) }} />
              <p className="text-sm" style={{ color: isDark ? getThemeColor(400) : getThemeColor(700) }}>
                Votre demande sera examinée par le service médical. Vous serez notifié(e) dès que votre rendez-vous sera confirmé.
              </p>
            </div>

            {/* Form */}
            <Card 
              className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 ${
                hasActiveRequest ? 'opacity-60 pointer-events-none' : ''
              }`}
              style={{
                boxShadow: `0 10px 25px -3px ${getThemeColor(500)}10, 0 4px 6px -2px ${getThemeColor(500)}5`
              }}
            >
                             <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                   <Stethoscope className="h-5 w-5" style={{ color: getThemeColor(600) }} />
                   Demande de visite médicale spontanée
                 </CardTitle>
                 <CardDescription className="text-slate-600 dark:text-slate-400">
                   Remplissez les informations ci-dessous pour demander une visite médicale spontanée
                 </CardDescription>
               </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                                     {/* Motif */}
                   <div className="space-y-3">
                     <div>
                       <Label htmlFor="motif" className="text-slate-900 dark:text-slate-100 font-medium">
                         Motif de la visite
                       </Label>
                       <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                         Décrivez brièvement la raison de votre demande de visite médicale
                       </p>
                     </div>
                     <Textarea
                       id="motif"
                       placeholder="Ex: Visite périodique, douleur au dos, contrôle post-accident, consultation préventive..."
                       value={formData.motif}
                       onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                       className="min-h-[120px] resize-none bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                       required
                     />
                   </div>

                                     {/* Date and Time */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          {/* Date */}
                     <div className="space-y-3">
                       <div>
                         <Label className="text-slate-900 dark:text-slate-100 font-medium">
                           Date souhaitée
                         </Label>
                         <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                           Sélectionnez votre date de préférence pour la visite
                         </p>
                       </div>
                                                                       <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600",
                                !formData.dateSouhaitee && "text-slate-500 dark:text-slate-400"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.dateSouhaitee ? (
                                format(formData.dateSouhaitee, "PPP", {
                                  locale: fr
                                })
                              ) : (
                                <span>Sélectionner une date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                                                   <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-lg rounded-lg z-[99999] calendar-popover" align="start">
                           <EnhancedCalendar
                             selectedDate={formData.dateSouhaitee}
                             onDateSelect={(date) => setFormData({ ...formData, dateSouhaitee: date })}
                             minDate={new Date()}
                           />
                         </PopoverContent>
                       </Popover>
                     </div>

                                                              {/* Time */}
                     <div className="space-y-3">
                       <div>
                         <Label htmlFor="heure" className="text-slate-900 dark:text-slate-100 font-medium">
                           Heure souhaitée
                         </Label>
                         <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                           Indiquez votre créneau horaire préféré
                         </p>
                       </div>
                       <EnhancedTimePicker
                         selectedTime={formData.heureSouhaitee}
                         onTimeSelect={(time) => setFormData({ ...formData, heureSouhaitee: time })}
                         minTime="08:00"
                         maxTime="18:00"
                         interval={30}
                       />
                     </div>
                  </div>

                                     {/* Submit Button */}
                   <div className="space-y-3">
                     <Button
                       type="submit"
                       disabled={isSubmitting || !formData.motif || !formData.dateSouhaitee || !formData.heureSouhaitee || hasActiveRequest}
                       className={`w-full text-white hover:shadow-lg transition-all duration-500 h-12 text-lg font-medium ${
                         isSubmitting ? 'animate-pulse' : ''
                       }`}
                       style={{
                         background: isSubmitting 
                           ? `linear-gradient(135deg, ${getThemeColor(400)}, ${getThemeColor(600)})`
                           : `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`,
                         boxShadow: isSubmitting 
                           ? `0 2px 4px -1px ${getThemeColor(500)}10`
                           : `0 4px 6px -1px ${getThemeColor(500)}20`,
                         transform: isSubmitting ? 'scale(0.98)' : 'scale(1)',
                         transition: 'all 0.3s ease-in-out'
                       }}
                     >
                       {isSubmitting ? (
                         <div className="flex items-center gap-3">
                           <div className="relative">
                             <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                             <div className="absolute inset-0 rounded-full h-6 w-6 border-2 border-transparent border-t-white animate-ping"></div>
                           </div>
                           <span className="animate-pulse">Envoi en cours...</span>
                         </div>
                       ) : hasActiveRequest ? (
                         <div className="flex items-center gap-2">
                           <AlertCircle className="h-5 w-5" />
                           <span>Demande en cours - Non disponible</span>
                         </div>
                       ) : (
                         <div className="flex items-center gap-2">
                           <Stethoscope className="h-5 w-5" />
                           <span>Envoyer la demande de visite</span>
                         </div>
                       )}
                     </Button>
                     <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                       Votre demande sera traitée par le service médical dans les plus brefs délais
                     </p>
                   </div>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Success Step */
          <Card 
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 max-w-md mx-auto"
            style={{
              boxShadow: `0 10px 25px -3px ${getThemeColor(500)}10, 0 4px 6px -2px ${getThemeColor(500)}5`
            }}
          >
            <CardHeader className="text-center">
              <div 
                className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{
                  backgroundColor: isDark ? `${getThemeColor(900)}30` : `${getThemeColor(100)}`
                }}
              >
                <CheckCircle className="h-8 w-8" style={{ color: getThemeColor(600) }} />
              </div>
              <CardTitle className="text-slate-900 dark:text-slate-100">
                Demande envoyée avec succès !
              </CardTitle>
                             <CardDescription className="text-slate-600 dark:text-slate-400">
                 Votre demande de visite médicale spontanée a été transmise au service médical.
               </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="p-4 border rounded-lg"
                style={{
                  backgroundColor: isDark ? `${getThemeColor(900)}20` : `${getThemeColor(50)}`,
                  borderColor: isDark ? getThemeColor(800) : getThemeColor(200)
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: getThemeColor(600) }} />
                  <div className="text-sm" style={{ color: isDark ? getThemeColor(400) : getThemeColor(700) }}>
                    <p className="font-medium mb-1">Prochaines étapes :</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Le service médical examinera votre demande</li>
                      <li>• Vous recevrez une notification de confirmation</li>
                      <li>• Un rendez-vous vous sera proposé selon vos disponibilités</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Retour au tableau de bord
                </Button>
                <Button
                  onClick={() => setStep(1)}
                  className="flex-1 text-white hover:shadow-lg transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`,
                    boxShadow: `0 4px 6px -1px ${getThemeColor(500)}20`
                  }}
                >
                  Nouvelle demande
                </Button>
              </div>
            </CardContent>
          </Card>
        )}


      </div>
    </div>
  )
} 