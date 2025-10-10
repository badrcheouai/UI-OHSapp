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
  RefreshCw,
  XCircle
} from "lucide-react"
import { format } from "date-fns"
import { fr, enUS } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { useToast } from "@/hooks/use-toast"
import { medicalVisitAPI, MedicalVisitRequest } from "@/lib/api"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeeInfoDialog } from "@/components/EmployeeInfoDialog"
import { EmployeeSelect } from "@/components/EmployeeSelect"

export default function DemandeVisiteMedicaleMedecin() {
  const { user, loading } = useAuth()
  const { t } = useTranslation()
  const { themeColors, isDark } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  
  const [requests, setRequests] = useState<MedicalVisitRequest[]>([])
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PROPOSED" | "CONFIRMED">("ALL")
  const [searchTerm, setSearchTerm] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<MedicalVisitRequest | null>(null)
  const [isRejectedRequest, setIsRejectedRequest] = useState(false)
  const [proposeDate, setProposeDate] = useState<Date | null>(null)
  const [proposeTime, setProposeTime] = useState("")
  const [proposeReason, setProposeReason] = useState("")
  const [proposeModality, setProposeModality] = useState<'PRESENTIEL' | 'DISTANCE'>("PRESENTIEL")
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
  // Planifier form state (doctor)
  const [activeTab, setActiveTab] = useState<"planifier"|"consulter">("consulter")
  const [planEmployeeId, setPlanEmployeeId] = useState<number | undefined>(undefined)
  const [selectedEmployee, setSelectedEmployee] = useState<any | undefined>(undefined)
  const [planVisitType, setPlanVisitType] = useState<'PERIODIQUE'|'SURVEILLANCE_PARTICULIERE'|'APPEL_MEDECIN'|'SPONTANEE'>('PERIODIQUE')
  const [planNotes, setPlanNotes] = useState("")
  const [planDueDate, setPlanDueDate] = useState<string>("")
  const [showEmployeeInfo, setShowEmployeeInfo] = useState(false)

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

  const handleCreateByDoctor = async (e: React.FormEvent) => {
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
    
    setIsProcessing(true)
    try {
      console.log('Creating request with data:', {
        employeeId: planEmployeeId,
        visitType: planVisitType,
        dueDate: planDueDate,
        notes: planNotes
      })
      
      await medicalVisitAPI.createRequest({
        motif: planNotes || `Demande ${planVisitType.toLowerCase()}`,
        dateSouhaitee: planDueDate,
        heureSouhaitee: "09:00",
        notes: planNotes || undefined,
        visitType: planVisitType,
        dueDate: planDueDate,
      }, planEmployeeId)
      
      toast({ title: "Demande créée", description: "La demande a été créée avec succès." })
      
      // Reset form
      setPlanNotes("")
      setPlanDueDate("")
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

  // Add useEffect to reload when filter changes
  useEffect(() => {
    if (!loading && user) {
      loadRequests();
      loadRequestCounts();
    }
  }, [filter, user, loading]);

  useEffect(() => {
    if (selectedRequest) {
      if (selectedRequest.previousProposals && selectedRequest.previousProposals.length > 0) {
        const latestProposal = selectedRequest.previousProposals[selectedRequest.previousProposals.length - 1];
        setProposeDate(new Date(latestProposal.proposedDate));
        setProposeTime(latestProposal.proposedTime);
      } else {
        setProposeDate(null);
        setProposeTime("");
      }
    }
  }, [selectedRequest]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="px-3 py-1.5 text-xs font-semibold border-2 border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-200 shadow-amber-200/50 dark:shadow-amber-800/30">En attente</Badge>
      case "PROPOSED":
        return <Badge className="px-3 py-1.5 text-xs font-semibold border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-200 shadow-blue-200/50 dark:shadow-blue-800/30">Proposé</Badge>
      case "CONFIRMED":
        return <Badge className="px-3 py-1.5 text-xs font-semibold border-2 border-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-200 shadow-emerald-200/50 dark:shadow-emerald-800/30">Confirmé</Badge>
      case "CANCELLED":
        return <Badge className="px-3 py-1.5 text-xs font-semibold border-2 border-red-600 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-200 shadow-red-200/50 dark:shadow-red-800/30">Annulé</Badge>
      case "REJECTED":
        return <Badge className="px-3 py-1.5 text-xs font-semibold border-2 border-red-600 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-200 shadow-red-200/50 dark:shadow-red-800/30">Rejeté</Badge>
      default:
        return <Badge className="px-3 py-1.5 text-xs font-semibold border-2 border-slate-500 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/30 text-slate-700 dark:text-slate-200 shadow-slate-200/50 dark:shadow-slate-800/30">Inconnu</Badge>
    }
  }

  const handleConfirm = async (requestId: number) => {
    setConfirmRequestId(requestId)
    setConfirmDialogOpen(true)
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
      await loadRequestCounts();
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
          proposedBy: user?.username || "Médecin",
          modality
        });
        
        // Reload requests to get updated data
        await loadRequests();
        await loadRequestCounts();
        
        toast({
          title: "Nouveau créneau confirmé",
          description: "Un nouveau créneau a été automatiquement confirmé pour l'employé.",
          variant: "default",
        });
      } else {
        // Use the regular proposal endpoint
        await medicalVisitAPI.proposeSlot(requestId, {
          proposedDate: format(newDate, 'yyyy-MM-dd'),
          proposedTime: newTime,
          reason: reason || "Veuillez svp venir à l'heure",
          proposedBy: user?.username || "Médecin",
          modality
        });
        
        // Reload requests to get updated data
        await loadRequests();
        await loadRequestCounts();
        
        toast({
          title: "Créneau proposé",
          description: "Un nouveau créneau a été proposé avec succès.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error proposing slot:", error);
      toast({
        title: "Erreur",
        description: "Impossible de proposer un créneau.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.motif.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === "ALL") return matchesSearch
    if (filter === "PENDING") return matchesSearch && request.status === "PENDING"
    if (filter === "PROPOSED") return matchesSearch && request.status === "PROPOSED"
    if (filter === "CONFIRMED") return matchesSearch && request.status === "CONFIRMED"
    
    return matchesSearch
  })

  const getFilterCount = (status: "all" | "pending" | "proposed" | "confirmed") => {
    if (status === "all") return requests.length
    if (status === "pending") return requests.filter(r => r.status === "PENDING").length
    if (status === "proposed") return requests.filter(r => r.status === "PROPOSED").length
    if (status === "confirmed") return requests.filter(r => r.status === "CONFIRMED").length
    return 0
  }

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
      {/* Navigation */}
      <DashboardNavigation userRole={user.roles[0]} currentPage="demande-visite-medicale" />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header + Enhanced Tabs */}
        <div className="mb-6 flex justify-between items-start">
          <div className="flex-1">
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
          <Button
            onClick={() => {
              loadRequests();
              loadRequestCounts();
            }}
            disabled={isProcessing}
            className="text-white transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`,
              boxShadow: `0 4px 6px -1px ${getThemeColor(500)}20`
            }}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Planifier */}
        {activeTab === "planifier" && (
          <Card className="mb-6 bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Planifier une visite</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Créer une demande pour un salarié (types autorisés: périodique, surveillance particulière, appel médecin, spontanée)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateByDoctor} className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label>Salarié</Label>
                  <EmployeeSelect value={selectedEmployee} onValueChange={(emp)=>{ setSelectedEmployee(emp); setPlanEmployeeId(emp?.id) }} />
                  <div className="mt-2">
                    <Button type="button" variant="outline" onClick={()=>setShowEmployeeInfo(true)} disabled={!planEmployeeId}>Afficher informations</Button>
                  </div>
                </div>
                <div>
                  <Label>Type de visite</Label>
                  <select className="w-full border rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value={planVisitType} onChange={(e)=>setPlanVisitType(e.target.value as any)}>
                    <option value="PERIODIQUE">Périodique</option>
                    <option value="SURVEILLANCE_PARTICULIERE">Surveillance particulière</option>
                    <option value="APPEL_MEDECIN">À l'appel du médecin</option>
                  </select>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Date souhaitée</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start", !planDueDate && 'text-slate-500') }>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {planDueDate ? planDueDate : 'Sélectionner la date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
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
                      <label className="flex items-center gap-2 text-sm"><input type="radio" name="moddoc" checked={proposeModality==='PRESENTIEL'} onChange={()=>setProposeModality('PRESENTIEL')} /> Présentiel</label>
                      <label className="flex items-center gap-2 text-sm"><input type="radio" name="moddoc" checked={proposeModality==='DISTANCE'} onChange={()=>setProposeModality('DISTANCE')} /> À distance</label>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label>Notes (optionnel)</Label>
                  <Textarea value={planNotes} onChange={(e)=>setPlanNotes(e.target.value)} placeholder="Consignes ou remarques" className="text-slate-900 dark:text-slate-100 placeholder:text-slate-400" />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={isProcessing || !planEmployeeId || !planDueDate || !proposeTime} className="text-white" style={{background:`linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`}}>Créer la demande</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Consulter */}
        {activeTab === "consulter" && (
        <>
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
                  placeholder="Rechercher par nom ou motif..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500"
                />
              </div>
              
              {/* Filter */}
              <div className="flex gap-2">
                <Button
                  variant={filter === "ALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("ALL")}
                  className={filter === "ALL" ? "text-white" : "border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"}
                  style={{
                    background: filter === "ALL" ? `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})` : undefined,
                    boxShadow: filter === "ALL" ? `0 4px 6px -1px ${getThemeColor(500)}20` : undefined
                  }}
                >
                  Tous ({requestCounts.ALL})
                </Button>
                <Button
                  variant={filter === "PENDING" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("PENDING")}
                  className={`transition-all duration-300 ${
                    filter === "PENDING" 
                      ? "text-white shadow-lg" 
                      : "border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"
                  }`}
                  style={{
                    background: filter === "PENDING" 
                      ? `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})` 
                      : isDark ? '#1e293b' : 'white',
                    boxShadow: filter === "PENDING" 
                      ? `0 4px 6px -1px ${getThemeColor(500)}20` 
                      : `0 2px 4px -1px ${getThemeColor(500)}10`
                  }}
                >
                  En attente ({requestCounts.PENDING})
                </Button>
                <Button
                  variant={filter === "PROPOSED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("PROPOSED")}
                  className={`transition-all duration-300 ${
                    filter === "PROPOSED" 
                      ? "text-white shadow-lg" 
                      : "border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"
                  }`}
                  style={{
                    background: filter === "PROPOSED" 
                      ? `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})` 
                      : isDark ? '#1e293b' : 'white',
                    boxShadow: filter === "PROPOSED" 
                      ? `0 4px 6px -1px ${getThemeColor(500)}20` 
                      : `0 2px 4px -1px ${getThemeColor(500)}10`
                  }}
                >
                  Proposés ({requestCounts.PROPOSED})
                </Button>
                <Button
                  variant={filter === "CONFIRMED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("CONFIRMED")}
                  className={`transition-all duration-300 ${
                    filter === "CONFIRMED" 
                      ? "text-white shadow-lg" 
                      : "border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"
                  }`}
                  style={{
                    background: filter === "CONFIRMED" 
                      ? `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})` 
                      : isDark ? '#1e293b' : 'white',
                    boxShadow: filter === "CONFIRMED" 
                      ? `0 4px 6px -1px ${getThemeColor(500)}20` 
                      : `0 2px 4px -1px ${getThemeColor(500)}10`
                  }}
                >
                  Confirmés ({requestCounts.CONFIRMED})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          {loadingRequests ? (
            <Card 
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700"
              style={{
                boxShadow: `0 10px 25px -3px ${getThemeColor(500)}10, 0 4px 6px -2px ${getThemeColor(500)}5`
              }}
            >
              <CardContent className="p-12 text-center">
                <Stethoscope className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Chargement des demandes...
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Veuillez patienter pendant le chargement des demandes de visite médicale spontanée.
                </p>
              </CardContent>
            </Card>
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
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300"
                style={{
                  boxShadow: `0 10px 25px -3px ${getThemeColor(500)}10, 0 4px 6px -2px ${getThemeColor(500)}5`
                }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Request Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-10 w-10 rounded-xl flex items-center justify-center shadow-md"
                            style={{
                              background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`
                            }}
                          >
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                              {request.employeeName}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {request.employeeDepartment}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(request.status)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {request.employeeName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon2 className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Soumis le {format(new Date(request.createdAt), "dd MMMM yyyy", { locale: fr })}
                        </span>
                      </div>

                      {/* Status specific info */}
                      {request.status === "PROPOSED" && (
                        <div 
                          className="p-3 border rounded-lg"
                          style={{
                            backgroundColor: isDark ? `${getThemeColor(900)}20` : `${getThemeColor(50)}`,
                            borderColor: isDark ? getThemeColor(700) : getThemeColor(200)
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4" style={{ color: getThemeColor(600) }} />
                            <span className="text-sm font-medium" style={{ color: getThemeColor(700) }}>
                              Créneau proposé :
                            </span>
                          </div>
                          <div className="text-sm" style={{ color: getThemeColor(600) }}>
                            {request.proposedDate && request.proposedTime && (
                              <>
                                {format(new Date(request.proposedDate), "dd MMMM yyyy", { locale: fr })} à {request.proposedTime}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Previous Proposals */}
                      {request.status === "PROPOSED" && request.previousProposals && request.previousProposals.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Propositions précédentes :</h4>
                          <div className="space-y-2">
                            {request.previousProposals.map((proposal, idx) => (
                              <div key={idx} className="text-xs text-slate-500 dark:text-slate-400 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                {format(new Date(proposal.proposedDate), "dd MMM yyyy", { locale: fr })} à {proposal.proposedTime}
                                {proposal.reason && ` - ${proposal.reason}`}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {request.status === "CONFIRMED" && (
                        <div 
                          className="p-3 border rounded-lg"
                          style={{
                            backgroundColor: "#d1fae5",
                            borderColor: "#10b981"
                          }}
                        >
                          <p className="text-sm font-medium" style={{ color: "#10b981" }}>
                            <strong style={{ color: "#059669" }}>Confirmé :</strong> {format(request.confirmedDate!, "PPP", { locale: fr })} à {request.confirmedTime}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      {request.status === "PENDING" && (
                        <>
                          {/* Only show Confirmer button for non-EMBAUCHE and non-REPRISE visits */}
                          {request.visitType !== 'EMBAUCHE' && request.visitType !== 'REPRISE' && (
                            <Button
                              onClick={() => handleConfirm(request.id)}
                              disabled={isProcessing}
                              className="w-full text-white hover:shadow-lg transition-all duration-300"
                              style={{
                                background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`,
                                boxShadow: `0 4px 6px -1px ${getThemeColor(500)}20`
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirmer
                            </Button>
                          )}
                          {/* Always show Proposer un créneau button for PENDING requests */}
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              // Auto-select previous slot if available
                              if (request.previousProposals && request.previousProposals.length > 0) {
                                const latestProposal = request.previousProposals[request.previousProposals.length - 1];
                                setProposeDate(new Date(latestProposal.proposedDate));
                                setProposeTime(latestProposal.proposedTime);
                              }
                            }}
                            className="w-full transition-all duration-300 text-white border-0"
                            style={{
                              background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`,
                              boxShadow: `0 4px 6px -1px ${getThemeColor(500)}20`
                            }}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            {request.previousProposals && request.previousProposals.length > 0 
                              ? `Proposer un ${request.previousProposals.length + 1}ème créneau`
                              : "Proposer un créneau"
                            }
                          </Button>
                          
                          {/* Always show Infos salarié button */}
                          <Button
                            variant="outline"
                            onClick={() => { setPlanEmployeeId(request.employeeId); setShowEmployeeInfo(true); }}
                            className="w-full transition-all duration-300 h-11 text-sm font-bold rounded-xl border-2 hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
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
                                      {rejectedProposal.proposedAt && (
                                        <div className="flex items-center gap-2 text-sm">
                                          <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
                                          <span className="text-red-700 dark:text-red-300">
                                            Rejeté le: {format(new Date(rejectedProposal.proposedAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                                          </span>
                                        </div>
                                      )}
                                      
                                      {rejectedProposal.reason && rejectedProposal.reason.trim() !== '' && (
                                        <div className="flex items-start gap-2 text-sm">
                                          <MessageSquare className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                                          <span className="text-red-700 dark:text-red-300">
                                            <strong>Raison du rejet:</strong> {rejectedProposal.reason}
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

                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsRejectedRequest(true);
                              // Pre-fill with current date/time for convenience
                              setProposeDate(new Date());
                              setProposeTime("09:00");
                            }}
                            className="w-full transition-all duration-300 h-11 text-sm font-bold rounded-xl border-2 hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
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
                              // Keep the request rejected - no action needed
                              toast({
                                title: "Demande maintenue rejetée",
                                description: "La demande reste rejetée. L'employé devra contacter le service médical.",
                              });
                            }}
                            className="w-full transition-all duration-300 h-11 text-sm font-bold rounded-xl border-2 hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
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

                      {request.status === "PROPOSED" && (
                        (() => {
                          const latest = request.previousProposals && request.previousProposals.length > 0
                            ? request.previousProposals[request.previousProposals.length - 1]
                            : undefined;
                          const ownPending = !!(latest && latest.status === 'PENDING' && latest.proposedBy && user?.username && latest.proposedBy.toLowerCase() === user.username.toLowerCase());
                          if (ownPending) {
                            return (
                              <div className="w-full text-center px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                                Proposé par vous
                              </div>
                            );
                          }
                          return (
                            <>
                              <Button
                                onClick={() => handleConfirm(request.id)}
                                disabled={isProcessing}
                                className="w-full text-white hover:shadow-lg transition-all duration-300"
                                style={{
                                  background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`,
                                  boxShadow: `0 4px 6px -1px ${getThemeColor(500)}20`
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirmer la proposition
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  if (request.previousProposals && request.previousProposals.length > 0) {
                                    const latestProposal = request.previousProposals[request.previousProposals.length - 1];
                                    setProposeDate(new Date(latestProposal.proposedDate));
                                    setProposeTime(latestProposal.proposedTime);
                                  }
                                }}
                                className="w-full text-white transition-all duration-300"
                                style={{
                                  background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`,
                                  boxShadow: `0 4px 12px -2px ${getThemeColor(500)}25`
                                }}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                {request.previousProposals && request.previousProposals.length > 0 
                                  ? `Proposer un ${request.previousProposals.length + 1}ème créneau`
                                  : "Proposer un autre créneau"
                                }
                              </Button>
                            </>
                          );
                        })()
                      )}

                                                {request.status === "CONFIRMED" && (
                              <div className="text-center">
                                <CheckCircle className="h-8 w-8 mx-auto mb-2" style={{ color: "#10b981" }} />
                                <p className="text-sm font-medium" style={{ color: "#10b981" }}>
                                  Rendez-vous confirmé
                                </p>
                              </div>
                            )}
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

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
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
                  <RadioGroupItem id="mod-pres-doc" value="PRESENTIEL" />
                  <Label htmlFor="mod-pres-doc" className="text-slate-900 dark:text-slate-100">Présentiel</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="mod-dist-doc" value="DISTANCE" />
                  <Label htmlFor="mod-dist-doc" className="text-slate-900 dark:text-slate-100">À distance</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="confirm-instr-doc" className="text-slate-900 dark:text-slate-100 font-medium">Consignes (optionnel)</Label>
              <Textarea 
                id="confirm-instr-doc" 
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

            {/* Consignes + Modalité */}
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
                <RadioGroup className="flex gap-6 mt-2" value={proposeModality} onValueChange={(v)=>setProposeModality(v as 'PRESENTIEL'|'DISTANCE')}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="prop-pres-doc" value="PRESENTIEL" />
                    <Label htmlFor="prop-pres-doc">Présentiel</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="prop-dist-doc" value="DISTANCE" />
                    <Label htmlFor="prop-dist-doc">À distance</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSelectedRequest(null)}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-black hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Annuler
            </Button>
            <Button 
              onClick={() => {
                if (selectedRequest && proposeDate && proposeTime) {
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
    </div>
  )
} 