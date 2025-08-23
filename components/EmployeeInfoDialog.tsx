"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, User, Mail, Phone, MapPin, Calendar, Building, IdCard, Shield, Stethoscope, Clock, AlertCircle, UserCheck, UserX } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface EmployeeInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: number
}

interface EmployeeData {
  id: number
  firstName: string
  lastName: string
  email?: string
  phoneNumber?: string
  address?: string
  city?: string
  zipCode?: string
  country?: string
  department?: string
  position?: string
  hireDate?: string
  birthDate?: string
  birthPlace?: string
  nationality?: string
  cin?: string
  cnss?: string
  employeeId?: string
  matriculeNumber?: string
  dossierNumber?: string
  gender?: string
  company?: string
  profileCompleted?: boolean
  active?: boolean
  medicalFitnessStatus?: string
  nextMedicalVisit?: string
  lastMedicalVisitNotes?: string
  userId?: number
  keycloakId?: string
  username?: string // Added for username display
  manager1Id?: number
  manager1Name?: string
  manager2Id?: number
  manager2Name?: string
}

export default function EmployeeInfoDialog({ open, onOpenChange, employeeId }: EmployeeInfoDialogProps) {
  const { user } = useAuth()
  const { themeColors } = useTheme()
  const [data, setData] = useState<EmployeeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && employeeId) {
      fetchEmployeeData()
    }
  }, [open, employeeId])

  const fetchEmployeeData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
      const stored = localStorage.getItem('oshapp_tokens')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (stored) {
        try { 
          const p = JSON.parse(stored); 
          if (p.access_token) headers['Authorization'] = `Bearer ${p.access_token}` 
        } catch {}
      }
      
      // Determine which endpoint to use based on user role
      const isAdmin = user?.roles?.includes('ADMIN')
      const endpoint = isAdmin ? 'admin' : 'rh'
      
      const employeeRes = await fetch(`${base}/api/v1/${endpoint}/employees/${employeeId}`, { headers })
      if (!employeeRes.ok) throw new Error('Erreur lors de la récupération des données employé')
      
      const employeeData = await employeeRes.json()
      console.log('Employee API Response:', employeeData)
      
      // Fetch manager names if manager IDs are present
      let manager1Name = null
      let manager2Name = null
      
      if (employeeData.manager1Id) {
        try {
          const manager1Res = await fetch(`${base}/api/v1/${endpoint}/employees/${employeeData.manager1Id}`, { headers })
          if (manager1Res.ok) {
            const manager1Data = await manager1Res.json()
            manager1Name = `${manager1Data.firstName} ${manager1Data.lastName}`
          }
        } catch (error) {
          console.error('Error fetching manager1 data:', error)
        }
      }
      
      if (employeeData.manager2Id) {
        try {
          const manager2Res = await fetch(`${base}/api/v1/${endpoint}/employees/${employeeData.manager2Id}`, { headers })
          if (manager2Res.ok) {
            const manager2Data = await manager2Res.json()
            manager2Name = `${manager2Data.firstName} ${manager2Data.lastName}`
          }
        } catch (error) {
          console.error('Error fetching manager2 data:', error)
        }
      }
      
      // Add manager names to employee data
      const employeeDataWithManagers = {
        ...employeeData,
        manager1Name,
        manager2Name
      }
      
      // If we have a keycloakId, fetch user profile data to get extended information
      if (employeeData.keycloakId) {
        try {
          // First try to get profile data (extended information) using Keycloak ID
          const profileRes = await fetch(`${base}/api/v1/${endpoint}/users/${employeeData.keycloakId}/profile`, { headers })
          if (profileRes.ok) {
            const profileResult = await profileRes.json()
            if (profileResult.success && profileResult.profile) {
              const profileData = profileResult.profile
              console.log('Profile API Response:', profileData)
              
              // Merge profile data with employee data
              const mergedData = {
                ...employeeDataWithManagers,
                email: employeeDataWithManagers.email || 'Non disponible',
                active: profileData.enabled !== undefined ? profileData.enabled : true,
                // Profile fields
                gender: profileData.gender,
                company: profileData.company,
                dossierNumber: profileData.dossierNumber,
                matriculeNumber: profileData.matriculeNumber,
                birthDate: profileData.birthDate,
                address: profileData.address,
                hireDate: profileData.hireDate || employeeDataWithManagers.hireDate,
                position: employeeDataWithManagers.position || profileData.profession,
                phoneNumber: profileData.phoneNumber || employeeDataWithManagers.phoneNumber,
                department: profileData.department || employeeDataWithManagers.department
              }
              console.log('Merged Data with Profile:', mergedData)
              setData(mergedData)
              return
            }
          }
          
          // Fallback: try to get basic user data using userId
          if (employeeData.userId) {
            const userRes = await fetch(`${base}/api/v1/${endpoint}/users/${employeeData.userId}`, { headers })
            if (userRes.ok) {
              const userData = await userRes.json()
              console.log('User API Response:', userData)
              // Merge user data with employee data
              const mergedData = {
                ...employeeDataWithManagers,
                email: userData.profile?.email || userData.email || userData.username || 'Non disponible',
                active: userData.active !== undefined ? userData.active : true // Default to true if not provided
              }
              console.log('Merged Data with User:', mergedData)
              setData(mergedData)
            } else {
                          // If user fetch fails, just use employee data
            const mergedData = {
              ...employeeDataWithManagers,
              active: true // Default to true if no user data
            }
            console.log('Employee Data Only (User fetch failed):', mergedData)
            setData(mergedData)
            }
          } else {
            // No userId, just use employee data
            const mergedData = {
              ...employeeDataWithManagers,
              active: true // Default to true if no user data
            }
            console.log('Employee Data Only (No userId):', mergedData)
            setData(mergedData)
          }
        } catch (userError) {
          console.error('Error fetching user/profile data:', userError)
          // If user fetch fails, just use employee data
          const mergedData = {
            ...employeeDataWithManagers,
            active: true // Default to true if no user data
          }
          console.log('Employee Data Only (User fetch error):', mergedData)
          setData(mergedData)
        }
      } else if (employeeData.userId) {
        // Fallback: try to get basic user data using userId if no keycloakId
        try {
          const userRes = await fetch(`${base}/api/v1/${endpoint}/users/${employeeData.userId}`, { headers })
          if (userRes.ok) {
            const userData = await userRes.json()
            console.log('User API Response:', userData)
            // Merge user data with employee data
            const mergedData = {
              ...employeeDataWithManagers,
              email: userData.profile?.email || userData.email || userData.username || 'Non disponible',
              active: userData.active !== undefined ? userData.active : true // Default to true if not provided
            }
            console.log('Merged Data with User:', mergedData)
            setData(mergedData)
          } else {
            // If user fetch fails, just use employee data
            const mergedData = {
              ...employeeDataWithManagers,
              active: true // Default to true if no user data
            }
            console.log('Employee Data Only (User fetch failed):', mergedData)
            setData(mergedData)
          }
        } catch (userError) {
          console.error('Error fetching user data:', userError)
          // If user fetch fails, just use employee data
          const mergedData = {
            ...employeeDataWithManagers,
            active: true // Default to true if no user data
          }
          console.log('Employee Data Only (User fetch error):', mergedData)
          setData(mergedData)
        }
      } else {
        // No keycloakId or userId, just use employee data
        const mergedData = {
          ...employeeData,
          active: true // Default to true if no user data
        }
        console.log('Employee Data Only (No keycloakId or userId):', mergedData)
        setData(mergedData)
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border-0">
        <DialogHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="h-6 w-6 rounded-md flex items-center justify-center shadow-md" 
                 style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`}}>
              <Users className="h-3 w-3 text-white" />
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
          <div className="space-y-4">
            {/* Base Information */}
            <Card className="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-sm font-semibold">
                  <div className="h-4 w-4 rounded-md flex items-center justify-center" 
                       style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`}}>
                    <User className="h-2.5 w-2.5 text-white" />
                  </div>
                  Informations de Base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-1.5 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-5 w-5 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <User className="h-2.5 w-2.5 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Nom complet</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.firstName} {data.lastName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-5 w-5 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <User className="h-2.5 w-2.5 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Nom d'utilisateur</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">@{data.username || 'utilisateur'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-5 w-5 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <Mail className="h-2.5 w-2.5 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Email</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.email || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-5 w-5 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <Shield className="h-2.5 w-2.5 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Statut</span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={data.active ? "default" : "destructive"}
                          className={`${data.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'} flex items-center gap-1 text-xs px-2 py-1`}
                        >
                          {data.active ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                          {data.active ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-sm font-semibold">
                  <div className="h-4 w-4 rounded-md flex items-center justify-center" 
                       style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`}}>
                    <User className="h-2.5 w-2.5 text-white" />
                  </div>
                  Informations Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-1.5 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <User className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Sexe</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">
                        {data.gender === 'MALE' ? 'Homme' : 
                         data.gender === 'FEMALE' ? 'Femme' : 
                         data.gender || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <Calendar className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Date de naissance</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">
                        {data.birthDate ? new Date(data.birthDate).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : '-'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg col-span-2">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Adresse</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.address || '-'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card className="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-sm font-semibold">
                  <div className="h-4 w-4 rounded-md flex items-center justify-center" 
                       style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`}}>
                    <Building className="h-2.5 w-2.5 text-white" />
                  </div>
                  Informations Professionnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-1.5 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <Building className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Entreprise</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.company || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <Calendar className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Date d'embauche</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">
                        {data.hireDate ? new Date(data.hireDate).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : '-'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <User className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Poste</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.position || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <Building className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Département</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.department || '-'}</div>
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
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <IdCard className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Numéro de dossier</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.dossierNumber || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <IdCard className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Numéro de matricule</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.matriculeNumber || '-'}</div>
                    </div>
                  </div>
                  
                  {/* Manager Information */}
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <Users className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Responsable N+1</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.manager1Name || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                         style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                      <Users className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">Responsable N+2</span>
                      <div className="text-slate-900 dark:text-slate-100 font-medium text-sm">{data.manager2Name || '-'}</div>
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

// Add named export for backward compatibility
export { EmployeeInfoDialog }



