"use client"

import { useState } from "react"
import { useTheme } from "@/contexts/ThemeContext"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  Calendar, 
  Clock, 
  User, 
  Building, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Clock as ClockIcon,
  Trash2
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import { MedicalVisitRequest as APIMedicalVisitRequest, medicalVisitAPI } from "@/lib/api"

interface MedicalVisitRequest {
  id: string
  status: "pending" | "proposed" | "confirmed" | "rejected" | "cancelled"
  employeeName: string
  reason: string
  dateSouhaitee: Date
  proposedDate?: Date
  proposedTime?: string
  confirmedDate?: Date
  confirmedTime?: string
  department: string
  notes: string
  modality?: 'PRESENTIEL' | 'DISTANCE'
  previousProposals?: Array<{
    proposedDate: string
    proposedTime: string
    proposedAt: string
    reason?: string
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
    proposedBy: string
  }>
}

interface MedicalVisitStatusProps {
  request: MedicalVisitRequest | APIMedicalVisitRequest
  onProposeNewSlot?: () => void
  onCancelRequest?: () => void
  onConfirmRequest?: () => Promise<void>
  onResetRequest?: () => Promise<void>
  showCancelButton?: boolean
  showHistory?: boolean
}

// Helper function to convert API data to component format
const convertAPIRequestToComponentFormat = (apiRequest: APIMedicalVisitRequest): MedicalVisitRequest => {
  return {
    id: apiRequest.id.toString(),
    status: apiRequest.status.toLowerCase() as "pending" | "proposed" | "confirmed" | "rejected" | "cancelled",
    employeeName: apiRequest.employeeName,
    reason: apiRequest.motif,
    dateSouhaitee: new Date(apiRequest.dateSouhaitee),
    proposedDate: apiRequest.proposedDate ? new Date(apiRequest.proposedDate) : undefined,
    proposedTime: apiRequest.proposedTime,
    confirmedDate: apiRequest.confirmedDate ? new Date(apiRequest.confirmedDate) : undefined,
    confirmedTime: apiRequest.confirmedTime,
    department: apiRequest.employeeDepartment,
    notes: apiRequest.notes || "",
    modality: apiRequest.modality,
    previousProposals: apiRequest.previousProposals?.map(proposal => ({
      proposedDate: proposal.proposedDate,
      proposedTime: proposal.proposedTime,
      proposedAt: proposal.proposedAt,
      reason: proposal.reason || "",
      status: proposal.status || "PENDING",
      proposedBy: proposal.proposedBy || ""
    }))
  }
}

export function MedicalVisitStatus({ request, onProposeNewSlot, onCancelRequest, onConfirmRequest, onResetRequest, showCancelButton = true, showHistory = true }: MedicalVisitStatusProps) {
  // Convert API request to component format if needed
  const componentRequest = 'employeeId' in request ? convertAPIRequestToComponentFormat(request) : request
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isSubmittingReject, setIsSubmittingReject] = useState(false)
  const { themeColors } = useTheme()
  const { toast } = useToast()
  const { isDark } = useTheme()

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          color: "bg-slate-500",
          text: "En attente",
          description: "Votre demande est en cours de traitement"
        }
      case "proposed":
        return {
          icon: ClockIcon,
          color: "bg-orange-500",
          text: "Créneau proposé",
          description: "Un créneau vous a été proposé"
        }
      case "confirmed":
        return {
          icon: CheckCircle,
          color: "bg-green-500",
          text: "Confirmé",
          description: "Votre rendez-vous est confirmé"
        }
      case "rejected":
        return {
          icon: XCircle,
          color: "bg-red-500",
          text: "Rejeté",
          description: "Votre demande a été rejetée"
        }
      case "cancelled":
        return {
          icon: Trash2,
          color: "bg-gray-500",
          text: "Annulé",
          description: "Votre demande a été annulée"
        }
      default:
        return {
          icon: AlertCircle,
          color: "bg-gray-500",
          text: "Inconnu",
          description: "Statut inconnu"
        }
    }
  }



  const statusInfo = getStatusInfo(componentRequest.status)

  return (
    <div className="space-y-6">
      {/* Enhanced Status Card */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg`} style={{
                background: isDark ? themeColors.colors.primary[900] : themeColors.colors.primary[100]
              }}>
                <statusInfo.icon className={`h-6 w-6 ${isDark ? 'text-white' : 'text-primary-700'}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {statusInfo.text}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {statusInfo.description}
                </p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`border-2 px-4 py-2 text-sm font-semibold ${
                componentRequest.status === "pending" ? "border-slate-500 bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300" :
                componentRequest.status === "proposed" ? "border-orange-500 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300" :
                componentRequest.status === "confirmed" ? "border-green-600 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" :
                componentRequest.status === "rejected" ? "border-red-600 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" :
                componentRequest.status === "cancelled" ? "border-gray-600 bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300" :
                "border-gray-600 bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300"
              }`}
            >
              {componentRequest.status.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Request Details */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Détails de la demande</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Employé</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{componentRequest.employeeName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Building className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Département</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{componentRequest.department}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Raison</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{componentRequest.reason}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Date souhaitée</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{format(componentRequest.dateSouhaitee, "PPP", { locale: fr })}</p>
                </div>
              </div>
            </div>
          </div>
          {(componentRequest.notes || (componentRequest as any).modality || (componentRequest as any).proposedModality) && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mt-0.5">
                  <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  {((componentRequest as any).modality || (componentRequest as any).proposedModality) && (
                    <p className="text-sm mb-1 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">Modalité:</span> {((componentRequest as any).modality || (componentRequest as any).proposedModality) === 'DISTANCE' ? 'À distance' : 'Présentiel'}
                    </p>
                  )}
                  {componentRequest.notes && (
                    <>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">Consignes</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{componentRequest.notes}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important note for Pending Status */}
      {componentRequest.status === "pending" && (
        <Card className="border-slate-200 dark:border-slate-700 shadow-md bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm text-amber-900 dark:text-amber-100">
                <p className="font-medium mb-1">Information importante</p>
                <p>Votre demande est en cours d'examen par le service médical. Vous serez notifié(e) dès confirmation.</p>
                <p className="mt-2">Pour toute urgence, contactez directement le service au {" "}
                  <a href="tel:+212641798543" className="font-semibold underline text-amber-900 dark:text-amber-200">+212 6 41 79 85 43</a>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Proposed Slot (if status is proposed) */}
      {componentRequest.status === "proposed" && componentRequest.proposedDate && (
        <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Créneau proposé</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Date proposée</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{format(componentRequest.proposedDate, "PPP", { locale: fr })}</p>
                </div>
              </div>
              {componentRequest.proposedTime && (
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-orange-700">
                  <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Heure proposée</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{componentRequest.proposedTime}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Confirmed Slot (if status is confirmed) */}
      {componentRequest.status === "confirmed" && (
        <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Rendez-vous confirmé</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-700">
                <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Date confirmée</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {componentRequest.confirmedDate ? format(componentRequest.confirmedDate, "PPP", { locale: fr }) : 
                     componentRequest.proposedDate ? format(componentRequest.proposedDate, "PPP", { locale: fr }) : 
                     "À confirmer"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-700">
                <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Heure confirmée</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {componentRequest.confirmedTime || componentRequest.proposedTime || "À confirmer"}
                  </p>
                </div>
              </div>
              {((componentRequest as any).modality || (componentRequest as any).proposedModality) && (
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-700 md:col-span-2">
                  <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Modalité</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{((componentRequest as any).modality || (componentRequest as any).proposedModality) === 'DISTANCE' ? 'À distance' : 'Présentiel'}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        {/* Reset Button for Development Testing */}
        {process.env.NODE_ENV === 'development' && (
          <Button
            variant="outline"
            onClick={async () => {
              if (confirm("Êtes-vous sûr de vouloir supprimer TOUTES vos demandes de visite médicale ? (Mode développement)")) {
                // Call the reset callback if provided
                if (onResetRequest) {
                  await onResetRequest()
                }
              }
            }}
            className="px-4 py-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg text-sm font-medium transition-colors"
          >
            <Clock className="h-5 w-5 mr-2" />
            <span>Reset (Dev)</span>
          </Button>
        )}

        {/* Action Buttons for Proposed Status - Employees can only Accept/Reject */}
        {componentRequest.status === "proposed" && (
          <>
            <Button
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
              onClick={async () => {
                try {
                  // Call the accept API
                  await medicalVisitAPI.acceptProposal(parseInt(componentRequest.id))
                  toast({
                    title: "Proposition acceptée",
                    description: "Votre rendez-vous de visite médicale a été confirmé.",
                    variant: "default",
                  })
                  // Reload the page to update the status
                  window.location.reload()
                } catch (error) {
                  console.error("Error accepting proposal:", error)
                  toast({
                    title: "Erreur",
                    description: "Une erreur est survenue lors de l'acceptation.",
                    variant: "destructive",
                  })
                }
              }}
            >
              <CheckCircle className="h-5 w-5 mr-3" />
              <span className="font-semibold">Accepter</span>
            </Button>
            <Button
              variant="destructive"
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              onClick={() => setIsRejectDialogOpen(true)}
            >
              <XCircle className="h-5 w-5 mr-3" />
              <span className="font-semibold">Refuser</span>
            </Button>
          </>
        )}

      {/* Reject Proposal Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la proposition</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du refus (optionnel).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Ex: Le créneau ne me convient pas"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Annuler</Button>
            <Button
              disabled={isSubmittingReject}
              onClick={async () => {
                try {
                  setIsSubmittingReject(true)
                  await medicalVisitAPI.rejectProposal(parseInt(componentRequest.id), rejectReason || "Refusé par l'employé")
                  toast({
                    title: "Proposition refusée",
                    description: "Votre refus a été transmis au service médical.",
                  })
                  setIsRejectDialogOpen(false)
                  window.location.reload()
                } catch (error) {
                  console.error("Error rejecting proposal:", error)
                  toast({ title: "Erreur", description: "Une erreur est survenue lors du refus.", variant: "destructive" })
                } finally {
                  setIsSubmittingReject(false)
                }
              }}
            >
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>

      {/* Previous Proposals History */}
      {showHistory && componentRequest.previousProposals && componentRequest.previousProposals.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Historique des propositions</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            
            {isExpanded && (
              <div className="space-y-3">
                {(componentRequest.previousProposals ?? []).map((proposal, index, arr) => {
                  // Determine proposer role
                  let proposerLabel = "";
                  if (proposal.proposedBy) {
                    if (
                      proposal.proposedBy === componentRequest.employeeName
                    ) {
                      proposerLabel = "Salarié";
                    } else if (proposal.proposedBy.toLowerCase().includes("infirmier")) {
                      proposerLabel = "Infirmier";
                    } else if (proposal.proposedBy.toLowerCase().includes("medecin") || proposal.proposedBy.toLowerCase().includes("doctor")) {
                      proposerLabel = "Médecin";
                    } else {
                      proposerLabel = proposal.proposedBy;
                    }
                  }
                  // Compute label and color based on position/status
                  const isReplaced = proposal.status === "PENDING" && index !== arr.length - 1;
                  const displayStatusLabel = proposal.status === "PENDING" 
                    ? (isReplaced ? "Remplacé" : "En attente") 
                    : proposal.status === "ACCEPTED" 
                      ? "Accepté" 
                      : proposal.status === "REJECTED" 
                        ? "Rejeté" 
                        : proposal.status;
                  const colorClass = proposal.status === "PENDING" 
                    ? (isReplaced ? "text-gray-500" : "text-slate-600") 
                    : proposal.status === "ACCEPTED" 
                      ? "text-green-600" 
                      : proposal.status === "REJECTED" 
                        ? "text-red-600" 
                        : "text-slate-500";
                  return (
                    <div key={index} className={`flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg ${proposerLabel === "Salarié" ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400" : "bg-slate-50 dark:bg-slate-800"}`}>
                      <div className="flex items-center gap-3 mb-2 md:mb-0">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${proposerLabel === "Salarié" ? "bg-blue-200 text-blue-800" : proposerLabel === "Infirmier" ? "bg-green-200 text-green-800" : proposerLabel === "Médecin" ? "bg-orange-200 text-orange-800" : "bg-slate-200 text-slate-800"}`}>{proposerLabel}</span>
                        <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {proposal.proposedDate ? format(new Date(proposal.proposedDate), "dd/MM/yyyy", { locale: fr }) : "-"} à {proposal.proposedTime || "-"}
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        {proposal.reason && (
                          <span className="text-xs italic text-slate-500 dark:text-slate-400">{proposal.reason}</span>
                        )}
                        <span className={`text-xs font-semibold ${colorClass}`}>
                          {displayStatusLabel}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {proposal.proposedAt ? format(new Date(proposal.proposedAt), "dd/MM/yy", { locale: fr }) : "-"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 

// Utilities
function generateRandomMoroccanPhone(): string {
  // Moroccan mobile numbers typically start with +2126 or +2127 (or 06/07 locally)
  const prefixes = ["+2126", "+2127"]
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  let rest = ""
  for (let i = 0; i < 8; i += 1) {
    rest += Math.floor(Math.random() * 10).toString()
  }
  return `${prefix}${rest}`
}