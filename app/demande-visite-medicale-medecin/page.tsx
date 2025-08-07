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
  RefreshCw
} from "lucide-react"
import { format } from "date-fns"
import { fr, enUS } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { DashboardNavigation } from "@/components/dashboard-navigation"
import { useToast } from "@/hooks/use-toast"
import { medicalVisitAPI, MedicalVisitRequest } from "@/lib/api"

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
  const [proposeDate, setProposeDate] = useState<Date | null>(null)
  const [proposeTime, setProposeTime] = useState("")
  const [proposeReason, setProposeReason] = useState("")
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [requestCounts, setRequestCounts] = useState({
    ALL: 0,
    PENDING: 0,
    PROPOSED: 0,
    CONFIRMED: 0,
    CANCELLED: 0,
    REJECTED: 0
  });

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
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En attente</Badge>
      case "PROPOSED":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Proposé</Badge>
      case "CONFIRMED":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Confirmé</Badge>
      case "CANCELLED":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Annulé</Badge>
      case "REJECTED":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejeté</Badge>
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  const handleConfirm = async (requestId: number) => {
    setIsProcessing(true)
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;
      
      await medicalVisitAPI.confirmRequest(requestId, {
        confirmedDate: request.dateSouhaitee,
        confirmedTime: request.heureSouhaitee,
        notes: "Confirmé par le médecin"
      });
      
      // Reload requests to get updated data
      await loadRequests();
      await loadRequestCounts();
      
      toast({
        title: "Demande confirmée",
        description: "La demande de visite médicale a été confirmée avec succès.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error confirming request:", error);
      toast({
        title: "Erreur",
        description: "Impossible de confirmer la demande.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePropose = async (requestId: number, newDate: Date, newTime: string, reason?: string) => {
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
        proposedBy: user?.username || "Médecin"
      });
      
      // Reload requests to get updated data
      await loadRequests();
      await loadRequestCounts();
      
      toast({
        title: "Créneau proposé",
        description: "Un nouveau créneau a été proposé avec succès.",
        variant: "default",
      });
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
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Gestion des demandes de visite médicale
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Gérez les demandes de visite médicale des employés
            </p>
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
                  Veuillez patienter pendant le chargement des demandes de visite médicale.
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
                    : "Aucune demande de visite médicale en attente."
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
                        </>
                      )}

                      {request.status === "PROPOSED" && (
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
                              // Auto-select previous slot if available
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
      </div>

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
                Raison du changement (optionnel)
              </Label>
              <Textarea
                id="propose-reason"
                placeholder="Ex: Créneau plus adapté, disponibilité du médecin, urgence..."
                value={proposeReason}
                onChange={(e) => setProposeReason(e.target.value)}
                className="min-h-[80px] resize-none bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500"
              />
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
                  handlePropose(selectedRequest.id, proposeDate, proposeTime, proposeReason)
                  setSelectedRequest(null)
                  setProposeDate(null)
                  setProposeTime("")
                  setProposeReason("")
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
    </div>
  )
} 