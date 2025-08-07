"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  Bell,
  Stethoscope,
  Activity,
  Clock3,
  CalendarDays,
  MapPin
} from "lucide-react"

interface Appointment {
  id: number
  type: string
  status: string
  requestedDate: string
  proposedDate?: string
  scheduledTime?: string
  reason: string
  priority: string
  isUrgent: boolean
  location?: string
  comments: any[]
  employee: {
    firstName: string
    lastName: string
    email: string
  }
  nurse?: {
    firstName: string
    lastName: string
  }
  doctor?: {
    firstName: string
    lastName: string
  }
}

export default function AppointmentsPage() {
  const { user, loading, accessToken } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateAppointment, setShowCreateAppointment] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  // Form states
  const [newAppointment, setNewAppointment] = useState({
    type: "",
    reason: "",
    requestedDate: "",
    requestedTime: "",
    isUrgent: false,
    priority: "MEDIUM",
    preferredTimeSlots: [] as string[],
    flexibleSchedule: false,
    location: "",
    notes: ""
  })

  useEffect(() => {
    if (!loading && user) {
      fetchAppointments()
    } else if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("http://localhost:8081/api/v1/appointments/my-appointments", {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      const data = await response.json()
      setAppointments(data.content || data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createAppointment = async () => {
    try {
      const appointmentData = {
        type: newAppointment.type,
        reason: newAppointment.reason,
        requestedDate: `${newAppointment.requestedDate}T${newAppointment.requestedTime}:00`,
        isUrgent: newAppointment.isUrgent,
        priority: newAppointment.priority,
        preferredTimeSlots: newAppointment.preferredTimeSlots,
        flexibleSchedule: newAppointment.flexibleSchedule,
        location: newAppointment.location,
        notes: newAppointment.notes
      }

      const response = await fetch("http://localhost:8081/api/v1/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(appointmentData)
      })
      
      if (response.ok) {
        setShowCreateAppointment(false)
        setNewAppointment({
          type: "",
          reason: "",
          requestedDate: "",
          requestedTime: "",
          isUrgent: false,
          priority: "MEDIUM",
          preferredTimeSlots: [],
          flexibleSchedule: false,
          location: "",
          notes: ""
        })
        fetchAppointments()
      }
    } catch (error) {
      console.error("Error creating appointment:", error)
    }
  }

  const confirmAppointment = async (appointmentId: number) => {
    try {
      const response = await fetch(`http://localhost:8081/api/v1/appointments/${appointmentId}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      
      if (response.ok) {
        fetchAppointments()
      }
    } catch (error) {
      console.error("Error confirming appointment:", error)
    }
  }

  const cancelAppointment = async (appointmentId: number, reason: string) => {
    try {
      const response = await fetch(`http://localhost:8081/api/v1/appointments/${appointmentId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ reason })
      })
      
      if (response.ok) {
        fetchAppointments()
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return <Badge variant="secondary">Demandé</Badge>
      case "PROPOSED":
        return <Badge variant="outline">Proposé</Badge>
      case "CONFIRMED":
        return <Badge variant="default">Confirmé</Badge>
      case "COMPLETED":
        return <Badge variant="default" className="bg-green-600">Terminé</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">Annulé</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "LOW":
        return <Badge variant="outline">Basse</Badge>
      case "MEDIUM":
        return <Badge variant="secondary">Normale</Badge>
      case "HIGH":
        return <Badge variant="default">Élevée</Badge>
      case "URGENT":
        return <Badge variant="destructive">Urgente</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mb-4"></div>
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const pendingAppointments = appointments.filter(a => a.status === "REQUESTED" || a.status === "PROPOSED")
  const confirmedAppointments = appointments.filter(a => a.status === "CONFIRMED")
  const completedAppointments = appointments.filter(a => a.status === "COMPLETED")
  const cancelledAppointments = appointments.filter(a => a.status === "CANCELLED")

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Mes Rendez-vous
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Gérez vos rendez-vous médicaux et demandes de visite
              </p>
            </div>
            <Button onClick={() => setShowCreateAppointment(true)} className="ohse-btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Demande
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="ohse-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAppointments.length}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Demandes en cours
              </p>
            </CardContent>
          </Card>

          <Card className="ohse-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedAppointments.length}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Rendez-vous confirmés
              </p>
            </CardContent>
          </Card>

          <Card className="ohse-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminés</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedAppointments.length}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Visites terminées
              </p>
            </CardContent>
          </Card>

          <Card className="ohse-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annulés</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cancelledAppointments.length}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Rendez-vous annulés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="pending">En Attente</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmés</TabsTrigger>
            <TabsTrigger value="completed">Terminés</TabsTrigger>
            <TabsTrigger value="cancelled">Annulés</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <AppointmentList 
              appointments={appointments} 
              onConfirm={confirmAppointment}
              onCancel={cancelAppointment}
              onView={(appointment) => setSelectedAppointment(appointment)}
            />
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <AppointmentList 
              appointments={pendingAppointments} 
              onConfirm={confirmAppointment}
              onCancel={cancelAppointment}
              onView={(appointment) => setSelectedAppointment(appointment)}
            />
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-6">
            <AppointmentList 
              appointments={confirmedAppointments} 
              onConfirm={confirmAppointment}
              onCancel={cancelAppointment}
              onView={(appointment) => setSelectedAppointment(appointment)}
            />
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <AppointmentList 
              appointments={completedAppointments} 
              onConfirm={confirmAppointment}
              onCancel={cancelAppointment}
              onView={(appointment) => setSelectedAppointment(appointment)}
            />
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-6">
            <AppointmentList 
              appointments={cancelledAppointments} 
              onConfirm={confirmAppointment}
              onCancel={cancelAppointment}
              onView={(appointment) => setSelectedAppointment(appointment)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Appointment Dialog */}
      <Dialog open={showCreateAppointment} onOpenChange={setShowCreateAppointment}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle Demande de Rendez-vous</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour demander un rendez-vous médical
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Process Steps */}
            <Card className="ohse-card">
              <CardHeader>
                <CardTitle className="text-lg">Processus de demande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Soumission</p>
                    <p className="text-sm text-slate-600">Vous remplissez et envoyez le formulaire</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Notification</p>
                    <p className="text-sm text-slate-600">Le service médical est notifié</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Traitement</p>
                    <p className="text-sm text-slate-600">Examen de votre demande</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium">Confirmation</p>
                    <p className="text-sm text-slate-600">Vous recevez la confirmation</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Details */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type de visite</Label>
                <Select onValueChange={(value) => setNewAppointment({...newAppointment, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type de visite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SPONTANEOUS">Visite spontanée</SelectItem>
                    <SelectItem value="PERIODIC">Visite périodique</SelectItem>
                    <SelectItem value="PRE_RECRUITMENT">Visite d'embauche</SelectItem>
                    <SelectItem value="RETURN_TO_WORK">Visite de reprise</SelectItem>
                    <SelectItem value="OTHER">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reason">Motif de la visite</Label>
                <Textarea
                  placeholder="Ex: Visite périodique, douleur au dos, contrôle médical..."
                  value={newAppointment.reason}
                  onChange={(e) => setNewAppointment({...newAppointment, reason: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date souhaitée</Label>
                  <Input
                    type="date"
                    value={newAppointment.requestedDate}
                    onChange={(e) => setNewAppointment({...newAppointment, requestedDate: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Heure souhaitée</Label>
                  <Input
                    type="time"
                    value={newAppointment.requestedTime}
                    onChange={(e) => setNewAppointment({...newAppointment, requestedTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Priorité</Label>
                <RadioGroup 
                  value={newAppointment.priority} 
                  onValueChange={(value) => setNewAppointment({...newAppointment, priority: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="LOW" id="low" />
                    <Label htmlFor="low">Basse</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MEDIUM" id="medium" />
                    <Label htmlFor="medium">Normale</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="HIGH" id="high" />
                    <Label htmlFor="high">Élevée</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="URGENT" id="urgent" />
                    <Label htmlFor="urgent">Urgente</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="urgent" 
                  checked={newAppointment.isUrgent}
                  onCheckedChange={(checked) => setNewAppointment({...newAppointment, isUrgent: checked as boolean})}
                />
                <Label htmlFor="urgent">Ceci est une demande urgente</Label>
              </div>

              <div className="grid gap-2">
                <Label>Préférences de créneaux horaires</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Début de matinée (8h-10h)",
                    "Fin de matinée (10h-12h)",
                    "Début d'après-midi (14h-16h)",
                    "Fin d'après-midi (16h-18h)"
                  ].map((slot) => (
                    <div key={slot} className="flex items-center space-x-2">
                      <Checkbox 
                        id={slot}
                        checked={newAppointment.preferredTimeSlots.includes(slot)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewAppointment({
                              ...newAppointment, 
                              preferredTimeSlots: [...newAppointment.preferredTimeSlots, slot]
                            })
                          } else {
                            setNewAppointment({
                              ...newAppointment, 
                              preferredTimeSlots: newAppointment.preferredTimeSlots.filter(s => s !== slot)
                            })
                          }
                        }}
                      />
                      <Label htmlFor={slot} className="text-sm">{slot}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="flexible" 
                  checked={newAppointment.flexibleSchedule}
                  onCheckedChange={(checked) => setNewAppointment({...newAppointment, flexibleSchedule: checked as boolean})}
                />
                <Label htmlFor="flexible">Je suis flexible sur les horaires</Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Lieu (optionnel)</Label>
                <Input
                  placeholder="Lieu de consultation"
                  value={newAppointment.location}
                  onChange={(e) => setNewAppointment({...newAppointment, location: e.target.value})}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes supplémentaires (optionnel)</Label>
                <Textarea
                  placeholder="Informations complémentaires..."
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateAppointment(false)}>
              Annuler
            </Button>
            <Button onClick={createAppointment} className="ohse-btn-primary">
              Envoyer la demande
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Détails du Rendez-vous</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{selectedAppointment.type}</Badge>
                {getStatusBadge(selectedAppointment.status)}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">
                    Date demandée: {new Date(selectedAppointment.requestedDate).toLocaleDateString()}
                  </span>
                </div>
                
                {selectedAppointment.proposedDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">
                      Date proposée: {new Date(selectedAppointment.proposedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {selectedAppointment.scheduledTime && (
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">
                      Heure confirmée: {new Date(selectedAppointment.scheduledTime).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">
                    Médecin: {selectedAppointment.doctor ? 
                      `${selectedAppointment.doctor.firstName} ${selectedAppointment.doctor.lastName}` : 
                      "Non assigné"}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">
                    Infirmier: {selectedAppointment.nurse ? 
                      `${selectedAppointment.nurse.firstName} ${selectedAppointment.nurse.lastName}` : 
                      "Non assigné"}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">Motif: {selectedAppointment.reason}</span>
                </div>
                
                {selectedAppointment.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Lieu: {selectedAppointment.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">Priorité: {getPriorityBadge(selectedAppointment.priority)}</span>
                </div>
              </div>
              
              {selectedAppointment.comments && selectedAppointment.comments.length > 0 && (
                <div className="space-y-2">
                  <Label>Commentaires</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedAppointment.comments.map((comment, index) => (
                      <div key={index} className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-sm">
                        <p className="font-medium">{comment.authorName}</p>
                        <p>{comment.comment}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Appointment List Component
function AppointmentList({ 
  appointments, 
  onConfirm, 
  onCancel, 
  onView 
}: { 
  appointments: Appointment[]
  onConfirm: (id: number) => void
  onCancel: (id: number, reason: string) => void
  onView: (appointment: Appointment) => void
}) {
  if (appointments.length === 0) {
    return (
      <Card className="ohse-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Aucun rendez-vous
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-center">
            Vous n'avez pas encore de rendez-vous dans cette catégorie.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="ohse-card hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Stethoscope className="h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {appointment.type}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {appointment.reason}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>{new Date(appointment.requestedDate).toLocaleDateString()}</span>
                  </div>
                  
                  {appointment.proposedDate && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span>Proposé: {new Date(appointment.proposedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <span>
                      {appointment.doctor ? 
                        `Dr. ${appointment.doctor.lastName}` : 
                        "Médecin non assigné"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-slate-500" />
                    <span>{appointment.priority}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                <div className="flex gap-2">
                  {getStatusBadge(appointment.status)}
                  {getPriorityBadge(appointment.priority)}
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onView(appointment)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {appointment.status === "PROPOSED" && (
                    <Button size="sm" onClick={() => onConfirm(appointment.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirmer
                    </Button>
                  )}
                  
                  {(appointment.status === "REQUESTED" || appointment.status === "CONFIRMED") && (
                    <Button size="sm" variant="outline" onClick={() => onCancel(appointment.id, "Annulé par l'employé")}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Annuler
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
