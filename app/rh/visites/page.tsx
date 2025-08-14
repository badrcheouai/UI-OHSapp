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
import { Calendar, Stethoscope, Filter, Search, User } from "lucide-react"
import { EnhancedCalendar } from "@/components/enhanced-calendar"

export default function RhVisitesPage() {
  const { user, loading } = useAuth()
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

  const [requests, setRequests] = useState<MedicalVisitRequest[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [deptFilter, setDeptFilter] = useState<string>("")
  const [search, setSearch] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingList, setLoadingList] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace("/login")
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
                      className="pl-9 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md" 
                      placeholder="Rechercher..." 
                      value={search} 
                      onChange={(e)=>setSearch(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Statut</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md">
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
                    <SelectTrigger className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md">
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
                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md" 
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {loadingList ? (
                <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-lg">
                  <CardContent className="p-8 flex items-center justify-center">
                    <div className="flex items-center gap-3 text-slate-500">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span className="text-lg">Chargement…</span>
                    </div>
                  </CardContent>
                </Card>
              ) : filtered.length === 0 ? (
                <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="text-slate-500 text-lg">Aucune demande trouvée</div>
                    <p className="text-slate-400 mt-2">Essayez de modifier vos critères de recherche</p>
                  </CardContent>
                </Card>
              ) : (
                filtered.map(r => (
                  <Card key={r.id} className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white text-lg">{r.employeeName}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">{r.employeeDepartment}</div>
                          </div>
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 font-medium">{r.motif}</div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Demandé le {format(new Date(r.createdAt), 'dd/MM/yyyy', { locale: fr })}
                          </span>
                          {r.dueDate && (
                            <span className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Échéance {format(new Date(r.dueDate), 'dd/MM/yyyy', { locale: fr })}
                            </span>
                          )}
                          {r.visitType && (
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium">
                              {r.visitType}
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            r.status === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                            r.status === 'PROPOSED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            r.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            r.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            r.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={()=>setShowEmployeeInfo(true)}
                        className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Infos salarié
                      </Button>
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

      <EmployeeInfoDialog open={showEmployeeInfo} onOpenChange={setShowEmployeeInfo} employeeId={employeeId} />
    </div>
  )
}


