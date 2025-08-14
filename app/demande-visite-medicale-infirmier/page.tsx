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
  Search
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
    if (!planEmployeeId) {
      toast({ title: "Salarié requis", description: "Veuillez saisir l'ID du salarié.", variant: "destructive" })
      return
    }
    setIsProcessing(true)
    try {
      const created = await medicalVisitAPI.createRequest({
        motif: planNotes || `Demande ${planVisitType.toLowerCase()}`,
        dateSouhaitee: new Date().toISOString().split('T')[0],
        heureSouhaitee: proposeTime || "09:00",
        notes: planNotes || undefined,
        visitType: planVisitType,
        dueDate: planDueDate || undefined,
      }, planEmployeeId)
      // For non-spontanée types, immediately propose a slot so the salarié can accept/refuse
      try {
        if (planVisitType !== 'SPONTANEE') {
          await medicalVisitAPI.proposeSlot(created.data.id, {
            proposedDate: (planDueDate || new Date().toISOString().split('T')[0]),
            proposedTime: (proposeTime || '09:00'),
            reason: planNotes || 'Créneau proposé',
            proposedBy: user?.username || 'Infirmier',
            modality: proposeModality,
          })
          toast({ title: "Proposition envoyée", description: "Le salarié sera notifié pour accepter ou refuser." })
        } else {
          toast({ title: "Demande créée", description: "La demande a été créée avec succès." })
        }
      } catch (err) {
        console.error('Error proposing slot after creation', err)
      }
      setPlanNotes("")
      setPlanDueDate("")
      await loadRequests();
      await loadRequestCounts();
      setActiveTab("consulter")
    } catch (err) {
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
          <Badge 
            variant="secondary" 
            className="text-slate-800 dark:text-slate-200"
            style={{
              backgroundColor: isDark ? `${getThemeColor(900)}40` : `${getThemeColor(100)}`,
              borderColor: isDark ? getThemeColor(700) : getThemeColor(300)
            }}
          >
            En attente
          </Badge>
        )
      case "PROPOSED":
        return (
          <Badge 
            variant="secondary" 
            className="text-slate-800 dark:text-slate-200"
            style={{
              backgroundColor: isDark ? `${getThemeColor(900)}40` : `${getThemeColor(100)}`,
              borderColor: isDark ? getThemeColor(700) : getThemeColor(300)
            }}
          >
            Proposé
          </Badge>
        )
      case "CONFIRMED":
        return (
          <Badge 
            variant="secondary" 
            className="text-slate-800 dark:text-slate-200"
            style={{
              backgroundColor: isDark ? `${getThemeColor(900)}40` : `${getThemeColor(100)}`,
              borderColor: isDark ? getThemeColor(700) : getThemeColor(300)
            }}
          >
            Confirmé
          </Badge>
        )
      default:
        return <Badge variant="secondary">Inconnu</Badge>
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

  const handlePropose = async (requestId: number, newDate: Date, newTime: string, reason?: string, modality?: 'PRESENTIEL'|'DISTANCE') => {
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
      await medicalVisitAPI.proposeSlot(requestId, {
        proposedDate: newDate.toISOString().split('T')[0],
        proposedTime: newTime,
        reason: reason || "Nouveau créneau proposé",
        proposedBy: user?.username || "Infirmier",
        modality
      });
      await loadRequests();
      toast({
        title: "Nouvelle proposition",
        description: "Une nouvelle proposition a été envoyée à l'employé. Vous pouvez continuer à proposer d'autres créneaux si nécessaire.",
        variant: "default",
      })
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

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filter === "ALL" || request.status === filter
    const matchesType = typeFilter === "ALL" || request.visitType === typeFilter
    const matchesSearch =
      request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.motif.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <EnhancedCalendar selectedDate={planDueDate ? new Date(planDueDate) : null} onDateSelect={(d)=>setPlanDueDate(d?.toISOString().split('T')[0] || '')} minDate={new Date()} />
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
                  <Button type="submit" disabled={isProcessing || !planEmployeeId || !planDueDate} className="text-white" style={{background:`linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`}}>Créer la demande</Button>
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
                  placeholder="Rechercher par nom ou motif..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500"
                />
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
                          {request.visitType && (
                            <div className="mt-1">
                              <span
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                  background: `linear-gradient(135deg, ${getThemeColor(100)}, ${getThemeColor(200)})`,
                                  color: `${getThemeColor(800)}`
                                }}
                              >
                                {request.visitType}
                              </span>
                            </div>
                          )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Status pill */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              request.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : request.status === 'PROPOSED'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}
                          >
                            {request.status === 'CONFIRMED' ? 'Confirmé' : request.status === 'PROPOSED' ? 'Proposé' : 'En attente'}
                          </span>
                          {/* Type pill */}
                          {request.visitType && (
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                background: isDark ? `${getThemeColor(900)}30` : `${getThemeColor(100)}`,
                                color: isDark ? getThemeColor(300) : getThemeColor(800)
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

                      <div>
                        <p className="text-slate-900 dark:text-slate-100 font-medium mb-1">
                          Motif : {request.motif}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <CalendarIcon2 className="h-4 w-4" />
                            {format(new Date(request.dateSouhaitee), "PPP", { locale: fr })}
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {request.heureSouhaitee}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {format(new Date(request.createdAt), "PP", { locale: fr })}
                          </div>
                        </div>
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
                          <p className="text-sm font-medium" style={{ color: getThemeColor(700) }}>
                            <strong style={{ color: getThemeColor(800) }}>Proposition actuelle :</strong> {format(new Date(request.proposedDate!), "PPP", { locale: fr })} à {request.proposedTime}
                          </p>
                        </div>
                      )}

                                         {/* Previous Proposals */}
                       {request.status === "PROPOSED" && request.previousProposals && request.previousProposals.length > 0 && (
                         <div className="mt-3">
                           <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Propositions précédentes :</h4>
                           <div className="space-y-2">
                             {request.previousProposals.map((proposal, index) => (
                               <div 
                                 key={index}
                                 className="p-3 border rounded-lg text-xs"
                                 style={{
                                   backgroundColor: isDark ? `${getThemeColor(900)}15` : `${getThemeColor(50)}`,
                                   borderColor: isDark ? getThemeColor(700) : getThemeColor(200)
                                 }}
                               >
                                 <p className="font-medium" style={{ color: getThemeColor(700) }}>
                                   <strong>Proposition {index + 1} :</strong> {format(new Date(proposal.proposedDate), "PPP", { locale: fr })} à {proposal.proposedTime}
                                 </p>
                                 <p className="text-xs mt-1" style={{ color: getThemeColor(600) }}>
                                   Proposée le {format(new Date(proposal.proposedAt), "PP", { locale: fr })}
                                 </p>
                                 {proposal.reason && (
                                   <p className="text-xs mt-1 italic" style={{ color: getThemeColor(600) }}>
                                     <strong>Raison :</strong> {proposal.reason}
                                   </p>
                                 )}
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
                            <strong style={{ color: "#059669" }}>Confirmé :</strong> {format(new Date(request.confirmedDate!), "PPP", { locale: fr })} à {request.confirmedTime}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      {request.status === "PENDING" && (
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
                            Confirmer
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedRequest(request)}
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
                                onClick={() => setSelectedRequest(request)}
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

      <EmployeeInfoDialog open={showEmployeeInfo} onOpenChange={setShowEmployeeInfo} employeeId={planEmployeeId} />

      {/* Propose New Slot Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Proposer un nouveau créneau
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Proposez une nouvelle date et heure pour {selectedRequest?.employeeName}
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
                if (selectedRequest && proposeDate && proposeTime) {
                  handlePropose(selectedRequest.id, proposeDate, proposeTime, proposeReason, proposeModality)
                  setSelectedRequest(null)
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
              {isProcessing ? "Proposition..." : "Proposer le créneau"}
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
    </div>
  )
} 
