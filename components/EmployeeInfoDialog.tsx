"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/contexts/ThemeContext"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building, 
  Briefcase,
  Hash,
  Users
} from "lucide-react"

interface EmployeeInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: number
}

export function EmployeeInfoDialog({ open, onOpenChange, employeeId }: EmployeeInfoDialogProps) {
  const { themeColors } = useTheme()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && employeeId) {
      fetchEmployeeData()
    }
  }, [open, employeeId])

  const fetchEmployeeData = async () => {
      setLoading(true)
      setError(null)
    
      try {
      // Fetch employee data
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
        const stored = localStorage.getItem('oshapp_tokens')
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (stored) {
        try { 
          const p = JSON.parse(stored); 
          if (p.access_token) headers['Authorization'] = `Bearer ${p.access_token}` 
        } catch {}
      }
      
      const employeeRes = await fetch(`${base}/api/v1/admin/employees/${employeeId}`, { headers })
      if (!employeeRes.ok) throw new Error('Erreur lors de la récupération des données employé')
      
      const employeeData = await employeeRes.json()
      console.log('Employee API Response:', employeeData)
      
      // If we have a userId, fetch user data to get email
      if (employeeData.userId) {
        try {
          const userRes = await fetch(`${base}/api/v1/admin/users/${employeeData.userId}`, { headers })
          if (userRes.ok) {
            const userData = await userRes.json()
            console.log('User API Response:', userData)
            // Merge user data with employee data
            setData({
              ...employeeData,
              email: userData.profile?.email || userData.email || userData.username || 'Non disponible'
            })
          } else {
            // If user fetch fails, just use employee data
            setData(employeeData)
          }
        } catch (userError) {
          console.error('Error fetching user data:', userError)
          setData(employeeData)
        }
      } else {
        // If no userId, just use employee data
        setData(employeeData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border-0">
        <DialogHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md" 
                 style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`}}>
              <Users className="h-4 w-4 text-white" />
            </div>
            Informations salarié
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4 text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
              <span className="text-lg font-medium">Chargement des informations...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center text-red-500">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 text-2xl">!</span>
              </div>
              <p className="text-xl font-medium">Erreur de chargement</p>
              <p className="text-base">{error}</p>
            </div>
          </div>
        ) : data ? (
          <div className="p-4 space-y-4">
            {/* Base Information */}
            <Card className="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base">
                  <div className="h-5 w-5 rounded-md flex items-center justify-center" 
                       style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`}}>
                    <User className="h-3 w-3 text-white" />
                  </div>
                  Informations de base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {data.firstName} {data.lastName}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <Mail className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Email</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.email || 'Non disponible'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <Phone className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Téléphone</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.phoneNumber || '-'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Personal Information */}
            <Card className="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base">
                  <div className="h-5 w-5 rounded-md flex items-center justify-center" 
                       style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`}}>
                    <User className="h-3 w-3 text-white" />
                  </div>
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <Calendar className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Date de naissance</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.birthDate || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <User className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Genre</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">
                        {data.gender === 'MALE' ? 'Homme' : data.gender === 'FEMALE' ? 'Femme' : '-'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Adresse</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.address || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Ville</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.city || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Pays</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.country || '-'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Professional Information */}
            <Card className="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base">
                  <div className="h-5 w-5 rounded-md flex items-center justify-center" 
                       style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`}}>
                    <Briefcase className="h-3 w-3 text-white" />
                  </div>
                  Informations professionnelles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <Building className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Département</span>
                      <Badge className="mt-1 px-3 py-1" 
                             style={{
                               background: `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`,
                               color: themeColors.colors.primary[800]
                             }}>
                        {data.department || '-'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <Briefcase className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Poste</span>
                      <Badge className="mt-1 px-3 py-1"
                             style={{
                               background: `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`,
                               color: themeColors.colors.primary[800]
                             }}>
                        {data.position || '-'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <Calendar className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Date d'embauche</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.hireDate || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <Hash className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Matricule</span>
                      <div className="text-slate-900 dark:text-slate-100 font-mono font-medium px-2 py-0.5 rounded text-sm"
                           style={{
                             background: `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})`,
                             color: themeColors.colors.primary[800]
                           }}>
                        {data.employeeId || data.matriculeNumber || '-'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <Building className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Entreprise</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.company || '-'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center py-16">
            <div className="text-center text-slate-500">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="text-slate-400 text-2xl">?</span>
              </div>
              <p className="text-xl font-medium">Aucune donnée</p>
              <p className="text-base">Aucune information disponible pour cet employé</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}


