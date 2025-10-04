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
import { Calendar, Stethoscope, Filter, Search, User, Mail, RefreshCw, Hourglass, Phone, Upload, FileText, X, Info } from "lucide-react"
import { EnhancedCalendar } from "@/components/enhanced-calendar"
import RepriseVisitInfoBox from "@/components/RepriseVisitInfoBox"

export default function RhVisitesPage() {
  const { user, loading, logout, accessToken } = useAuth()
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
  const [repriseCase, setRepriseCase] = useState<
    | "ACCIDENT_TRAVAIL"
    | "MALADIE_PROFESSIONNELLE"
    | "ACCIDENT_HORS_ATMP"
    | "MALADIE_HORS_ATMP"
    | "ABSENCES_REPETEES"
    | "ACCOUCHEMENT"
    | ""
  >("")
  const [dateAccident, setDateAccident] = useState<string>("")
  const [ittDays, setIttDays] = useState<string>("")
  const [absenceDuration, setAbsenceDuration] = useState<string>("")
  const [motifReprise, setMotifReprise] = useState<string>("")
  const [showEmployeeInfo, setShowEmployeeInfo] = useState(false)
  const [selectedEmployeeForInfo, setSelectedEmployeeForInfo] = useState<number | null>(null)

  // Certificate upload state for REPRISE
  const [certificateFiles, setCertificateFiles] = useState<File[]>([])
  const [isUploadingCertificate, setIsUploadingCertificate] = useState(false)

  // REPRISE info dialog state
  const [repriseInfoDialogOpen, setRepriseInfoDialogOpen] = useState(false)
  const [selectedRequestForCertificates, setSelectedRequestForCertificates] = useState<MedicalVisitRequest | null>(null)

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
      // RH should not search by motif; restrict to employee name
      const okSearch = !search || (r.employeeName || '').toLowerCase().includes(search.toLowerCase())
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
    // Validate dynamic required fields
    if (repriseCase === 'ACCIDENT_TRAVAIL' || repriseCase === 'MALADIE_PROFESSIONNELLE') {
      if (!dateAccident || !ittDays) {
        toast({ title: "Champs requis", description: "Date d'accident et ITT sont requis", variant: "destructive" });
        return;
      }
    } else {
      if (!absenceDuration) {
        toast({ title: "Champs requis", description: "Durée de l'absence est requise", variant: "destructive" });
        return;
      }
    }
    setIsSubmitting(true)
    try {
      // Create the visit request first
      const dynamicMotif = (() => {
        if (repriseCase === 'ACCIDENT_TRAVAIL' || repriseCase === 'MALADIE_PROFESSIONNELLE') {
          const cinText = selectedEmployee?.cin ? ` | CIN: ${selectedEmployee.cin}` : ''
          const lib = repriseCase === 'ACCIDENT_TRAVAIL' ? 'Accident du travail' : 'Maladie professionnelle'
          return `Reprise (${lib}) | Date: ${dateAccident} | ITT: ${ittDays} jours${cinText}`
        }
        const label =
          repriseCase === 'ACCIDENT_HORS_ATMP' ? 'Accident hors AT/MP' :
          repriseCase === 'MALADIE_HORS_ATMP' ? 'Maladie hors AT/MP' :
          repriseCase === 'ABSENCES_REPETEES' ? 'Absences répétées' : 'Accouchement'
        const motifText = motifReprise?.trim() ? ` | Motif: ${motifReprise.trim()}` : ''
        return `Reprise (${label}) | Durée absence: ${absenceDuration} jours${motifText}`
      })()
      const visitRequest = await medicalVisitAPI.createRequest({
        motif: dynamicMotif,
        dateSouhaitee: new Date().toISOString().split('T')[0],
        heureSouhaitee: "09:00",
        notes: undefined,
        visitType: 'REPRISE',
        dueDate,
        repriseCategory: repriseCase,
        repriseDetails: (repriseCase === 'ACCIDENT_TRAVAIL' || repriseCase === 'MALADIE_PROFESSIONNELLE')
          ? `date=${dateAccident};itt=${ittDays}`
          : (absenceDuration ? `absence=${absenceDuration}` : undefined),
      }, employeeId)
      
      // Upload certificates if any
      if (certificateFiles.length > 0) {
        setIsUploadingCertificate(true);
        for (let i = 0; i < certificateFiles.length; i++) {
          const formData = new FormData();
          formData.append('file', certificateFiles[i]);
          formData.append('visitRequestId', visitRequest.data.id.toString());
          formData.append('employeeId', employeeId.toString());
          formData.append('description', '');
          formData.append('certificateType', 'CERTIFICAT_MEDICAL');
          
          try {
            const headers: Record<string, string> = {};
            if (accessToken) {
              headers['Authorization'] = `Bearer ${accessToken}`;
            }

            await fetch('/api/v1/medical-certificates/upload', {
              method: 'POST',
              headers,
              body: formData,
            });
          } catch (error) {
            console.error('Error uploading certificate:', error);
            toast({ title: "Attention", description: "Erreur lors de l'upload d'un certificat", variant: "destructive" });
          }
        }
        setIsUploadingCertificate(false);
      }
      
      toast({ title: "Demande créée" })
      setNotes("")
      setCertificateFiles([])
      await loadAll()
      setActiveTab("consulter")
    } catch (e) {
      toast({ title: "Erreur", description: "Création impossible", variant: "destructive" })
    } finally { 
      setIsSubmitting(false)
      setIsUploadingCertificate(false)
    }
  }

  const handleAddCertificate = () => {
    const fileInput = document.getElementById('certificate-file') as HTMLInputElement;
    
    if (fileInput?.files?.[0]) {
      const file = fileInput.files[0];
      
      setCertificateFiles(prev => [...prev, file]);
      
      // Clear the form
      fileInput.value = '';
      
      toast({ title: "Certificat ajouté", description: "Le certificat a été ajouté à la liste" });
    } else {
      toast({ title: "Erreur", description: "Veuillez sélectionner un fichier", variant: "destructive" });
    }
  };

  const handleRemoveCertificate = (index: number) => {
    setCertificateFiles(prev => prev.filter((_, i) => i !== index));
    toast({ title: "Certificat supprimé", description: "Le certificat a été retiré de la liste" });
  };

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
                {(user?.roles?.includes('INFIRMIER_ST') || user?.roles?.includes('MEDECIN_TRAVAIL')) && (createType==='REPRISE' || createType==='EMBAUCHE') && (
                  <div className="md:col-span-2 -mt-1 mb-2 p-3 rounded-lg border text-xs"
                       style={{background:'#fff1f2', borderColor:'#fecdd3', color:'#9f1239'}}>
                    Veuillez à ne pas dépasser la date limite définie ({dueDate ? format(new Date(dueDate), 'dd/MM/yyyy') : '—'}) lors de cette visite.
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Date limite</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={`w-full justify-between bg-white dark:bg-slate-700 border text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 shadow-sm hover:shadow-md ${
                          (createType==='REPRISE' || createType==='EMBAUCHE') ? 'border-red-400 text-red-700 dark:text-red-400' : 'border-slate-200 dark:border-slate-600'
                        }`}
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
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Absences pour :</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { key: 'ACCIDENT_TRAVAIL', label: 'Accident du travail' },
                        { key: 'MALADIE_PROFESSIONNELLE', label: 'Maladie professionnelle' },
                        { key: 'ACCIDENT_HORS_ATMP', label: 'Accident hors AT/MP' },
                        { key: 'MALADIE_HORS_ATMP', label: 'Maladie hors AT/MP' },
                        { key: 'ABSENCES_REPETEES', label: 'Absences répétées' },
                        { key: 'ACCOUCHEMENT', label: 'Accouchement' },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setRepriseCase(opt.key as any)}
                          className={`relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 border-2 ${
                            repriseCase === opt.key
                              ? 'border-transparent text-white shadow-xl scale-[1.02]'
                              : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:shadow-md'
                          }`}
                          style={
                            repriseCase === opt.key
                              ? { background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})` }
                              : { background: `linear-gradient(135deg, ${themeColors.colors.primary[50]}, ${themeColors.colors.primary[100]})` }
                          }
                        >
                          <div className="font-semibold mb-1">{opt.label}</div>
                          {repriseCase === opt.key && (
                            <span className="absolute top-2 right-2 text-xs bg-white/20 rounded px-2 py-0.5">Choisi</span>
                          )}
                        </button>
                      ))}
                    </div>
                    {/* Dynamic fields by case */}
                    {repriseCase === 'ACCIDENT_TRAVAIL' || repriseCase === 'MALADIE_PROFESSIONNELLE' ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className={`w-full justify-start text-left font-normal bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600 focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 ${!dateAccident ? 'text-slate-500 dark:text-slate-400' : ''}`}
                              >
                                <Calendar className="h-4 w-4 mr-2 opacity-70" />
                                {dateAccident ? format(new Date(dateAccident), 'PPP', { locale: fr }) : 'Sélectionner une date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-lg rounded-lg z-[99999] calendar-popover" align="start">
                              <EnhancedCalendar
                                selectedDate={dateAccident ? new Date(dateAccident) : null}
                                onDateSelect={(d)=> setDateAccident(format(d, 'yyyy-MM-dd'))}
                                minDate={new Date(2000,0,1)}
                                maxDate={new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">
                            CIN{selectedEmployee ? ` — ${selectedEmployee.firstName} ${selectedEmployee.lastName}` : ''}
                          </Label>
                          <Input 
                            value={selectedEmployee?.cin || ''}
                            readOnly
                            title={selectedEmployee?.cin ? `CIN de ${selectedEmployee.firstName} ${selectedEmployee.lastName}` : 'Sélectionnez un salarié'}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-semibold cursor-default focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">ITT (jours) *</Label>
                          <Input type="number" min={1} value={ittDays} onChange={(e)=>setIttDays(e.target.value)} className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500" />
                        </div>
                      </div>
                    ) : repriseCase ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Durée de l'absence (jours) *</Label>
                          <Input 
                            type="number" 
                            min={1} 
                            value={absenceDuration} 
                            onChange={(e)=>setAbsenceDuration(e.target.value)} 
                            className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500"
                            placeholder="Ex: 10"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Motif</Label>
                          <Textarea 
                            value={motifReprise} 
                            onChange={(e)=>setMotifReprise(e.target.value)} 
                            rows={3} 
                            className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500" 
                            placeholder="Saisissez le motif..." 
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
                
                {/* Certificate Upload Section for REPRISE - show only after a non AT/MP case is selected */}
                {createType === 'REPRISE' && repriseCase && repriseCase !== 'ACCIDENT_TRAVAIL' && repriseCase !== 'MALADIE_PROFESSIONNELLE' && (
                  <div className="md:col-span-2 space-y-4">
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                      <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <div className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg" style={{
                            background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`
                          }}>
                            <Upload className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            Certificats médicaux
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Ajoutez les certificats médicaux nécessaires pour la visite de reprise
                          </p>
                        </div>
                        
                        {/* File Upload */}
                        <div className="space-y-4 max-w-md mx-auto">
                          <div>
                            <Label htmlFor="certificate-file" className="text-slate-700 dark:text-slate-300 font-medium">
                              Sélectionner un fichier
                            </Label>
                            <Input
                              id="certificate-file"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.gif"
                              className="mt-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Formats acceptés : PDF, JPEG, JPG, PNG, GIF (max 10MB)
                            </p>
                          </div>
                          
                          <Button
                            onClick={handleAddCertificate}
                            variant="outline"
                            className="w-full transition-all duration-300"
                            style={{
                              borderColor: themeColors.colors.primary[300],
                              color: themeColors.colors.primary[700],
                              background: `linear-gradient(135deg, ${themeColors.colors.primary[50]}, ${themeColors.colors.primary[100]})`
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Ajouter le certificat
                          </Button>
                        </div>
                        
                        {/* Uploaded Files Preview */}
                        <div className="mt-6">
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Certificats ajoutés : <span className="font-semibold" style={{color: themeColors.colors.primary[600]}}>{certificateFiles.length}</span>
                          </div>
                          
                          {certificateFiles.length > 0 && (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {certificateFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{
                                      background: `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`
                                    }}>
                                      <FileText className="h-4 w-4" style={{color: themeColors.colors.primary[600]}} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {file.name}
                                      </p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveCertificate(index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Removed generic details field per new rules */}
                <div className="md:col-span-2 flex justify-center pt-4">
                  <Button
                    disabled={!employeeId || isSubmitting || isUploadingCertificate || (createType==='REPRISE' && !repriseCase)}
                    onClick={() => createType==='EMBAUCHE' ? createEmbauche() : createReprise()}
                    className="text-white px-10 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                    style={{background:`linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`}}
                  >
                    {isSubmitting || isUploadingCertificate ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        {isUploadingCertificate ? 'Upload des certificats...' : 'Création en cours...'}
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
                      <SelectItem value="APPEL_MEDECIN">À l'appel du médecin</SelectItem>
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
                  <Card key={r.id} className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-sm">
                    <CardContent className="p-4 md:p-5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{background:`linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`}}>
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{r.employeeName}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Demandé le {format(new Date(r.createdAt), 'dd/MM/yyyy', { locale: fr })}</div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg border shadow-sm" style={{
                              background: `linear-gradient(135deg, ${themeColors.colors.primary[50]}, ${themeColors.colors.primary[100]})`,
                              borderColor: themeColors.colors.primary[300],
                              boxShadow: `0 2px 4px -2px ${themeColors.colors.primary[500]}20`
                            }}>
                              📅 Date visite: {format(new Date(r.dateSouhaitee), 'dd/MM/yyyy', { locale: fr })}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-slate-700 dark:text-slate-300" style={{
                                background: `linear-gradient(135deg, ${themeColors.colors.primary[50]}, ${themeColors.colors.primary[100]})`,
                                borderColor: themeColors.colors.primary[300],
                                boxShadow: `0 2px 4px -2px ${themeColors.colors.primary[500]}20`
                              }}>
                                <Phone className="h-3 w-3" />
                                📱 +212 6 41 79 85 43
                              </span>
                              {r.visitType && (
                                <span className="px-2 py-1 rounded-full" style={{background:`linear-gradient(135deg, ${themeColors.colors.primary[50]}, ${themeColors.colors.primary[100]})`, color: themeColors.colors.primary[800]}}>
                                  {r.visitType === 'SPONTANEE' ? 'Spontanée' : r.visitType === 'PERIODIQUE' ? 'Périodique' : r.visitType === 'SURVEILLANCE_PARTICULIERE' ? 'Surveillance particulière' : r.visitType === 'APPEL_MEDECIN' ? "À l'appel du médecin" : r.visitType === 'REPRISE' ? 'Reprise' : r.visitType === 'EMBAUCHE' ? 'Embauche' : r.visitType}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border-2 ${
                            r.status === 'CONFIRMED' ? 'border-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-200 shadow-emerald-200/50 dark:shadow-emerald-800/30' :
                            r.status === 'PROPOSED' ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-200 shadow-blue-200/50 dark:shadow-blue-800/30' :
                            r.status === 'PENDING' ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-200 shadow-amber-200/50 dark:shadow-amber-800/30' :
                            'border-slate-500 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/30 text-slate-700 dark:text-slate-200 shadow-slate-200/50 dark:shadow-slate-800/30'
                          }`}>
                            {r.status === 'CONFIRMED' ? 'Confirmé' : r.status === 'PROPOSED' ? 'Proposé' : r.status === 'PENDING' ? 'En attente' : r.status}
                          </span>
                          <Button
                            variant="outline"
                            onClick={() => { setSelectedEmployeeForInfo(r.employeeId); setShowEmployeeInfo(true); }}
                            className="border-slate-300 dark:border-slate-600"
                          >
                            Infos salarié
                          </Button>
                          
                          {/* Show REPRISE info button for REPRISE visits */}
                          {r.visitType === 'REPRISE' && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedRequestForCertificates(r)
                                setRepriseInfoDialogOpen(true)
                              }}
                              className="border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            >
                              <Info className="h-4 w-4 mr-2" />
                              Voir détails reprise
                            </Button>
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

      <EmployeeInfoDialog open={showEmployeeInfo} onOpenChange={setShowEmployeeInfo} employeeId={selectedEmployeeForInfo || 0} />



      {/* REPRISE Info Box Dialog */}
      <Dialog open={repriseInfoDialogOpen} onOpenChange={setRepriseInfoDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[900px] max-h-[85vh] overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Détails de la visite de reprise
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Informations complètes sur la demande de visite médicale de reprise
            </DialogDescription>
          </DialogHeader>
          {selectedRequestForCertificates && (
            <RepriseVisitInfoBox
              visitRequest={{
                id: selectedRequestForCertificates.id,
                employeeName: selectedRequestForCertificates.employeeName,
                employeeEmail: selectedRequestForCertificates.employeeEmail ?? '',
                motif: selectedRequestForCertificates.motif,
                dateSouhaitee: selectedRequestForCertificates.dateSouhaitee,
                heureSouhaitee: selectedRequestForCertificates.heureSouhaitee,
                status: selectedRequestForCertificates.status,
                visitType: selectedRequestForCertificates.visitType ?? '',
                repriseCategory: selectedRequestForCertificates.repriseCategory || '',
                repriseDetails: selectedRequestForCertificates.repriseDetails || '',
                hasMedicalCertificates: selectedRequestForCertificates.hasMedicalCertificates || false,
                createdAt: selectedRequestForCertificates.createdAt
              }}
              onClose={() => setRepriseInfoDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


