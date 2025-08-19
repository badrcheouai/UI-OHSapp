"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { EmployeeInfoDialog } from "@/components/EmployeeInfoDialog"
import { EmployeeSelect } from "@/components/EmployeeSelect"
import { useToast } from "@/hooks/use-toast"
import { medicalVisitAPI, MedicalVisitRequest } from "@/lib/api"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, Stethoscope, Filter, Search, User, Mail, RefreshCw, Hourglass } from "lucide-react"
import { EnhancedCalendar } from "@/components/enhanced-calendar"

export default function RhVisitesPage() {
  const { user, loading, logout } = useAuth()
  const { themeColors } = useTheme()
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<"planifier"|"consulter">("planifier")
  const [employeeId, setEmployeeId] = useState<number | undefined>(undefined)
  const [selectedEmployee, setSelectedEmployee] = useState<any | undefined>(undefined)
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date(); d.setDate(d.getDate()+15); return d.toISOString().split('T')[0]
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [createType, setCreateType] = useState<'EMBAUCHE'|'REPRISE'>('EMBAUCHE')
  const [repriseCase, setRepriseCase] = useState<"AT_MP"|"ACCIDENT_MALADIE_HORS_AT_MP"|"ABSENCES_REPETEES"|"">("")
  const [repriseDialogOpen, setRepriseDialogOpen] = useState(false)
  const [repriseDetails, setRepriseDetails] = useState("")
  const [showEmployeeInfo, setShowEmployeeInfo] = useState(false)
  const [selectedEmployeeForInfo, setSelectedEmployeeForInfo] = useState<number | null>(null)

  const [requests, setRequests] = useState<MedicalVisitRequest[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [deptFilter, setDeptFilter] = useState<string>("")
  const [search, setSearch] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingList, setLoadingList] = useState(false)

  useEffect(() => {
    // Only redirect if not loading, no user, and not in logout process
    if (!loading && !user) {
      console.log("🔄 RH Visites: User not authenticated, redirecting to login")
      router.replace("/login")
    }
  }, [user, loading, router])

  const isRh = user?.roles?.includes("RH") || user?.roles?.includes("RESP_RH") || user?.roles?.includes("ADMIN")
  if (loading) return null
  if (!isRh) return null

  const loadAll = async () => {
    setLoadingList(true)
    try {
      const res = await medicalVisitAPI.getAllRequests()
      setRequests(res.data)
    } catch {
      setRequests([])
    } finally {
      setLoadingList(false)
    }
  }
  useEffect(() => { loadAll() }, [])

  const filtered = useMemo(() => {
    return requests.filter(r => {
      const okStatus = statusFilter === 'ALL' || r.status === statusFilter
      const okType = typeFilter === 'ALL' || r.visitType === typeFilter
      const okDept = !deptFilter || (r.employeeDepartment||'').toLowerCase().includes(deptFilter.toLowerCase())
      const okSearch = !search || (r.employeeName + ' ' + r.motif).toLowerCase().includes(search.toLowerCase())
      return okStatus && okType && okDept && okSearch
    })
  }, [requests, statusFilter, typeFilter, deptFilter, search])

  const createEmbauche = async () => {
    if (!employeeId) { toast({ title: "Salarié requis", variant: "destructive" }); return }
    setIsSubmitting(true)
    try {
      await medicalVisitAPI.createRequest({
        motif: notes || "Visite d'embauche",
        dateSouhaitee: new Date().toISOString().split('T')[0],
        heureSouhaitee: "09:00",
        notes: notes || undefined,
        visitType: 'EMBAUCHE',
        dueDate,
      }, employeeId)
      toast({ title: "Demande créée" })
      setNotes("")
      await loadAll()
      setActiveTab("consulter")
    } catch (e) {
      toast({ title: "Erreur", description: "Création impossible", variant: "destructive" })
    } finally { setIsSubmitting(false) }
  }

  const createReprise = async () => {
    if (!employeeId || !repriseCase) { toast({ title: "Champs requis", variant: "destructive" }); return }
    setIsSubmitting(true)
    try {
      await medicalVisitAPI.createRequest({
        motif: notes || "Visite de reprise",
        dateSouhaitee: new Date().toISOString().split('T')[0],
        heureSouhaitee: "09:00",
        notes: notes || undefined,
        visitType: 'REPRISE',
        dueDate,
        repriseCategory: repriseCase,
        repriseDetails: repriseDetails || undefined,
      }, employeeId)
      toast({ title: "Demande créée" })
      setNotes("")
      setRepriseDetails("")
      setRepriseDialogOpen(false)
      await loadAll()
      setActiveTab("consulter")
    } catch (e) {
      toast({ title: "Erreur", description: "Création impossible", variant: "destructive" })
    } finally { setIsSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950">
      <DashboardNavigation userRole={user!.roles[0]} currentPage="rh-visites" />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-2xl" 
                 style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[700]})`}}>
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            Visites médicales (RH)
          </h1>
          <div className="flex justify-center">
            <div className="flex gap-2 p-1.5 bg-white/95 dark:bg-slate-800/95 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl backdrop-blur-sm">
              <button 
                onClick={() => setActiveTab("planifier")}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === "planifier" 
                    ? "text-white shadow-2xl" 
                    : "border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
                style={activeTab === "planifier" ? {
                  background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
                  boxShadow: `0 8px 25px -3px ${themeColors.colors.primary[500]}40, 0 4px 6px -2px ${themeColors.colors.primary[500]}20`
                } : {}}
              >
                Planifier
              </button>
              <button 
                onClick={() => setActiveTab("consulter")}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === "consulter" 
                    ? "text-white shadow-2xl" 
                    : "border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
                style={activeTab === "consulter" ? {
                  background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
                  boxShadow: `0 8px 25px -3px ${themeColors.colors.primary[500]}40, 0 4px 6px -2px ${themeColors.colors.primary[500]}20`
                } : {}}
              >
                Consulter
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'planifier' && (
          <>
            <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200/60 dark:border-slate-700/60">
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Créer une demande</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 text-base">Sélectionnez le type puis complétez les informations.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Type</Label>
                  <Select value={createType} onValueChange={(v: any)=>setCreateType(v)}>
                    <SelectTrigger className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Choisir le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMBAUCHE">Embauche</SelectItem>
                      <SelectItem value="REPRISE">Reprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Date limite</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 shadow-sm hover:shadow-md"
                      >
                        {dueDate ? format(new Date(dueDate), 'dd/MM/yyyy') : 'Sélectionner une date'}
                        <Calendar className="h-4 w-4 opacity-70" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-transparent border-0 shadow-none calendar-popover z-[9999]">
                      <EnhancedCalendar
                        selectedDate={dueDate ? new Date(dueDate) : null}
                        onDateSelect={(date) => {
                          setDueDate(format(date, 'yyyy-MM-dd'))
                          setIsCalendarOpen(false)
                        }}
                        minDate={new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Salarié</Label>
                  <EmployeeSelect 
                    value={selectedEmployee}
                    onValueChange={(emp) => {
                      setSelectedEmployee(emp)
                      setEmployeeId(emp?.id)
                    }}
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={()=>setShowEmployeeInfo(true)} 
                      disabled={!employeeId} 
                      className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      Afficher informations
                    </Button>
                  </div>
                </div>
                {createType === 'REPRISE' && (
                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Cas de reprise</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Button 
                        variant={repriseCase==='AT_MP'?'default':'outline'} 
                        onClick={()=>{setRepriseCase('AT_MP'); setRepriseDialogOpen(true)}}
                        className={`transition-all duration-300 ${
                          repriseCase==='AT_MP' 
                            ? 'text-white shadow-lg' 
                            : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                        style={repriseCase==='AT_MP' ? {background:`linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`} : {}}
                      >
                        AT/MP
                      </Button>
                      <Button 
                        variant={repriseCase==='ACCIDENT_MALADIE_HORS_AT_MP'?'default':'outline'} 
                        onClick={()=>{setRepriseCase('ACCIDENT_MALADIE_HORS_AT_MP'); setRepriseDialogOpen(true)}}
                        className={`transition-all duration-300 ${
                          repriseCase==='ACCIDENT_MALADIE_HORS_AT_MP' 
                            ? 'text-white shadow-lg' 
                            : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                        style={repriseCase==='ACCIDENT_MALADIE_HORS_AT_MP' ? {background:`linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`} : {}}
                      >
                        Accident/Maladie hors AT/MP
                      </Button>
                      <Button 
                        variant={repriseCase==='ABSENCES_REPETEES'?'default':'outline'} 
                        onClick={()=>{setRepriseCase('ABSENCES_REPETEES'); setRepriseDialogOpen(true)}}
                        className={`transition-all duration-300 ${
                          repriseCase==='ABSENCES_REPETEES' 
                            ? 'text-white shadow-lg' 
                            : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                        style={repriseCase==='ABSENCES_REPETEES' ? {background:`linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`} : {}}
                      >
                        Absences répétées
                      </Button>
                    </div>
                  </div>
                )}
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Notes (optionnel)</Label>
                  <Textarea 
                    value={notes} 
                    onChange={(e)=>setNotes(e.target.value)} 
                    placeholder="Remarques..." 
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md resize-none" 
                    rows={4}
                  />
                </div>
                <div className="md:col-span-2 flex justify-center pt-4">
                  <Button
                    disabled={!employeeId || isSubmitting || (createType==='REPRISE' && !repriseCase)}
                    onClick={() => createType==='EMBAUCHE' ? createEmbauche() : createReprise()}
                    className="text-white px-10 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                    style={{background:`linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`}}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <Stethoscope className="h-5 w-5 mr-2" />
                        Créer la demande
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'consulter' && (
          <>
            <Card className="mb-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200/60 dark:border-slate-700/60">
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  Filtres de recherche
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid gap-4 md:grid-cols-4">
                <div className="relative space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Rechercher</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      className="pl-9 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-lg" 
                      placeholder="Rechercher..." 
                      value={search} 
                      onChange={(e)=>setSearch(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Statut</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-lg">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tous</SelectItem>
                      <SelectItem value="PENDING">En attente</SelectItem>
                      <SelectItem value="PROPOSED">Proposé</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                      <SelectItem value="CANCELLED">Annulé</SelectItem>
                      <SelectItem value="REJECTED">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-lg">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tous</SelectItem>
                      <SelectItem value="EMBAUCHE">Embauche</SelectItem>
                      <SelectItem value="REPRISE">Reprise</SelectItem>
                      <SelectItem value="PERIODIQUE">Périodique</SelectItem>
                      <SelectItem value="SURVEILLANCE_PARTICULIERE">Surveillance</SelectItem>
                      <SelectItem value="APPEL_MEDECIN">Appel médecin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Département</Label>
                  <Input 
                    placeholder="Département" 
                    value={deptFilter} 
                    onChange={(e)=>setDeptFilter(e.target.value)} 
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-lg" 
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {loadingList ? (
                <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-xl border-0">
                  <CardContent className="p-12 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-slate-500">
                      <div 
                        className="animate-spin rounded-full h-12 w-12 border-b-2"
                        style={{ borderColor: themeColors.colors.primary[500] }}
                      ></div>
                      <span className="text-lg font-medium">Chargement des demandes...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : filtered.length === 0 ? (
                <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-xl border-0">
                  <CardContent className="p-12 text-center">
                    <Stethoscope className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Aucune demande trouvée
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {search || statusFilter !== "ALL" || typeFilter !== "ALL" || deptFilter
                        ? "Aucune demande ne correspond à vos critères de recherche."
                        : "Aucune demande de visite médicale enregistrée."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filtered.map(r => (
                  <Card 
                    key={r.id} 
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
                                  background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[600]})`
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`
                                  e.currentTarget.style.transform = 'scale(1.15) rotate(5deg)'
                                  e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(0,0,0,0.3)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[600]})`
                                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
                                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.2)'
                                }}
                              >
                                <User className="h-5 w-5 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                              </div>
                              <div className="space-y-3">
                        <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                                    {r.employeeName}
                                  </h3>
                                  {/* Date next to name */}
                                  <div 
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer"
                                    style={{
                                      background: `linear-gradient(135deg, #fef3c7, #fde68a)`,
                                      color: '#92400e',
                                      boxShadow: `0 4px 12px -4px #f59e0b30`
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = 'linear-gradient(135deg, #fde68a, #fbbf24)'
                                      e.currentTarget.style.transform = 'translateY(-1px) rotate(1deg)'
                                      e.currentTarget.style.boxShadow = '0 6px 20px -4px #f59e0b50'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'linear-gradient(135deg, #fef3c7, #fde68a)'
                                      e.currentTarget.style.transform = 'translateY(0) rotate(0deg)'
                                      e.currentTarget.style.boxShadow = '0 4px 12px -4px #f59e0b30'
                                    }}
                                  >
                                    Demandé le {format(new Date(r.createdAt), 'dd/MM/yyyy', { locale: fr })}
                                  </div>
                                </div>
                                {/* Email under the name */}
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-200/50 border cursor-pointer"
                                    style={{
                                      background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                                      borderColor: '#fecaca',
                                      color: '#dc2626',
                                      boxShadow: '0 2px 8px -2px #fecaca40'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2, #fecaca)'
                                      e.currentTarget.style.transform = 'translateY(-2px)'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'linear-gradient(135deg, #fef2f2, #fee2e2)'
                                      e.currentTarget.style.transform = 'translateY(0)'
                                    }}
                                  >
                                    <Mail className="h-3 w-3 transition-transform duration-300 hover:rotate-12" />
                                    <span className="font-semibold">
                                      {r.employeeEmail || `${r.employeeDepartment?.toLowerCase()}@ohse.com`}
                                    </span>
                                  </div>
                                </div>
                                {/* Visit Type with improved label design */}
                                <div className="flex items-center gap-2">
                                  <span 
                                    className="px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wide transition-all duration-300"
                                    style={{
                                      background: `linear-gradient(135deg, ${themeColors.colors.primary[50]}, ${themeColors.colors.primary[100]})`,
                                      color: themeColors.colors.primary[700],
                                      boxShadow: `0 2px 6px -2px ${themeColors.colors.primary[500]}15`
                                    }}
                                  >
                                    Type de visite médicale :
                                  </span>
                                  {r.visitType && (
                                    <span 
                                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold shadow-md transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-blue-200/50 cursor-pointer"
                                      style={{
                                        background: `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`,
                                        color: themeColors.colors.primary[800],
                                        boxShadow: `0 4px 12px -4px ${themeColors.colors.primary[500]}30`
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = `linear-gradient(135deg, ${themeColors.colors.primary[200]}, ${themeColors.colors.primary[300]})`
                                        e.currentTarget.style.transform = 'translateY(-1px) rotate(1deg)'
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`
                                        e.currentTarget.style.transform = 'translateY(0) rotate(0deg)'
                                      }}
                                    >
                                      {r.visitType === 'SPONTANEE' ? 'Spontanée' :
                                       r.visitType === 'PERIODIQUE' ? 'Périodique' :
                                       r.visitType === 'SURVEILLANCE_PARTICULIERE' ? 'Surveillance particulière' :
                                       r.visitType === 'APPEL_MEDECIN' ? "À l'appel du médecin" :
                                       r.visitType === 'REPRISE' ? 'Reprise' :
                                       r.visitType === 'EMBAUCHE' ? 'Embauche' : r.visitType}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {/* Status Badge */}
                              <div className="relative">
                                <span
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border transition-all duration-300 hover:scale-110 hover:shadow-2xl cursor-pointer ${
                                    r.status === 'CONFIRMED'
                                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400 shadow-green-500/25'
                                      : r.status === 'PROPOSED'
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-blue-500/25'
                                        : r.status === 'PENDING'
                                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400 shadow-amber-500/25'
                                          : r.status === 'CANCELLED' || r.status === 'REJECTED'
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400 shadow-red-500/25'
                                            : 'bg-gradient-to-r from-slate-500 to-slate-600 text-white border-slate-400 shadow-slate-500/25'
                                  }`}
                                  onMouseEnter={(e) => {
                                    if (r.status === 'CONFIRMED') {
                                      e.currentTarget.style.background = 'linear-gradient(to right, #059669, #047857)'
                                      e.currentTarget.style.transform = 'translateY(-2px) rotate(2deg)'
                                    } else if (r.status === 'PROPOSED') {
                                      e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #1e40af)'
                                      e.currentTarget.style.transform = 'translateY(-2px) rotate(2deg)'
                                    } else if (r.status === 'PENDING') {
                                      e.currentTarget.style.background = 'linear-gradient(to right, #d97706, #b45309)'
                                      e.currentTarget.style.transform = 'translateY(-2px) rotate(2deg)'
                                    } else if (r.status === 'CANCELLED' || r.status === 'REJECTED') {
                                      e.currentTarget.style.background = 'linear-gradient(to right, #dc2626, #b91c1c)'
                                      e.currentTarget.style.transform = 'translateY(-2px) rotate(2deg)'
                                    } else {
                                      e.currentTarget.style.background = 'linear-gradient(to right, #475569, #334155)'
                                      e.currentTarget.style.transform = 'translateY(-2px) rotate(2deg)'
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (r.status === 'CONFIRMED') {
                                      e.currentTarget.style.background = 'linear-gradient(to right, #10b981, #059669)'
                                      e.currentTarget.style.transform = 'translateY(0) rotate(0deg)'
                                    } else if (r.status === 'PROPOSED') {
                                      e.currentTarget.style.background = 'linear-gradient(to right, #3b82f6, #1d4ed8)'
                                      e.currentTarget.style.transform = 'translateY(0) rotate(0deg)'
                                    } else if (r.status === 'PENDING') {
                                      e.currentTarget.style.background = 'linear-gradient(to right, #f59e0b, #d97706)'
                                      e.currentTarget.style.transform = 'translateY(0) rotate(0deg)'
                                    } else if (r.status === 'CANCELLED' || r.status === 'REJECTED') {
                                      e.currentTarget.style.background = 'linear-gradient(to right, #ef4444, #dc2626)'
                                      e.currentTarget.style.transform = 'translateY(0) rotate(0deg)'
                                    } else {
                                      e.currentTarget.style.background = 'linear-gradient(to right, #64748b, #475569)'
                                      e.currentTarget.style.transform = 'translateY(0) rotate(0deg)'
                                    }
                                  }}
                                >
                                  {r.status === 'CONFIRMED' ? '✅ Confirmé' : 
                                   r.status === 'PROPOSED' ? '🔄 Proposé' : 
                                   r.status === 'PENDING' ? (
                                     <>
                                       <Hourglass className="h-3 w-3 animate-spin" style={{ animationDuration: '2s' }} />
                                       En attente
                                     </>
                                   ) :
                                   r.status === 'CANCELLED' ? '❌ Annulé' :
                                   r.status === 'REJECTED' ? '❌ Rejeté' : r.status}
                                </span>
                                <div className={`absolute -inset-1 rounded-lg blur-sm opacity-20 transition-all duration-300 group-hover:opacity-30 ${
                                  r.status === 'CONFIRMED' ? 'bg-green-500' :
                                  r.status === 'PROPOSED' ? 'bg-blue-500' : 
                                  r.status === 'PENDING' ? 'bg-amber-500' :
                                  r.status === 'CANCELLED' || r.status === 'REJECTED' ? 'bg-red-500' : 'bg-slate-500'
                                }`}></div>
                              </div>
                            </div>
                          </div>

                          {/* Motif Section - Enhanced */}
                          <div 
                            className="p-3 rounded-lg shadow-md border-0 transition-all duration-300 hover:shadow-xl hover:scale-[1.03] cursor-pointer group/motif"
                            style={{
                              background: `linear-gradient(135deg, ${themeColors.colors.primary[50]}, ${themeColors.colors.primary[100]})`,
                              boxShadow: `0 4px 15px -4px ${themeColors.colors.primary[500]}20`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`
                              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = `linear-gradient(135deg, ${themeColors.colors.primary[50]}, ${themeColors.colors.primary[100]})`
                              e.currentTarget.style.transform = 'translateY(0) scale(1)'
                            }}
                          >
                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-2 transition-colors duration-300 group-hover/motif:text-slate-600 dark:group-hover/motif:text-slate-200">
                              <div className="w-1.5 h-1.5 rounded-full transition-all duration-300 group-hover/motif:scale-150 group-hover/motif:rotate-180" style={{ backgroundColor: themeColors.colors.primary[500] }}></div>
                              Motif de la visite
                            </h4>
                            <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold leading-relaxed transition-colors duration-300 group-hover/motif:text-slate-800 dark:group-hover/motif:text-slate-100">
                              {r.motif}
                            </p>
                          </div>

                          {/* Consignes Section - Display instructions from nurse/doctor */}
                          {r.notes && (
                            <div 
                              className="p-3 rounded-lg shadow-md border-0 transition-all duration-300 hover:shadow-xl hover:scale-[1.03] cursor-pointer group/consignes"
                              style={{
                                background: `linear-gradient(135deg, #f0f9ff, #e0f2fe)`,
                                boxShadow: `0 4px 15px -4px #0ea5e920`
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `linear-gradient(135deg, #e0f2fe, #bae6fd)`
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = `linear-gradient(135deg, #f0f9ff, #e0f2fe)`
                                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                              }}
                            >
                              <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wider flex items-center gap-2 transition-colors duration-300 group-hover/consignes:text-blue-600 dark:group-hover/consignes:text-blue-200">
                                <div className="w-1.5 h-1.5 rounded-full transition-all duration-300 group-hover/consignes:scale-150 group-hover/consignes:rotate-180" style={{ backgroundColor: '#0ea5e9' }}></div>
                                📋 Consignes médicales
                              </h4>
                              <p className="text-blue-900 dark:text-blue-100 text-sm font-semibold leading-relaxed transition-colors duration-300 group-hover/consignes:text-blue-800 dark:group-hover/consignes:text-blue-100">
                                {r.notes}
                              </p>
                            </div>
                          )}

                          {/* Due Date Section - Enhanced */}
                          {r.dueDate && (
                            <div 
                              className="p-3 rounded-lg shadow-md border-0 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer group/due"
                              style={{
                                background: `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`,
                                boxShadow: `0 4px 15px -4px ${themeColors.colors.primary[500]}25`
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `linear-gradient(135deg, ${themeColors.colors.primary[200]}, ${themeColors.colors.primary[300]})`
                                e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`
                                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                              }}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-5 w-5 rounded-md bg-white/30 flex items-center justify-center transition-all duration-300 group-hover/due:scale-110">
                                  <Calendar className="h-3 w-3" style={{ color: themeColors.colors.primary[700] }} />
                                </div>
                                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColors.colors.primary[800] }}>
                                  Échéance
                                </h4>
                              </div>
                              <p className="text-sm font-bold" style={{ color: themeColors.colors.primary[800] }}>
                                {format(new Date(r.dueDate), "dd MMM yyyy", { locale: fr })}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 min-w-[200px]">
                      <Button 
                        variant="outline" 
                            onClick={() => {
                              setSelectedEmployeeForInfo(r.employeeId)
                              setShowEmployeeInfo(true)
                            }}
                            className="w-full transition-all duration-500 h-11 text-sm font-bold rounded-xl border-2 hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                            style={{
                              borderColor: themeColors.colors.primary[300],
                              color: themeColors.colors.primary[700],
                              background: `linear-gradient(135deg, ${themeColors.colors.primary[50]}, ${themeColors.colors.primary[100]})`,
                              boxShadow: `0 4px 12px -4px ${themeColors.colors.primary[500]}20`
                            }}
                          >
                            <User className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                        Infos salarié
                      </Button>
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

      {/* Reprise details dialog */}
      <Dialog open={repriseDialogOpen} onOpenChange={setRepriseDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border-0">
          <DialogHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200/60 dark:border-slate-700/60">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Détails du cas de reprise</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">Ajoutez les informations spécifiques (vous pourrez affiner plus tard).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 font-medium">Détails</Label>
              <Textarea 
                value={repriseDetails} 
                onChange={(e)=>setRepriseDetails(e.target.value)} 
                placeholder="Décrivez les circonstances…" 
                className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md resize-none"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/60 dark:border-slate-700/60">
            <Button 
              variant="outline" 
              onClick={()=>setRepriseDialogOpen(false)}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-300"
            >
              Fermer
            </Button>
            <Button 
              onClick={createReprise} 
              className="text-white shadow-lg hover:shadow-xl transition-all duration-300"
              style={{background:`linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`}}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EmployeeInfoDialog open={showEmployeeInfo} onOpenChange={setShowEmployeeInfo} employeeId={selectedEmployeeForInfo || 0} />
    </div>
  )
}


