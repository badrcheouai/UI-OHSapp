"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from "@/components/language-toggle"
import { useTheme } from "@/contexts/ThemeContext"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EnhancedCalendar } from "@/components/enhanced-calendar"
import { EnhancedTimePicker } from "@/components/enhanced-time-picker"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  CalendarIcon, 
  Clock, 
  Stethoscope, 
  AlertCircle, 
  CheckCircle, 
  Clock as ClockIcon,
  User,
  Calendar as CalendarIcon2,
  MessageSquare,
  Filter,
  Search,
  Mail,
  Hourglass,
  FileText,
  Phone,
  Info,
  XCircle
} from "lucide-react"
import { format } from "date-fns"
import { fr, enUS } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { useToast } from "@/hooks/use-toast"
import { medicalVisitAPI, MedicalVisitRequest } from "@/lib/api"
import { EmployeeInfoDialog } from "@/components/EmployeeInfoDialog"
import { EmployeeSelect } from "@/components/EmployeeSelect"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RepriseVisitInfoBox from "@/components/RepriseVisitInfoBox"

export default function DemandeVisiteMedicaleInfirmier() {
  const { user, loading } = useAuth()
  const { t } = useTranslation()
  const { themeColors, isDark } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  
  const [requests, setRequests] = useState<MedicalVisitRequest[]>([])
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PROPOSED" | "CONFIRMED">("ALL")
  const [typeFilter, setTypeFilter] = useState<
    "ALL" | "PERIODIQUE" | "SURVEILLANCE_PARTICULIERE" | "APPEL_MEDECIN" | "REPRISE" | "SPONTANEE"
  >("ALL")
  const [searchTerm, setSearchTerm] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<MedicalVisitRequest | null>(null)
  const [isRejectedRequest, setIsRejectedRequest] = useState(false)
  const [proposeDate, setProposeDate] = useState<Date | null>(null)
  const [proposeTime, setProposeTime] = useState("")
  const [proposeReason, setProposeReason] = useState("")
  const [proposeModality, setProposeModality] = useState<'PRESENTIEL' | 'DISTANCE'>('PRESENTIEL')
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmRequestId, setConfirmRequestId] = useState<number | null>(null)
  const [confirmModality, setConfirmModality] = useState<'PRESENTIEL' | 'DISTANCE'>('PRESENTIEL')
  const [confirmInstructions, setConfirmInstructions] = useState("")
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [requestCounts, setRequestCounts] = useState({
    ALL: 0,
    PENDING: 0,
    PROPOSED: 0,
    CONFIRMED: 0,
    CANCELLED: 0,
    REJECTED: 0
  });

  // Tabs and planifier form state
  const [activeTab, setActiveTab] = useState<"planifier"|"consulter">("consulter")
  const [planEmployeeId, setPlanEmployeeId] = useState<number | undefined>(undefined)
  const [selectedEmployee, setSelectedEmployee] = useState<any | undefined>(undefined)
  const [planVisitType, setPlanVisitType] = useState<'PERIODIQUE'|'SURVEILLANCE_PARTICULIERE'|'APPEL_MEDECIN'|'SPONTANEE'>('PERIODIQUE')
  const [planNotes, setPlanNotes] = useState("")
  const [planDueDate, setPlanDueDate] = useState<string>("")
  const [showEmployeeInfo, setShowEmployeeInfo] = useState(false)
  const [showMaintainRejectedDialog, setShowMaintainRejectedDialog] = useState(false)
  const [maintainRejectedNote, setMaintainRejectedNote] = useState("")
  const [permanentlyRejectedRequests, setPermanentlyRejectedRequests] = useState<Set<number>>(new Set())
  const [requestToMaintainRejected, setRequestToMaintainRejected] = useState<MedicalVisitRequest | null>(null)

  // REPRISE info box dialog state
  const [repriseInfoDialogOpen, setRepriseInfoDialogOpen] = useState(false)
  const [selectedRepriseRequest, setSelectedRepriseRequest] = useState<MedicalVisitRequest | null>(null)

  // Helper function to get theme color
  const getThemeColor = (shade: keyof typeof themeColors.colors.primary) => {
    return themeColors.colors.primary[shade]
  }



  // Load requests with backend availability check
  const loadRequests = async () => {
    setLoadingRequests(true)
    try {
      let response;
      if (filter === "ALL") {
        response = await medicalVisitAPI.getAllRequests();
      } else {
        response = await medicalVisitAPI.getRequestsByStatus(filter);
      }
      setRequests(response.data)
    } catch (error) {
      console.error("API call failed:", error)
      setRequests([])
    } finally {
      setLoadingRequests(false)
    }
  }

  const loadRequestCounts = async () => {
    try {
      const response = await medicalVisitAPI.getRequestCounts();
      setRequestCounts({
        ALL: Object.values(response.data).reduce((a, b) => a + b, 0),
        PENDING: response.data.PENDING || 0,
        PROPOSED: response.data.PROPOSED || 0,
        CONFIRMED: response.data.CONFIRMED || 0,
        CANCELLED: response.data.CANCELLED || 0,
        REJECTED: response.data.REJECTED || 0
      });
    } catch (error) {
      setRequestCounts({ ALL: 0, PENDING: 0, PROPOSED: 0, CONFIRMED: 0, CANCELLED: 0, REJECTED: 0 });
    }
  };

  const handleCreateByMedical = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Validate required fields
    if (!planEmployeeId) {
      toast({ title: "Salarié requis", description: "Veuillez sélectionner un salarié.", variant: "destructive" })
      return
    }
    
    if (!planDueDate) {
      toast({ title: "Date requise", description: "Veuillez sélectionner une date.", variant: "destructive" })
      return
    }
    
    if (!proposeTime) {
      toast({ title: "Heure requise", description: "Veuillez sélectionner une heure.", variant: "destructive" })
      return
    }
    
    setIsProcessing(true)
    try {
      console.log('Creating request with data:', {
        employeeId: planEmployeeId,
        visitType: planVisitType,
        dueDate: planDueDate,
        time: proposeTime,
        notes: planNotes,
        modality: proposeModality
      })
      
      const created = await medicalVisitAPI.createRequest({
        motif: `Demande ${planVisitType.toLowerCase()}`,
        dateSouhaitee: planDueDate,
        heureSouhaitee: proposeTime,
        notes: planNotes || undefined,
        visitType: planVisitType,
        dueDate: planDueDate,
        modality: proposeModality,
      }, planEmployeeId)
      
      // For non-spontanée: backend creates PROPOSED with initial proposed slot
      toast({ title: "Demande créée", description: planVisitType !== 'SPONTANEE' ? "Demande créée avec créneau proposé. Le salarié peut accepter/refuser." : "La demande a été créée avec succès." })
      
      // Reset form
      setPlanNotes("")
      setPlanDueDate("")
      setProposeTime("")
      setSelectedEmployee(undefined)
      setPlanEmployeeId(undefined)
      
      await loadRequests();
      await loadRequestCounts();
      setActiveTab("consulter")
    } catch (err) {
      console.error('Error creating request:', err)
      toast({ title: "Erreur", description: "Création impossible.", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    } else if (!loading && user && !user.roles.includes("INFIRMIER_ST") && !user.roles.includes("MEDECIN_TRAVAIL")) {
      router.replace("/403")
    } else if (!loading && user && (user.roles.includes("INFIRMIER_ST") || user.roles.includes("MEDECIN_TRAVAIL"))) {
      loadRequests()
      loadRequestCounts()
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!loading && user) {
      loadRequests();
      loadRequestCounts();
    }
  }, [filter, user, loading]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="px-3 py-1.5 text-xs font-semibold border-2 border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-200 shadow-amber-200/50 dark:shadow-amber-800/30">
            En attente
          </Badge>
        )
      case "PROPOSED":
        return (
          <Badge className="px-3 py-1.5 text-xs font-semibold border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-200 shadow-blue-200/50 dark:shadow-blue-800/30">
            Proposé
          </Badge>
        )
      case "CONFIRMED":
        return (
          <Badge className="px-3 py-1.5 text-xs font-semibold border-2 border-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-200 shadow-emerald-200/50 dark:shadow-emerald-800/30">
            Confirmé
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="px-3 py-1.5 text-xs font-semibold border-2 border-red-600 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 text-red-700 dark:text-red-200 shadow-red-200/50 dark:shadow-red-800/30">
            ❌ Rejeté
          </Badge>
        )
      default:
        return <Badge className="px-3 py-1.5 text-xs font-semibold border-2 border-slate-500 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/30 text-slate-700 dark:text-slate-200 shadow-slate-200/50 dark:shadow-slate-800/30">Inconnu</Badge>
    }
  }

  const handleConfirm = async (requestId: number) => {
    setConfirmRequestId(requestId)
    setConfirmDialogOpen(true)
  }

  const handleShowRepriseInfo = (request: MedicalVisitRequest) => {
    setSelectedRepriseRequest(request)
    setRepriseInfoDialogOpen(true)
  }

  const submitConfirm = async () => {
    if (confirmRequestId == null) return
    setIsProcessing(true)
    try {
      const request = requests.find(r => r.id === confirmRequestId);
      if (!request) return;
      const isProposed = request.status === 'PROPOSED'
      await medicalVisitAPI.confirmRequest(confirmRequestId, {
        confirmedDate: (isProposed ? request.proposedDate : request.dateSouhaitee) as unknown as string,
        confirmedTime: (isProposed ? request.proposedTime : request.heureSouhaitee) as string,
        notes: confirmInstructions,
        modality: confirmModality,
      });
      await loadRequests();
      setConfirmDialogOpen(false)
      setConfirmInstructions("")
      setConfirmRequestId(null)
      toast({
        title: "Demande confirmée",
        description: "Le rendez-vous a été confirmé et l'employé sera notifié.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la confirmation.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePropose = async (requestId: number, newDate: Date, newTime: string, reason?: string, modality?: 'PRESENTIEL'|'DISTANCE', isRejectedRequest: boolean = false) => {
    setIsProcessing(true)
    try {
      if (!user) {
        toast({
          title: "Erreur",
          description: "Utilisateur non connecté.",
          variant: "destructive",
        });
        return;
      }
      
      if (isRejectedRequest) {
        // Use the auto-confirm endpoint for rejected requests
        await medicalVisitAPI.proposeSlotAfterRejection(requestId, {
          proposedDate: format(newDate, 'yyyy-MM-dd'),
          proposedTime: newTime,
          reason: reason || "Veuillez svp venir à l'heure",
          proposedBy: user?.username || "Infirmier",
          modality
        });
        await loadRequests();
        toast({
          title: "Nouveau créneau confirmé",
          description: "Un nouveau créneau a été automatiquement confirmé pour l'employé.",
          variant: "default",
        })
      } else {
        // Use the regular proposal endpoint
        await medicalVisitAPI.proposeSlot(requestId, {
          proposedDate: format(newDate, 'yyyy-MM-dd'),
          proposedTime: newTime,
          reason: reason || "Veuillez svp venir à l'heure",
          proposedBy: user?.username || "Infirmier",
          modality
        });
        await loadRequests();
        toast({
          title: "Nouvelle proposition",
          description: "Une nouvelle proposition a été envoyée à l'employé. Vous pouvez continuer à proposer d'autres créneaux si nécessaire.",
          variant: "default",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de proposer un créneau.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMaintainRejected = async () => {
    if (!requestToMaintainRejected) return;
    
    setIsProcessing(true);
    try {
      // Mark this request as permanently rejected (no more action buttons)
      setPermanentlyRejectedRequests(prev => new Set([...prev, requestToMaintainRejected.id]));
      
      // Close dialog and reset state
      setShowMaintainRejectedDialog(false);
      setMaintainRejectedNote("");
      setRequestToMaintainRejected(null);
      
      toast({
        title: "Statut maintenu",
        description: "La demande reste définitivement rejetée. Les boutons d'action ont été supprimés. Vous pouvez créer une nouvelle demande si nécessaire.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error maintaining rejected status:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  // Enhanced filtering logic with comprehensive search
  const filteredRequests = requests.filter(request => {
    // Status filter
    const matchesStatus = filter === "ALL" || request.status === filter
    
    // Type filter
    const matchesType = typeFilter === "ALL" || request.visitType === typeFilter
    
    // Enhanced search - search by name, employeeId, email, or phone
    const matchesSearch = !searchTerm || [
      request.employeeName?.toLowerCase(),
      request.employeeId?.toString(), // Search by employee ID
      request.employeeEmail?.toLowerCase(),
      // Phone number search (assuming it's stored in the request or can be derived)
      '+212 6 41 79 85 43' // Placeholder - replace with actual phone field when available
    ].some(field => field && field.includes(searchTerm.toLowerCase()))
    
    return matchesStatus && matchesType && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950">
      {/* Navigation */}
      <DashboardNavigation userRole={user.roles[0]} currentPage="demande-visite-medicale" />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header + Enhanced Tabs */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Visites médicales
          </h1>
          <div className="flex justify-center">
            <div className="flex gap-3 p-1 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
              <button 
                onClick={() => setActiveTab("planifier")}
                className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  activeTab === "planifier" 
                    ? "text-white" 
                    : "border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
                style={activeTab === "planifier" ? {
                  background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`,
                  boxShadow: `0 4px 6px -2px ${getThemeColor(500)}40`
                } : {}}
              >
                Planifier
              </button>
              <button 
                onClick={() => setActiveTab("consulter")}
                className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  activeTab === "consulter" 
                    ? "text-white" 
                    : "border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
                style={activeTab === "consulter" ? {
                  background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`,
                  boxShadow: `0 4px 6px -2px ${getThemeColor(500)}40`
                } : {}}
              >
                Consulter
              </button>
            </div>
          </div>
        </div>

        {/* Planifier */}
        {activeTab === "planifier" && (
          <Card className="mb-6 bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Planifier une visite</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Créer une demande pour un salarié (types autorisés: périodique, surveillance particulière, appel médecin, spontanée)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateByMedical} className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label>Salarié</Label>
                  <EmployeeSelect 
                    value={selectedEmployee}
                    onValueChange={(emp)=>{ setSelectedEmployee(emp); setPlanEmployeeId(emp?.id) }}
                  />
                  <div className="mt-2">
                    <Button type="button" variant="outline" onClick={()=>setShowEmployeeInfo(true)} disabled={!planEmployeeId} className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Afficher informations</Button>
                  </div>
                </div>
                <div>
                  <Label>Type de visite</Label>
                  <Select value={planVisitType} onValueChange={(v)=>setPlanVisitType(v as any)}>
                    <SelectTrigger className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg shadow-sm hover:shadow-md focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500">
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERIODIQUE">Périodique</SelectItem>
                      <SelectItem value="SURVEILLANCE_PARTICULIERE">Surveillance particulière</SelectItem>
                      <SelectItem value="APPEL_MEDECIN">À l'appel du médecin</SelectItem>
                      
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Date souhaitée</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className={cn(
                            "w-full justify-start bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm hover:shadow-md",
                            !planDueDate && 'text-slate-500 dark:text-slate-400'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {planDueDate ? planDueDate : 'Sélectionner la date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-transparent border-0 shadow-none calendar-popover z-[9999]">
                        <EnhancedCalendar selectedDate={planDueDate ? new Date(planDueDate) : null} onDateSelect={(d)=>setPlanDueDate(d ? format(d, 'yyyy-MM-dd') : '')} minDate={new Date()} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Heure souhaitée</Label>
                    <EnhancedTimePicker selectedTime={proposeTime} onTimeSelect={(t)=>setProposeTime(t)} minTime="08:00" maxTime="18:00" interval={30} />
                  </div>
                  <div>
                    <Label>Modalité</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-2 text-sm"><input type="radio" name="mod" checked={proposeModality==='PRESENTIEL'} onChange={()=>setProposeModality('PRESENTIEL')} /> Présentiel</label>
                      <label className="flex items-center gap-2 text-sm"><input type="radio" name="mod" checked={proposeModality==='DISTANCE'} onChange={()=>setProposeModality('DISTANCE')} /> À distance</label>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label>Notes (optionnel)</Label>
                  <Textarea 
                    value={planNotes} 
                    onChange={(e)=>setPlanNotes(e.target.value)} 
                    placeholder="Consignes ou remarques" 
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 shadow-sm hover:shadow-md resize-none"
                    rows={4}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Button 
                    type="submit" 
                    disabled={isProcessing || !planEmployeeId || !planDueDate || !proposeTime} 
                    className="text-white" 
                    style={{background:`linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`}}
                  >
                    {isProcessing ? "Création en cours..." : "Créer la demande"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Consulter - existing UI */}
        {activeTab === "consulter" && (
        <>
        {/* Dev-only Reset Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            onClick={async ()=>{
              try {
                setIsProcessing(true)
                // Determine target employee IDs
                const candidateIds = [] as number[]
                if (selectedEmployee?.id) candidateIds.push(selectedEmployee.id)
                else if (planEmployeeId) candidateIds.push(planEmployeeId)
                else {
                  // Fallback: reset for all employees present in the current list (dev helper)
                  const uniq = Array.from(new Set(requests.map(r => r.employeeId)))
                  candidateIds.push(...uniq)
                }

                if (candidateIds.length === 0) {
                  toast({ title: "Aucun salarié", description: "Sélectionnez un salarié ou chargez des demandes pour réinitialiser.", variant: "destructive" })
                  setIsProcessing(false)
                  return
                }

                await Promise.allSettled(candidateIds.map(id => medicalVisitAPI.resetEmployeeRequests(id)))
                await loadRequests()
                await loadRequestCounts()
                toast({ title: "Réinitialisé", description: candidateIds.length > 1 ? `Demandes supprimées pour ${candidateIds.length} salariés (dev).` : "Toutes les demandes de ce salarié ont été supprimées (dev)." })
              } catch (e) {
                toast({ title: "Réinitialisation échouée", description: "Impossible de supprimer les demandes.", variant: "destructive" })
              } finally {
                setIsProcessing(false)
              }
            }}
          >
            Réinitialiser les demandes (dev)
          </Button>
        </div>
        {/* Filters and Search */}
        <Card 
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 mb-6"
          style={{
            boxShadow: `0 10px 25px -3px ${getThemeColor(500)}10, 0 4px 6px -2px ${getThemeColor(500)}5`
          }}
        >
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par nom, ID employé, email ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500"
                />
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-1">
                  Recherche rapide par nom, ID employé, email ou numéro de téléphone
                </div>
              </div>

              {/* Compact Filters Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="min-w-[140px] justify-center border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl">
                  <div className="p-4 space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Statut</div>
                      <RadioGroup value={filter} onValueChange={(v)=>setFilter(v as any)} className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'ALL', label: `Tous (${requestCounts.ALL})` },
                          { key: 'PENDING', label: `En attente (${requestCounts.PENDING})` },
                          { key: 'PROPOSED', label: `Proposés (${requestCounts.PROPOSED})` },
                          { key: 'CONFIRMED', label: `Confirmés (${requestCounts.CONFIRMED})` },
                        ].map(s => (
                          <label key={s.key} className={`cursor-pointer px-3 py-2 rounded-lg border text-sm ${filter===s.key?'text-white':''}`} style={filter===s.key?{background:`linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`,border:'none'}:{}}>
                            <input type="radio" className="hidden" value={s.key} checked={filter===s.key} onChange={()=>setFilter(s.key as any)} />
                            {s.label}
                          </label>
                        ))}
                      </RadioGroup>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Type</div>
                      <RadioGroup value={typeFilter} onValueChange={(v)=>setTypeFilter(v as any)} className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'ALL', label: 'Tous types' },
                          { key: 'PERIODIQUE', label: 'Périodique' },
                          { key: 'SURVEILLANCE_PARTICULIERE', label: 'Surveillance particulière' },
                          { key: 'APPEL_MEDECIN', label: "À l'appel du médecin" },
                          { key: 'REPRISE', label: 'Reprise' },
                          { key: 'SPONTANEE', label: 'Spontanée' },
                        ].map(t => (
                          <label key={t.key} className={`cursor-pointer px-3 py-2 rounded-lg border text-sm ${typeFilter===t.key?'text-white':''}`} style={typeFilter===t.key?{background:`linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`,border:'none'}:{}}>
                            <input type="radio" className="hidden" value={t.key} checked={typeFilter===t.key} onChange={()=>setTypeFilter(t.key as any)} />
                            {t.label}
                          </label>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="flex justify-between pt-2">
                      <Button variant="ghost" className="text-slate-600 dark:text-slate-300" onClick={()=>{setFilter('ALL' as any); setTypeFilter('ALL' as any);}}>Effacer</Button>
                      <Button className="text-white" style={{background:`linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`}}>Fermer</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Search Results Counter */}
        {searchTerm && (
          <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            {filteredRequests.length} résultat(s) trouvé(s) pour "{searchTerm}"
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {loadingRequests ? (
            <div className="text-center py-12">
              <div 
                className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
                style={{ borderColor: getThemeColor(500) }}
              ></div>
              <p className="text-slate-600 dark:text-slate-400">Chargement des demandes...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card 
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700"
              style={{
                boxShadow: `0 10px 25px -3px ${getThemeColor(500)}10, 0 4px 6px -2px ${getThemeColor(500)}5`
              }}
            >
              <CardContent className="p-12 text-center">
                <Stethoscope className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Aucune demande trouvée
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {searchTerm || filter !== "ALL" 
                    ? "Aucune demande ne correspond à vos critères de recherche."
                    : "Aucune demande de visite médicale spontanée en attente."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card 
                key={request.id} 
                className="bg-white dark:bg-slate-800 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-xl overflow-hidden group cursor-pointer"
                style={{
                  boxShadow: `0 8px 20px -5px rgba(0, 0, 0, 0.1), 0 3px 6px -2px rgba(0, 0, 0, 0.05)`
                }}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Request Info */}
                    <div className="flex-1 space-y-3">
                      {/* Header with Employee Info and Status */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                  className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl cursor-pointer"
                            style={{
                    background: `linear-gradient(135deg, ${getThemeColor(400)}, ${getThemeColor(600)})`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`
                    e.currentTarget.style.transform = 'scale(1.15) rotate(5deg)'
                    e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(0,0,0,0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${getThemeColor(400)}, ${getThemeColor(600)})`
                    e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.2)'
                  }}
                >
                  <User className="h-5 w-5 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                          </div>
                          <div className="space-y-4">
                            {/* Employee Name */}
                            <div className="flex items-center">
                              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                                {request.employeeName}
                              </h3>
                            </div>

                            {/* Key Information Grid */}
                            <div className="grid grid-cols-1 gap-4">
                              {/* Contact Information */}
                              <div className="flex items-center gap-2">
                                <div 
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg border cursor-pointer"
                                  style={{
                                    background: `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`,
                                    borderColor: getThemeColor(300),
                                    color: getThemeColor(700),
                                    boxShadow: `0 2px 8px -2px ${getThemeColor(500)}40`
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = `linear-gradient(135deg, ${getThemeColor(100)}, ${getThemeColor(200)})`
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`
                                    e.currentTarget.style.transform = 'translateY(0)'
                                  }}
                                >
                                  <Phone className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
                                  <span className="font-semibold">
                                    📱 +212 6 41 79 85 43
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Visit Type */}
                            <div className="flex items-center gap-2">
                              <span
                                className="px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wide transition-all duration-300"
                                style={{
                                  background: `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`,
                                  color: getThemeColor(700),
                                  boxShadow: `0 2px 6px -2px ${getThemeColor(500)}15`
                                }}
                              >
                                Type de visite :
                              </span>
                              {request.visitType && (
                                <span
                                  className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold shadow-md transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-pointer"
                                  style={{
                                    background: `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`,
                                    color: getThemeColor(700),
                                    boxShadow: `0 2px 8px -2px ${getThemeColor(500)}40`
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = `linear-gradient(135deg, ${getThemeColor(100)}, ${getThemeColor(200)})`
                                    e.currentTarget.style.transform = 'translateY(-1px) rotate(1deg)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`
                                    e.currentTarget.style.transform = 'translateY(0) rotate(0deg)'
                                  }}
                                >
                                  {request.visitType === 'SPONTANEE' ? 'Spontanée' :
                                   request.visitType === 'PERIODIQUE' ? 'Périodique' :
                                   request.visitType === 'SURVEILLANCE_PARTICULIERE' ? 'Surveillance particulière' :
                                   request.visitType === 'APPEL_MEDECIN' ? "À l'appel du médecin" :
                                   request.visitType === 'REPRISE' ? 'Reprise' : request.visitType}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Motif Section - Only for Spontaneous Visits */}
                      {request.visitType === 'SPONTANEE' && (
                        <div 
                        className="p-3 rounded-lg shadow-md border-0 transition-all duration-300 hover:shadow-xl hover:scale-[1.03] cursor-pointer group/motif"
                          style={{
                          background: `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`,
                          boxShadow: `0 4px 15px -4px ${getThemeColor(500)}20`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `linear-gradient(135deg, ${getThemeColor(100)}, ${getThemeColor(200)})`
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`
                          e.currentTarget.style.transform = 'translateY(0) scale(1)'
                        }}
                      >
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-2 transition-colors duration-300 group-hover/motif:text-slate-600 dark:group-hover/motif:text-slate-200">
                          <div className="w-1.5 h-1.5 rounded-full transition-all duration-300 group-hover/motif:scale-150 group-hover/motif:rotate-180" style={{ backgroundColor: getThemeColor(500) }}></div>
                          Raison de la visite
                        </h4>
                        <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold leading-relaxed transition-colors duration-300 group-hover/motif:text-slate-800 dark:group-hover/motif:text-slate-100">
                          {request.motif}
                          </p>
                        </div>
                      )}

                                              {/* Clean Proposed Slot Section */}
                        {request.status === "PROPOSED" && request.proposedDate && (
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                  Créneau proposé
                                </h4>
                              </div>
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                ⭐ Actuel
                              </span>
                            </div>
                            
                            {/* Content Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Date and Time */}
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                  Date et heure
                                </p>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                  {format(new Date(request.proposedDate), "dd MMM yyyy", { locale: fr })}
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  {request.proposedTime}
                                </p>
                              </div>

                              {/* Modalité */}
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                  Modalité
                                </p>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  {(request.modality || request.proposedModality) === 'PRESENTIEL' ? '🏥 Présentiel' : '💻 À distance'}
                                </p>
                              </div>

                              {/* Consignes */}
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                  Consignes
                                </p>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  {request.notes || (request.previousProposals && request.previousProposals.length > 0 
                                    ? request.previousProposals[request.previousProposals.length - 1].reason
                                    : null) || 'Aucune consigne spécifique'}
                                </p>
                              </div>
                            </div>

                            {/* Previous Slot */}

                          </div>
                        )}

                      {/* Removed duplicated "Proposition actuelle en attente de réponse" section */}

                      {/* Removed history section */}

                      {/* Confirmed Visit Info - Reorganized */}
                      {request.status === "CONFIRMED" && request.confirmedDate && (
                        <div className="space-y-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          {/* Date confirmée */}
                          <div className="flex items-center gap-3">
                            <div 
                              className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer"
                              style={{
                                background: `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`,
                                color: getThemeColor(700),
                                boxShadow: `0 2px 8px -2px ${getThemeColor(500)}40`
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `linear-gradient(135deg, ${getThemeColor(100)}, ${getThemeColor(200)})`
                                e.currentTarget.style.transform = 'translateY(-1px) rotate(1deg)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`
                                e.currentTarget.style.transform = 'translateY(0) rotate(0deg)'
                              }}
                            >
                              📅 Date confirmée : {format(new Date(request.confirmedDate), "dd MMM yyyy", { locale: fr })} à {request.confirmedTime}
                            </div>
                          </div>

                          {/* Consigne pour la visite */}
                          <div className="flex items-center gap-3">
                            <div 
                              className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer"
                              style={{
                                background: `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`,
                                color: getThemeColor(700),
                                boxShadow: `0 2px 8px -2px ${getThemeColor(500)}40`
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `linear-gradient(135deg, ${getThemeColor(100)}, ${getThemeColor(200)})`
                                e.currentTarget.style.transform = 'translateY(-1px) rotate(1deg)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`
                                e.currentTarget.style.transform = 'translateY(0) rotate(0deg)'
                              }}
                            >
                              📋 Consigne pour la visite : {request.notes || request.motif || 'Aucune consigne spécifique'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 min-w-[200px]">
                      {request.status === "PENDING" && (
                        <>
                          {/* Only show Confirmer button for non-EMBAUCHE and non-REPRISE visits */}
                          {request.visitType !== 'EMBAUCHE' && request.visitType !== 'REPRISE' && (
                            <Button
                              onClick={() => {
                                if (request.id) handleConfirm(request.id)
                              }}
                              disabled={isProcessing}
                              className="w-full text-white hover:shadow-2xl transition-all duration-500 h-11 text-sm font-bold rounded-xl border-0 transform hover:scale-105 hover:-translate-y-1"
                              style={{
                                background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`,
                                boxShadow: `0 8px 25px -8px ${getThemeColor(500)}40, 0 4px 6px -2px ${getThemeColor(500)}20`
                              }}
                            >
                              <CheckCircle className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                              Confirmer
                            </Button>
                          )}
                          {/* Always show Proposer un créneau button for PENDING requests */}
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (request.id) setSelectedRequest(request)
                            }}
                            className="w-full transition-all duration-500 h-11 text-sm font-bold rounded-xl border-2 hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                            style={{
                              borderColor: getThemeColor(300),
                              color: getThemeColor(700),
                              background: `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`,
                              boxShadow: `0 4px 12px -4px ${getThemeColor(500)}20`
                            }}
                          >
                            <Clock className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                            {request.previousProposals && request.previousProposals.length > 0 
                              ? `Proposer un ${request.previousProposals.length + 1}ème créneau`
                              : "Proposer un créneau"
                            }
                          </Button>
                          
                          {/* Show REPRISE info button for REPRISE visits */}
                          {request.visitType === 'REPRISE' && (
                            <Button
                              variant="outline"
                              onClick={() => handleShowRepriseInfo(request)}
                              className="w-full transition-all duration-500 h-11 text-sm font-bold rounded-xl border-2 hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                              style={{
                                borderColor: '#f97316',
                                color: '#ea580c',
                                background: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
                                boxShadow: '0 4px 12px -4px #f9731620'
                              }}
                            >
                              <Info className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                              Voir détails reprise
                            </Button>
                          )}
                          
                          {/* Always show Infos salarié button */}
                          <Button
                            variant="outline"
                            onClick={() => { setPlanEmployeeId(request.employeeId); setShowEmployeeInfo(true); }}
                            className="w-full transition-all duration-500 h-11 text-sm font-bold rounded-xl border-2 hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                            style={{
                              borderColor: getThemeColor(300),
                              color: getThemeColor(700),
                              background: `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`,
                              boxShadow: `0 4px 12px -4px ${getThemeColor(500)}20`
                            }}
                          >
                            <User className="h-4 w-4 mr-2" />
                            Infos salarié
                          </Button>
                        </>
                      )}

                      {/* Show rejection information and action buttons for rejected proposals */}
                      {request.status === "REJECTED" && (
                        <>
                          {/* Rejection Information */}
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">
                                Demande rejetée
                              </h4>
                            </div>
                            
                            {/* Get rejection details from the latest proposal */}
                            {request.previousProposals && request.previousProposals.length > 0 && (
                              (() => {
                                const rejectedProposal = request.previousProposals
                                  .filter(p => p.status === 'REJECTED')
                                  .sort((a, b) => new Date(b.proposedAt || 0).getTime() - new Date(a.proposedAt || 0).getTime())[0];
                                
                                if (rejectedProposal) {
                                  return (
                                    <div className="space-y-2">
                                      {request.rejectedAt ? (
                                        <div className="flex items-center gap-2 text-sm">
                                          <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
                                          <span className="text-red-700 dark:text-red-300">
                                            Rejeté le: {format(new Date(request.rejectedAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                                          </span>
                                        </div>
                                      ) : rejectedProposal.proposedAt && (
                                        <div className="flex items-center gap-2 text-sm">
                                          <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
                                          <span className="text-red-700 dark:text-red-300">
                                            Rejeté le: {format(new Date(rejectedProposal.proposedAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                                          </span>
                                        </div>
                                      )}
                                      
                                      {request.rejectionReason && request.rejectionReason.trim() !== '' ? (
                                        <div className="flex items-start gap-2 text-sm">
                                          <MessageSquare className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                                          <span className="text-red-700 dark:text-red-300">
                                            <strong>Raison du rejet:</strong> {request.rejectionReason}
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-start gap-2 text-sm">
                                          <MessageSquare className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                                          <span className="text-red-700 dark:text-red-300">
                                            <strong>Raison du rejet:</strong> Aucune raison spécifiée
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              })()
                            )}
                          </div>

                          {/* Only show action buttons if NOT permanently rejected */}
                          {!permanentlyRejectedRequests.has(request.id) && (
                            <>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsRejectedRequest(true);
                                  // Pre-fill with current date/time for convenience
                                  setProposeDate(new Date());
                                  setProposeTime("09:00");
                                }}
                                className="w-full transition-all duration-500 h-11 text-sm font-bold rounded-xl border-2 hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                                style={{
                                  borderColor: getThemeColor(500),
                                  color: getThemeColor(700),
                                  background: `linear-gradient(135deg, ${getThemeColor(50)}, ${getThemeColor(100)})`,
                                  boxShadow: `0 4px 12px -4px ${getThemeColor(500)}20`
                                }}
                              >
                                <CalendarIcon2 className="h-4 w-4 mr-2" />
                                Choisir une autre date (auto-confirmé)
                              </Button>
                              
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setRequestToMaintainRejected(request);
                                  setShowMaintainRejectedDialog(true);
                                }}
                                className="w-full transition-all duration-500 h-11 text-sm font-bold rounded-xl border-2 hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                                style={{
                                  borderColor: '#6b7280',
                                  color: '#6b7280',
                                  background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
                                  boxShadow: '0 4px 12px -4px #6b728020'
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Annuler (garder rejeté)
                              </Button>
                            </>
                          )}

                          {/* Show message if permanently rejected */}
                          {permanentlyRejectedRequests.has(request.id) && (
                            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <XCircle className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                  Statut définitivement maintenu
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Cette demande reste rejetée. Vous pouvez créer une nouvelle demande si nécessaire.
                              </p>
                            </div>
                          )}
                        </>
                      )}



                                                {/* Status is already shown in the header, no need for duplicate confirmation */}
                    </div>
                    
                    {/* Status Badge - Positioned on the far right like RH page */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-2 rounded-lg text-sm font-bold shadow-lg border transition-all duration-300 hover:scale-110 hover:shadow-2xl cursor-pointer flex items-center gap-2 ${
                          request.status === 'CONFIRMED'
                            ? 'border-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-200 shadow-emerald-200/50 dark:shadow-emerald-800/30'
                            : request.status === 'PROPOSED'
                              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-200 shadow-blue-200/50 dark:shadow-blue-800/30'
                            : request.status === 'REJECTED'
                              ? 'border-red-600 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 text-red-700 dark:text-red-200 shadow-red-200/50 dark:shadow-red-800/30'
                              : 'border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-200 shadow-amber-200/50 dark:shadow-amber-800/30'
                        }`}
                      >
                        {request.status === 'CONFIRMED' ? '✅ Confirmé' : 
                         request.status === 'PROPOSED' ? '🔄 Proposé' : 
                         request.status === 'REJECTED' ? '❌ Rejeté' :
                         <>
                           <Hourglass className="h-3 w-3 animate-spin" style={{ animationDuration: '2s' }} />
                           En attente
                         </>}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        </>
        )}
      </div>

      <EmployeeInfoDialog open={showEmployeeInfo} onOpenChange={setShowEmployeeInfo} employeeId={planEmployeeId || 0} />

      {/* Propose New Slot Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              {isRejectedRequest ? "Confirmer un nouveau créneau" : "Proposer un nouveau créneau"}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {isRejectedRequest 
                ? `Confirmez une nouvelle date et heure pour ${selectedRequest?.employeeName}. Le créneau sera automatiquement confirmé.` 
                : `Proposez une nouvelle date et heure pour ${selectedRequest?.employeeName}`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-slate-100 font-medium">
                Nouvelle date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600",
                      !proposeDate && "text-slate-500 dark:text-slate-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {proposeDate ? (
                      format(proposeDate, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-transparent border-0 shadow-none calendar-popover z-[99999]" align="start">
                  <EnhancedCalendar
                    selectedDate={proposeDate}
                    onDateSelect={(date) => setProposeDate(date)}
                    minDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="propose-time" className="text-slate-900 dark:text-slate-100 font-medium">
                Nouvelle heure
              </Label>
              <EnhancedTimePicker
                selectedTime={proposeTime}
                onTimeSelect={(time) => setProposeTime(time)}
                minTime="08:00"
                maxTime="18:00"
                interval={30}
              />
            </div>

            {/* Reason (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="propose-reason" className="text-slate-900 dark:text-slate-100 font-medium">
                Consignes pour l'employé (optionnel)
              </Label>
              <Textarea
                id="propose-reason"
                placeholder="Ex: Venez à jeun, apporter vos analyses, etc."
                value={proposeReason}
                onChange={(e) => setProposeReason(e.target.value)}
                className="min-h-[80px] resize-none bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500"
              />
              <div className="pt-2">
                <Label className="text-slate-900 dark:text-slate-100 font-medium">Modalité du rendez-vous</Label>
                <RadioGroup value={proposeModality} onValueChange={(v)=>setProposeModality(v as 'PRESENTIEL'|'DISTANCE')} className="flex gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="prop-pres" value="PRESENTIEL" />
                    <Label htmlFor="prop-pres">Présentiel</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="prop-dist" value="DISTANCE" />
                    <Label htmlFor="prop-dist">À distance</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

      
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSelectedRequest(null)}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Annuler
            </Button>
            <Button 
              onClick={() => {
                if (selectedRequest && selectedRequest.id && proposeDate && proposeTime) {
                  handlePropose(selectedRequest.id, proposeDate, proposeTime, proposeReason, proposeModality, isRejectedRequest)
                  setSelectedRequest(null)
                  setIsRejectedRequest(false)
                  setProposeDate(null)
                  setProposeTime("")
                  setProposeReason("")
                  setProposeModality('PRESENTIEL')
                }
              }}
              disabled={!proposeDate || !proposeTime || isProcessing}
              className="text-white transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`,
                boxShadow: `0 4px 6px -1px ${getThemeColor(500)}20`
              }}
            >
              {isProcessing ? "Proposition..." : (isRejectedRequest ? "Confirmer le créneau" : "Proposer le créneau")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={(open) => setConfirmDialogOpen(open)}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Confirmer le rendez-vous
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Choisissez la modalité et ajoutez des consignes (optionnel).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label className="mb-2 block text-slate-900 dark:text-slate-100 font-medium">Modalité</Label>
              <RadioGroup value={confirmModality} onValueChange={(v) => setConfirmModality(v as 'PRESENTIEL' | 'DISTANCE')} className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="mod-pres" value="PRESENTIEL" />
                  <Label htmlFor="mod-pres" className="text-slate-900 dark:text-slate-100">Présentiel</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="mod-dist" value="DISTANCE" />
                  <Label htmlFor="mod-dist" className="text-slate-900 dark:text-slate-100">À distance</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="confirm-instr" className="text-slate-900 dark:text-slate-100 font-medium">Consignes (optionnel)</Label>
              <Textarea 
                id="confirm-instr" 
                placeholder="Ex: Venez à jeun, ne pas boire ni manger, apporter vos documents..." 
                value={confirmInstructions} 
                onChange={(e) => setConfirmInstructions(e.target.value)}
                className="min-h-[80px] resize-none bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Annuler
            </Button>
            <Button 
              onClick={submitConfirm} 
              disabled={isProcessing}
              className="text-white transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`,
                boxShadow: `0 4px 6px -1px ${getThemeColor(500)}20`
              }}
            >
              {isProcessing ? 'Confirmation...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REPRISE Info Box Dialog */}
      <Dialog open={repriseInfoDialogOpen} onOpenChange={setRepriseInfoDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Détails de la visite de reprise
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Informations complètes sur la demande de visite médicale de reprise
            </DialogDescription>
          </DialogHeader>
          {selectedRepriseRequest && (
            <RepriseVisitInfoBox
              visitRequest={{
                id: selectedRepriseRequest.id,
                employeeName: selectedRepriseRequest.employeeName,
                employeeEmail: selectedRepriseRequest.employeeEmail ?? '',
                motif: selectedRepriseRequest.motif,
                dateSouhaitee: selectedRepriseRequest.dateSouhaitee,
                heureSouhaitee: selectedRepriseRequest.heureSouhaitee,
                status: selectedRepriseRequest.status,
                visitType: selectedRepriseRequest.visitType ?? '',
                repriseCategory: selectedRepriseRequest.repriseCategory || '',
                repriseDetails: selectedRepriseRequest.repriseDetails || '',
                hasMedicalCertificates: selectedRepriseRequest.hasMedicalCertificates || false,
                createdAt: selectedRepriseRequest.createdAt
              }}
              onClose={() => setRepriseInfoDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Maintain Rejected Status Dialog */}
      <Dialog open={showMaintainRejectedDialog} onOpenChange={setShowMaintainRejectedDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Maintenir le statut rejeté
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Ajoutez une note pour expliquer pourquoi la demande reste rejetée (optionnel).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="maintain-note" className="text-slate-900 dark:text-slate-100 font-medium">Note (optionnel)</Label>
              <Textarea 
                id="maintain-note" 
                placeholder="Ex: L'employé doit d'abord résoudre le problème médical avant de pouvoir programmer une nouvelle visite..." 
                value={maintainRejectedNote} 
                onChange={(e) => setMaintainRejectedNote(e.target.value)}
                className="min-h-[80px] resize-none bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowMaintainRejectedDialog(false);
                setMaintainRejectedNote("");
              }}
              className="border-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleMaintainRejected} 
              disabled={isProcessing}
              className="text-white transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, #6b7280, #4b5563)`,
                boxShadow: `0 4px 6px -1px #6b728020`
              }}
            >
              {isProcessing ? 'Traitement...' : 'Maintenir rejeté'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
