"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { 
  Check, 
  ChevronsUpDown, 
  Search, 
  User, 
  Users,
  Mail,
  Phone,
  Building
} from "lucide-react"

interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string
  cin?: string
  phoneNumber?: string
  department?: string
  position?: string
  matriculeNumber?: string // Numéro de matricule (e.g., MAT-1754494276214) - matches backend field
  employeeId?: string // Alternative matricule field
}

interface EmployeeSelectProps {
  value?: Employee
  onValueChange: (employee: Employee | undefined) => void
  placeholder?: string
  className?: string
}

export function EmployeeSelect({ value, onValueChange, placeholder = "Sélectionner un salarié", className = "" }: EmployeeSelectProps) {
  const { themeColors } = useTheme()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchEmployees()
    }
  }, [open, user])

    const fetchEmployees = async () => {
    setLoading(true)
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
      const stored = localStorage.getItem('oshapp_tokens')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      
      if (stored) {
        try { 
          const p = JSON.parse(stored); 
          if (p.access_token) {
            headers['Authorization'] = `Bearer ${p.access_token}`
          }
        } catch (e) {
          // Silent error handling
        }
      }
      
      // Determine which endpoint to use based on user role
      const isAdmin = user?.roles?.includes('ADMIN')
      const endpoint = isAdmin ? 'admin' : 'rh'
      
      // Fallback to admin endpoint if user context is not available
      if (!user || !user.roles) {
        const fallbackEndpoint = 'admin'
        const fallbackResponse = await fetch(`${base}/api/v1/${fallbackEndpoint}/employees`, { headers })
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          
          // Also fetch detailed data for fallback
          const detailedFallbackEmployees = await Promise.all(
            fallbackData.map(async (employee: any) => {
              try {
                // First get basic employee data (same as EmployeeInfoDialog)
                const detailResponse = await fetch(`${base}/api/v1/${fallbackEndpoint}/employees/${employee.id}`, { headers })
                if (detailResponse.ok) {
                  const detailData = await detailResponse.json()
                  
                  // Now try to get profile data to get the real matricule (same as EmployeeInfoDialog)
                  let matriculeNumber = detailData.matriculeNumber || null
                  
                  if (detailData.keycloakId) {
                    try {
                      const profileRes = await fetch(`${base}/api/v1/${fallbackEndpoint}/users/${detailData.keycloakId}/profile`, { headers })
                      if (profileRes.ok) {
                        const profileResult = await profileRes.json()
                        if (profileResult.success && profileResult.profile) {
                          matriculeNumber = profileResult.profile.matriculeNumber || detailData.matriculeNumber || null
                        }
                      }
                    } catch (profileError) {
                      // Silent error handling
                    }
                  }
                  
                  return {
                    ...employee,
                    matriculeNumber: matriculeNumber
                  }
                }
                return employee
              } catch (error) {
                return employee
              }
            })
          )
          
          setEmployees(detailedFallbackEmployees)
          return
        }
      }
      
      const response = await fetch(`${base}/api/v1/${endpoint}/employees`, { headers })
      
      if (response.ok) {
        const basicData = await response.json()
        
        // Now fetch detailed data for each employee to get the real matricule
        const detailedEmployees = await Promise.all(
          basicData.map(async (employee: any) => {
            try {
              // First get basic employee data (same as EmployeeInfoDialog)
              const detailResponse = await fetch(`${base}/api/v1/${endpoint}/employees/${employee.id}`, { headers })
              if (detailResponse.ok) {
                const detailData = await detailResponse.json()
                
                // Now try to get profile data to get the real matricule (same as EmployeeInfoDialog)
                let matriculeNumber = detailData.matriculeNumber || null
                
                if (detailData.keycloakId) {
                  try {
                    const profileRes = await fetch(`${base}/api/v1/${endpoint}/users/${detailData.keycloakId}/profile`, { headers })
                    if (profileRes.ok) {
                      const profileResult = await profileRes.json()
                      if (profileResult.success && profileResult.profile) {
                        matriculeNumber = profileResult.profile.matriculeNumber || detailData.matriculeNumber || null
                      }
                    }
                  } catch (profileError) {
                    // Silent error handling
                  }
                }
                
                return {
                  ...employee,
                  matriculeNumber: matriculeNumber
                }
              }
              return employee
            } catch (error) {
              return employee
            }
          })
        )
        
        setEmployees(detailedEmployees)
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false)
    }
  }



  const filteredEmployees = employees.filter(employee => {
    // Create search string with only the real matricule (no OHSE- fallback)
    const searchString = `${employee.firstName} ${employee.lastName} ${employee.email} ${employee.department || ''} ${employee.position || ''} ${employee.matriculeNumber || ''} ${employee.cin || ''}`
    
    // Check for exact matches first (more specific)
    const exactMatches = [
      employee.matriculeNumber?.toLowerCase(),
      employee.cin?.toLowerCase(),
      employee.firstName?.toLowerCase(),
      employee.lastName?.toLowerCase(),
      employee.email?.toLowerCase()
    ].some(field => field && field === searchTerm.toLowerCase())
    
    // Check for partial matches
    const partialMatches = searchString.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matches = exactMatches || partialMatches
    
    return matches
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md ${className}`}
        >
          {value ? (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold text-white" 
                   style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`}}>
                {value.firstName.charAt(0)}{value.lastName.charAt(0)}
              </div>
              <span className="font-medium">{value.firstName} {value.lastName}</span>
            </div>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border-0">
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            {/* Search Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-6 w-6 rounded-lg flex items-center justify-center" 
                     style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                  <Users className="h-3 w-3 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Sélectionner un salarié</h3>
              </div>
    <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Rechercher par nom, email, département, matricule ou CIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300"
                />
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Recherche par nom, email, département, matricule (ex: MAT-123...) ou CIN (ex: AB123456)
                </div>
              </div>
            </div>

            {/* Employee List */}
            <div className="max-h-[320px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
                    <span className="text-sm">Chargement des employés, profils et matricules...</span>
                  </div>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center text-slate-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">Aucun employé trouvé</p>
                    <p className="text-xs">Aucun employé ne correspond à votre recherche</p>
                    {searchTerm && (
                      <div className="mt-3 p-2 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                        <p className="font-medium mb-1">Matricules disponibles:</p>
                        <p>• MAT-1754494276214 (Badr Med)</p>
                        <p>• MAT-1754329205078 (Administrateur)</p>
                        <p>• MAT-1754329205093 (Dr. Ahmed Benali)</p>
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                          <p className="text-green-700 dark:text-green-300 font-medium">✅ Matricule réel disponible!</p>
                          <p className="text-green-600 dark:text-green-400 text-xs">Recherchez par le vrai matricule MAT-1754494276214</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`p-3 cursor-pointer transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                        value?.id === employee.id ? 'bg-slate-100 dark:bg-slate-700' : ''
                      }`}
                      onClick={() => {
                        onValueChange(employee)
                        setOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold text-white" 
                             style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`}}>
                          {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 dark:text-white truncate">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{employee.email}</span>
                          </div>
                          {employee.matriculeNumber && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-500 truncate mt-1">
                              <Building className="h-3 w-3 shrink-0" />
                              <span className="truncate">{employee.matriculeNumber}</span>
                            </div>
                          )}
                          {employee.cin && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-500 truncate mt-1">
                              <Building className="h-3 w-3 shrink-0" />
                              <span className="truncate">{employee.cin}</span>
                            </div>
                          )}
                        </div>
                        {value?.id === employee.id && (
                          <Check className="ml-auto h-4 w-4 text-slate-600 dark:text-slate-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}


