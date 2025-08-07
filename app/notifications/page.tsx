"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Bell, CheckCircle, XCircle, Clock, Trash2, Eye, Plus, Calendar, AlertCircle, Info, Mail, Phone, User, Settings, RefreshCw, Loader2
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Notification {
  id: number
  userId: string
  type: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const { user, loading, accessToken } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateNotification, setShowCreateNotification] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [email, setEmail] = useState("")
  const [date, setDate] = useState("")
  const [notificationType, setNotificationType] = useState("appointment_request")
  const [message, setMessage] = useState("")
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user && accessToken) {
      fetchNotifications()
    }
  }, [user, loading, accessToken, router])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      
      // Try to fetch from the API first
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/notifications?userId=${user?.email}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.read).length)
      } else {
        // If API fails, use demo data
        const demoNotifications: Notification[] = [
          {
            id: 1,
            userId: user?.email || "user@example.com",
            type: "appointment_request",
            message: "Nouvelle demande de visite médicale reçue de Jean Dupont",
            link: "/demande-visite-medicale",
            read: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
          },
          {
            id: 2,
            userId: user?.email || "user@example.com",
            type: "appointment_confirmed",
            message: "Votre rendez-vous de visite médicale a été confirmé pour le 15/12/2024 à 14:30",
            link: "/dashboard",
            read: false,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
          },
          {
            id: 3,
            userId: user?.email || "user@example.com",
            type: "urgent",
            message: "Demande urgente de visite médicale nécessitant une attention immédiate",
            link: "/demande-visite-medicale",
            read: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
          },
          {
            id: 4,
            userId: user?.email || "user@example.com",
            type: "appointment_cancelled",
            message: "Votre rendez-vous du 10/12/2024 a été annulé. Veuillez prendre un nouveau rendez-vous.",
            link: "/demande-visite-medicale",
            read: true,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
          }
        ]
        
        setNotifications(demoNotifications)
        setUnreadCount(demoNotifications.filter(n => !n.read).length)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      
      // Use demo data if API fails
      const demoNotifications: Notification[] = [
        {
          id: 1,
          userId: user?.email || "user@example.com",
          type: "appointment_request",
          message: "Nouvelle demande de visite médicale reçue de Jean Dupont",
          link: "/demande-visite-medicale",
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          id: 2,
          userId: user?.email || "user@example.com",
          type: "appointment_confirmed",
          message: "Votre rendez-vous de visite médicale a été confirmé pour le 15/12/2024 à 14:30",
          link: "/dashboard",
          read: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
          id: 3,
          userId: user?.email || "user@example.com",
          type: "urgent",
          message: "Demande urgente de visite médicale nécessitant une attention immédiate",
          link: "/demande-visite-medicale",
          read: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        },
        {
          id: 4,
          userId: user?.email || "user@example.com",
          type: "appointment_cancelled",
          message: "Votre rendez-vous du 10/12/2024 a été annulé. Veuillez prendre un nouveau rendez-vous.",
          link: "/demande-visite-medicale",
          read: true,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
        }
      ]
      
      setNotifications(demoNotifications)
      setUnreadCount(demoNotifications.filter(n => !n.read).length)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const clearAllNotifications = async () => {
    setIsClearing(true)
    try {
      // Always use user?.email as userId
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/clear-all?userId=${user?.email}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      if (response.ok) {
        fetchNotifications()
        toast({ title: 'Succès', description: 'Toutes les notifications ont été supprimées.', variant: 'default' })
      } else {
        toast({ title: 'Erreur', description: 'Impossible de supprimer les notifications.', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Erreur lors de la suppression.', variant: 'destructive' })
      console.error("Error clearing notifications:", error)
    } finally {
      setIsClearing(false)
    }
  }

  const cleanupTestNotifications = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/cleanup-test`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error("Error cleaning up test notifications:", error)
    }
  }

  const createNotification = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/simulate-rendezvous?email=${encodeURIComponent(email)}&date=${encodeURIComponent(date)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        setShowCreateNotification(false)
        setEmail("")
        setDate("")
        setNotificationType("appointment_request")
        setMessage("")
        fetchNotifications()
      }
    } catch (error) {
      console.error("Error creating notification:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_request':
        return <Calendar className="h-5 w-5 text-blue-600" />
      case 'appointment_confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'appointment_cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-orange-600" />
      default:
        return <Info className="h-5 w-5 text-slate-600" />
    }
  }

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'appointment_request':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Demande</Badge>
      case 'appointment_confirmed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Confirmé</Badge>
      case 'appointment_cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Annulé</Badge>
      case 'urgent':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Urgent</Badge>
      default:
        return <Badge variant="secondary">Info</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-burgundy-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Notifications
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Gérez vos notifications et alertes
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={fetchNotifications}
                variant="outline"
                className="border-burgundy-600 text-burgundy-600 hover:bg-burgundy-50 dark:hover:bg-burgundy-900/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button 
                onClick={cleanupTestNotifications}
                variant="outline"
                className="border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Nettoyer Tests
              </Button>
              <Button 
                onClick={() => setShowCreateNotification(true)}
                className="bg-burgundy-600 hover:bg-burgundy-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Notification
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                  Total
                </CardTitle>
                <Bell className="h-5 w-5 text-burgundy-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {notifications.length}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Notifications
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                  Non lues
                </CardTitle>
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {unreadCount}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                En attente
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                  Actions
                </CardTitle>
                <Settings className="h-5 w-5 text-burgundy-600" />
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={clearAllNotifications}
                variant="outline"
                size="sm"
                className="w-full border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 dark:bg-slate-900 dark:text-red-400 dark:border-red-400 rounded-lg shadow-md font-semibold transition-all duration-200 focus:ring-2 focus:ring-red-400 focus:outline-none"
                disabled={isClearing}
              >
                {isClearing ? (
                  <span className="flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Suppression...</span>
                ) : (
                  <><Trash2 className="h-4 w-4 mr-2" />Tout supprimer</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-burgundy-100 dark:bg-slate-700 shadow-md">
                <Bell className="h-5 w-5 text-burgundy-600 dark:text-burgundy-300" />
              </span>
              <CardTitle className="text-slate-900 dark:text-white">Mes Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-burgundy-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Aucune notification</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all duration-200 shadow-sm ${
                      notification.read
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-600'
                        : 'bg-white dark:bg-slate-900 border-burgundy-200 dark:border-burgundy-700 shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getNotificationBadge(notification.type)}
                            {!notification.read && (
                              <div className="w-2 h-2 bg-burgundy-600 rounded-full"></div>
                            )}
                          </div>
                          <p className={`text-sm ${
                            notification.read 
                              ? 'text-slate-600 dark:text-slate-400' 
                              : 'text-slate-900 dark:text-white font-medium'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsRead(notification.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedNotification(notification)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Notification Dialog */}
        <Dialog open={showCreateNotification} onOpenChange={setShowCreateNotification}>
          <DialogContent className="bg-white dark:bg-slate-800 border-0 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">Créer une notification</DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Simulez une notification de rendez-vous
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                />
              </div>
              <div>
                <Label htmlFor="date" className="text-slate-700 dark:text-slate-300">Date</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                />
              </div>
              <div>
                <Label htmlFor="type" className="text-slate-700 dark:text-slate-300">Type</Label>
                <Select value={notificationType} onValueChange={setNotificationType}>
                  <SelectTrigger className="border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment_request">Demande de rendez-vous</SelectItem>
                    <SelectItem value="appointment_confirmed">Rendez-vous confirmé</SelectItem>
                    <SelectItem value="appointment_cancelled">Rendez-vous annulé</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message" className="text-slate-700 dark:text-slate-300">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message de la notification..."
                  className="border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateNotification(false)}>
                  Annuler
                </Button>
                <Button onClick={createNotification} className="bg-burgundy-600 hover:bg-burgundy-700 text-white">
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Notification Dialog */}
        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent className="bg-white dark:bg-slate-800 border-0 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">Détails de la notification</DialogTitle>
            </DialogHeader>
            {selectedNotification && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {getNotificationIcon(selectedNotification.type)}
                  {getNotificationBadge(selectedNotification.type)}
                </div>
                <p className="text-slate-900 dark:text-white">{selectedNotification.message}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Créée le {new Date(selectedNotification.createdAt).toLocaleString('fr-FR')}
                </p>
                {selectedNotification.link && (
                  <Button className="w-full bg-burgundy-600 hover:bg-burgundy-700 text-white">
                    Voir les détails
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
