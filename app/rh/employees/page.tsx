"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"

import { 
  UserPlus, 
  UserCheck, 
  UserX, 
  Edit, 
  Search, 
  Filter,
  MoreHorizontal,
  Users,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  Calendar,
  Mail,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeeInfoDialog } from "@/components/EmployeeInfoDialog"
import { DashboardNavigation } from "@/components/dashboard-navigation"

// Employee interface for RH
interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  department?: string
  position?: string
  hireDate?: string
  matriculeNumber?: string
  dossierNumber?: string
  gender?: string
  birthDate?: string
  address?: string
  company?: string
  manager1Id?: number
  manager1Name?: string
  manager2Id?: number
  manager2Name?: string
}

export default function RHEmployeesPage() {
  const { user, accessToken } = useAuth()
  const { themeColors } = useTheme()
  
  // State
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  
  // Form state
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    department: "",
    position: "",
    hireDate: "",
    matriculeNumber: "",
    gender: "",
    birthDate: "",
    address: "",
    company: ""
  })


  
  // Bulk import state (Excel)
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false)
  const [excelEmployees, setExcelEmployees] = useState<any[]>([])
  const [excelFileName, setExcelFileName] = useState<string>("")
  const [importResults, setImportResults] = useState<any[]>([])
  const [isImporting, setIsImporting] = useState(false)

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true)
      
      // Check if we have a valid access token
      if (!accessToken) {
        throw new Error('No access token available')
      }

      // Use the correct API endpoint for RH users
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
      const response = await fetch(`${apiUrl}/api/v1/rh/employees`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        // Validate the data structure and filter out invalid entries
        if (Array.isArray(data)) {
          const validEmployees = data.filter((emp: any) => {
            // Check if employee has required fields
            return emp && 
                   emp.id && 
                   emp.firstName && 
                   emp.lastName && 
                   emp.email && 
                   emp.email.includes('@') // Basic email validation
          })
          
          if (validEmployees.length !== data.length) {
            console.warn(`Filtered out ${data.length - validEmployees.length} invalid employee records`)
          }
          
          setEmployees(validEmployees)
        } else {
          console.error('Invalid data structure received from API')
          setEmployees([])
          toast.error("Format de données invalide reçu de l'API")
        }
      } else {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast.error("Erreur lors du chargement des employés")
      // Set empty array instead of leaving previous data
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.roles?.includes("RESP_RH")) {
      console.log("Fetching employees for user:", user.username, "with token:", accessToken ? "present" : "missing")
      fetchEmployees()
    }
  }, [user, accessToken])

  // Create employee
  const createEmployee = async () => {
    try {
      const response = await fetch('/api/v1/rh/employees', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newEmployee,
          roles: ['SALARIE']
        })
      })

      if (response.ok) {
        toast.success("Employé créé avec succès")
        setShowCreateDialog(false)
        setNewEmployee({
          firstName: "", lastName: "", email: "", phoneNumber: "",
          department: "", position: "", hireDate: "", matriculeNumber: "",
          gender: "", birthDate: "", address: "", company: ""
        })
        fetchEmployees()
      } else {
        throw new Error('Failed to create employee')
      }
    } catch (error) {
      console.error("Error creating employee:", error)
      toast.error("Erreur lors de la création")
    }
  }

  // Update employee
  const updateEmployee = async () => {
    if (!selectedEmployee) return

    try {
      // First update the employee data
      const response = await fetch(`/api/v1/rh/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedEmployee)
      })

      if (response.ok) {
        // Then update managers if they were changed
        if (selectedEmployee.manager1Id !== undefined || selectedEmployee.manager2Id !== undefined) {
          const managerResponse = await fetch(`/api/v1/rh/employees/${selectedEmployee.id}/managers`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              manager1Id: selectedEmployee.manager1Id,
              manager2Id: selectedEmployee.manager2Id
            })
          })

          if (!managerResponse.ok) {
            console.error("Error updating managers:", await managerResponse.text())
            toast.error("Employé mis à jour mais erreur lors de l'assignation des managers")
            setShowEditDialog(false)
            setSelectedEmployee(null)
            fetchEmployees()
            return
          }
        }

        toast.success("Employé mis à jour avec succès")
        setShowEditDialog(false)
        setSelectedEmployee(null)
        fetchEmployees()
      } else {
        throw new Error('Failed to update employee')
      }
    } catch (error) {
      console.error("Error updating employee:", error)
      toast.error("Erreur lors de la mise à jour")
    }
  }

  // Delete employee
  const deleteEmployee = async (employeeId: number) => {
    try {
      const response = await fetch(`/api/v1/rh/employees/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success("Employé supprimé avec succès")
        fetchEmployees()
      } else {
        throw new Error('Failed to delete employee')
      }
    } catch (error) {
      console.error("Error deleting employee:", error)
      toast.error("Erreur lors de la suppression")
    }
  }



  // Bulk import (from Excel parsed data)
  const handleBulkImport = async () => {
    if (!excelEmployees.length) {
      toast.error("Veuillez sélectionner un fichier Excel valide")
      return
    }

    try {
      setIsImporting(true)
      // Normalize rows and map French values
      const toApiEmployee = (emp: any) => {
        const rawGender = String(emp.gender || emp.Genre || '').trim().toUpperCase()
        const gender = rawGender === 'HOMME' ? 'MALE' : rawGender === 'FEMME' ? 'FEMALE' : rawGender
        const cleaned = {
          firstName: (emp.firstName ?? '').toString().trim(),
          lastName: (emp.lastName ?? '').toString().trim(),
          email: (emp.email ?? '').toString().trim(),
          phoneNumber: (emp.phoneNumber ?? '').toString().trim() || undefined,
          department: (emp.department ?? '').toString().trim() || undefined,
          position: (emp.position ?? '').toString().trim() || undefined,
          hireDate: (emp.hireDate ?? '').toString().trim() || undefined,
          gender: gender || undefined,
          birthDate: (emp.birthDate ?? '').toString().trim() || undefined,
          address: (emp.address ?? '').toString().trim() || undefined,
          company: (emp.company ?? '').toString().trim() || undefined,
          matriculeNumber: (emp.matriculeNumber ?? '').toString().trim() || undefined,
          roles: ['SALARIE'],
        }
        return cleaned
      }
      const payload = excelEmployees.map(toApiEmployee)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
      const response = await fetch(`${apiUrl}/api/v1/rh/employees/bulk-import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const result = await response.json()
        setImportResults(result.results || [])
        toast.success(`${result.successCount || 0} employés importés avec succès`)
        fetchEmployees()
      } else {
        const errorText = await response.text()
        console.error('Import failed:', errorText)
        toast.error("Échec de l'import: " + (errorText || 'Erreur inconnue'))
      }
    } catch (error) {
      console.error("Error during bulk import:", error)
      toast.error("Échec de l'import Excel")
    } finally {
      setIsImporting(false)
    }
  }

  // Download Excel template
  const downloadTemplate = async () => {
    try {
      const XLSX: any = await import('xlsx-js-style')
      const headers = [
        'Prénom', 'Nom', 'Email', 'Téléphone', 'Département', 'Poste',
        'Date d\'embauche', 'Genre', 'Date de naissance', 'Adresse', 'Entreprise', 'Numéro matricule'
      ]
      const sample = [{
        'Prénom': 'Jean',
        'Nom': 'Dupont',
        'Email': 'jean.dupont@company.com',
        'Téléphone': '+33 1 23 45 67 89',
        'Département': 'IT',
        'Poste': 'Développeur',
        'Date d\'embauche': '2023-01-15',
        'Genre': 'MALE',
        'Date de naissance': '1990-05-15',
        'Adresse': '123 Rue de la Paix, Paris',
        'Entreprise': 'OHSE CAPITAL',
        'Numéro matricule': 'MAT-1234567890'
      }]
      const worksheet = XLSX.utils.json_to_sheet(sample, { header: headers })
      // Style header row with colors
      headers.forEach((_, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index })
        if (!worksheet[cellAddress]) return
        worksheet[cellAddress].s = {
          fill: { fgColor: { rgb: 'E2E8F0' } },
          font: { bold: true, color: { rgb: '0F172A' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'CBD5E1' } },
            bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
            left: { style: 'thin', color: { rgb: 'CBD5E1' } },
            right: { style: 'thin', color: { rgb: 'CBD5E1' } },
          },
        }
      })
      // Set column widths
      worksheet['!cols'] = headers.map(() => ({ wch: 22 }))
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees')
      XLSX.writeFile(workbook, 'employees_template.xlsx')
      toast.success('Modèle Excel téléchargé avec succès')
    } catch (e) {
      console.error(e)
      toast.error("Erreur lors de la génération du modèle Excel")
    }
  }

  // Handle Excel file selection and parse
  const handleExcelFileChange = async (file: File | null) => {
    if (!file) return
    try {
      setExcelFileName(file.name)
      const XLSX: any = await import('xlsx-js-style')
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[firstSheetName]
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })
      const normalized = rows.map((row) => {
        const obj: any = {}
        Object.keys(row).forEach((key) => {
          const k = String(key).trim()
          // Map French column headers to English field names
          const map: Record<string, string> = {
            'Prénom': 'firstName',
            'Nom': 'lastName',
            'Email': 'email',
            'Téléphone': 'phoneNumber',
            'Département': 'department',
            'Poste': 'position',
            'Date d\'embauche': 'hireDate',
            'Genre': 'gender',
            'Date de naissance': 'birthDate',
            'Adresse': 'address',
            'Entreprise': 'company',
            'Numéro matricule': 'matriculeNumber',
          }
          const matched = map[k]
          if (matched) obj[matched] = (row as any)[key]
        })
        return obj
      })
      setExcelEmployees(normalized)
      toast.success(`${normalized.length} lignes chargées depuis Excel`)
    } catch (e) {
      console.error(e)
      toast.error("Impossible de lire le fichier Excel")
      setExcelEmployees([])
      setExcelFileName("")
    }
  }

  // Filtered employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
    
    return matchesSearch && matchesDepartment
  })

  if (!user?.roles?.includes("RESP_RH")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Accès refusé
            </CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </CardDescription>
          </CardHeader>
          </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <DashboardNavigation userRole="RESP_RH" currentPage="rh-employees" />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-2xl" 
                   style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`}}>
                <Users className="h-7 w-7 text-white" />
              </div>
              Gestion des Salariés
          </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
              Gérez les employés de l'entreprise • {filteredEmployees.length} salarié(s) actif(s)
          </p>
        </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button 
              onClick={fetchEmployees} 
              variant="outline" 
              className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md px-6 py-2.5"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button 
                style={{
                    background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`
                  }}
                  className="text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 px-8 py-2.5 text-base font-semibold"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Nouvel Employé
                </Button>
              </DialogTrigger>
            </Dialog>
            
            <Dialog open={showBulkImportDialog} onOpenChange={setShowBulkImportDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md px-6 py-2.5"
                >
                  <Upload className="h-5 w-5 mr-2" />
                Import en masse
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
          </div>

        {/* Main Content */}
        <div className="space-y-6">
            {/* Filters */}
            <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white text-xl">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center" 
                       style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                    <Filter className="h-4 w-4 text-white" />
                  </div>
                  Filtres et Recherche
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium text-sm">Rechercher</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Rechercher par nom, email, département..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium text-sm">Département</Label>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md">
                        <SelectValue placeholder="Sélectionner un département" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les départements</SelectItem>
                        {Array.from(new Set(employees.map(emp => emp.department).filter((dept): dept is string => Boolean(dept)))).map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employees Table */}
            <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white text-xl">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center" 
                       style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  Liste des Salariés
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-slate-500">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span>Chargement des employés...</span>
                    </div>
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center text-slate-500">
                      <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-lg font-medium">Aucun employé trouvé</p>
                      <p className="text-sm">Aucun employé ne correspond à vos critères de recherche</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                                                  <TableHead className="text-slate-700 dark:text-slate-300 font-medium py-4">Nom</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-medium py-4">Email</TableHead>
                                                  <TableHead className="text-slate-700 dark:text-slate-300 font-medium py-4">Téléphone</TableHead>
                                                    <TableHead className="text-slate-700 dark:text-slate-300 font-medium py-4">Poste</TableHead>
                          <TableHead className="text-slate-700 dark:text-slate-300 font-medium py-4 text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmployees.map((employee, index) => (
                          <TableRow 
                        key={employee.id}
                            className={`border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200 ${
                              index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/30'
                            }`}
                          >
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold text-white" 
                                     style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`}}>
                                  {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                          </div>
                                <span className="font-semibold text-slate-900 dark:text-white">
                              {employee.firstName} {employee.lastName}
                                </span>
                            </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-lg flex items-center justify-center" 
                                     style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                                  <Mail className="h-3 w-3 text-white" />
                          </div>
                                <span className="text-slate-700 dark:text-slate-300 font-medium">{employee.email}</span>
                        </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-lg flex items-center justify-center" 
                                     style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`}}>
                                  <Phone className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-slate-700 dark:text-slate-300 font-medium">{employee.phoneNumber || '-'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="text-slate-700 dark:text-slate-300">{employee.position || '-'}</span>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center justify-center gap-2">
                                {/* View Employee Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedEmployee(employee)
                                    setShowViewDialog(true)
                                  }}
                                  className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:scale-110 transition-all duration-200"
                                  title="Voir les détails"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                
                                {/* Edit Employee Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedEmployee(employee)
                                    setShowEditDialog(true)
                                  }}
                                  className="h-9 w-9 p-0 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:scale-110 transition-all duration-200"
                                  title="Modifier l'employé"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                

                              </div>
                            </TableCell>
                          </TableRow>
                    ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
                </div>
                
        {/* Create Employee Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border-0">
            <DialogHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200/60 dark:border-slate-700/60 pb-6">
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center" 
                     style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`}}>
                  <UserPlus className="h-4 w-4 text-white" />
                </div>
                Ajouter un employé
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Remplissez les informations pour créer un nouvel employé
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Prénom *</Label>
          <Input
            id="firstName"
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                    className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Prénom de l'employé"
          />
        </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Nom *</Label>
          <Input
            id="lastName"
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                    className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Nom de l'employé"
          />
        </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Email *</Label>
          <Input
            id="email"
            type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                  placeholder="email@exemple.com"
          />
        </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="phoneNumber" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Téléphone</Label>
          <Input
            id="phoneNumber"
                    value={newEmployee.phoneNumber}
                    onChange={(e) => setNewEmployee({...newEmployee, phoneNumber: e.target.value})}
                    className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="+212 6 12 34 56 78"
          />
        </div>
                <div className="space-y-3">
                  <Label htmlFor="department" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Département</Label>
          <Input
            id="department"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                    className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Ex: RH, IT, Marketing"
          />
        </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="position" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Poste</Label>
          <Input
            id="position"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                  placeholder="Ex: Développeur, Manager, Analyste"
          />
        </div>
              
              {/* Additional Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="gender" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Genre *</Label>
                  <Select value={newEmployee.gender} onValueChange={(value) => setNewEmployee({...newEmployee, gender: value})}>
                    <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Sélectionner le genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Homme</SelectItem>
                      <SelectItem value="FEMALE">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="birthDate" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Date de naissance *</Label>
          <Input
                    id="birthDate"
            type="date"
                    value={newEmployee.birthDate}
                    onChange={(e) => setNewEmployee({...newEmployee, birthDate: e.target.value})}
                    className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
          />
        </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="address" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Adresse *</Label>
          <Input
                  id="address"
                  value={newEmployee.address}
                  onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                  placeholder="Ex: 123 Rue de la Paix, Paris"
          />
        </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="company" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Entreprise *</Label>
          <Input
                    id="company"
                    value={newEmployee.company}
                    onChange={(e) => setNewEmployee({...newEmployee, company: e.target.value})}
                    className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Ex: OHSE CAPITAL"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="hireDate" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Date d'embauche *</Label>
                  <Input
                    id="hireDate"
            type="date"
                    value={newEmployee.hireDate}
                    onChange={(e) => setNewEmployee({...newEmployee, hireDate: e.target.value})}
                    className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
          />
        </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="matriculeNumber" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Numéro matricule</Label>
          <Input
                  id="matriculeNumber"
                  value={newEmployee.matriculeNumber}
                  onChange={(e) => setNewEmployee({...newEmployee, matriculeNumber: e.target.value})}
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                  placeholder="Ex: MAT-1234567890"
          />
        </div>
            </div>
            <DialogFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/60 dark:border-slate-700/60 pt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                className="border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-300"
              >
                Annuler
              </Button>
              <Button 
                onClick={createEmployee}
                style={{
                  background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`
                }}
                className="text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 px-8 py-2.5"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Créer l'employé
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mass Import Dialog */}
        <Dialog open={showBulkImportDialog} onOpenChange={setShowBulkImportDialog}>
          <DialogContent className="max-w-4xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border-0">
            <DialogHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200/60 dark:border-slate-700/60 pb-6">
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center" 
                     style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`}}>
                  <Upload className="h-4 w-4 text-white" />
                </div>
                Import en masse
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Importez plusieurs employés depuis un fichier Excel
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              {/* Template Download */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-lg">
                <div className="flex items-center justify-between">
        <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-lg">Télécharger le modèle</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Obtenez un modèle Excel avec les colonnes requises</p>
                  </div>
                  <Button
                    onClick={downloadTemplate}
                    variant="outline"
                    className="bg-white dark:bg-slate-700 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300 shadow-sm hover:shadow-md px-6 py-2.5"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le modèle
                  </Button>
                </div>
              </div>

              {/* Excel Input */}
              <div className="space-y-3">
                <Label className="text-slate-700 dark:text-slate-300 font-medium text-sm">Fichier Excel</Label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => handleExcelFileChange(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 dark:file:bg-slate-700 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 dark:hover:file:bg-slate-600"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">Colonnes: Prénom, Nom, Email, Téléphone, Département, Poste, Date d'embauche, Genre, Date de naissance, Adresse, Entreprise, Numéro matricule</p>
                {excelFileName && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">Fichier sélectionné: {excelFileName} • {excelEmployees.length} lignes détectées</p>
                )}
              </div>

              {/* Preview of employees to be imported */}
              {excelEmployees.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium text-sm">Aperçu des employés à importer</Label>
                  <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-600 rounded-lg p-3 bg-slate-50 dark:bg-slate-800/30">
                    {excelEmployees.map((emp, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold text-white bg-slate-500">
                            {emp.firstName?.charAt(0) || '?'}{emp.lastName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {emp.firstName || 'N/A'} {emp.lastName || 'N/A'}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {emp.email || 'Email manquant'} • {emp.department || 'Département manquant'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Ligne {index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {excelEmployees.length} employé(s) prêt(s) à être importé(s)
                  </p>
                </div>
              )}

              {/* Import Results */}
              {importResults.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium text-sm">Résultats de l'import</Label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {importResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.status === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {result.username || result.email}
                          </span>
                          <Badge
                            variant={result.status === 'success' ? 'default' : 'destructive'}
                            className={result.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}
                          >
                            {result.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {result.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/60 dark:border-slate-700/60 pt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowBulkImportDialog(false)}
                className="border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-300"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleBulkImport}
                disabled={isImporting || excelEmployees.length === 0}
                style={{
                  background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`
                }}
                className="text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 px-8 py-2.5"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importer depuis Excel
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Employee Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border-0">
            <DialogHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="h-6 w-6 rounded-md flex items-center justify-center" 
                     style={{background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`}}>
                  <Edit className="h-3 w-3 text-white" />
                </div>
                Modifier l'employé
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400 text-sm">
                Modifiez les informations de l'employé
              </DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="editFirstName" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Prénom *</Label>
          <Input
                      id="editFirstName"
                      value={selectedEmployee.firstName}
                      onChange={(e) => setSelectedEmployee({...selectedEmployee, firstName: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Prénom de l'employé"
          />
        </div>
                  <div className="space-y-2">
                    <Label htmlFor="editLastName" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Nom *</Label>
          <Input
                      id="editLastName"
                      value={selectedEmployee.lastName}
                      onChange={(e) => setSelectedEmployee({...selectedEmployee, lastName: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Nom de l'employé"
          />
        </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEmail" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Email *</Label>
          <Input
                    id="editEmail"
                    type="email"
                    value={selectedEmployee.email}
                    onChange={(e) => setSelectedEmployee({...selectedEmployee, email: e.target.value})}
                    className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="email@exemple.com"
          />
        </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="editPhoneNumber" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Téléphone</Label>
          <Input
                      id="editPhoneNumber"
                      value={selectedEmployee.phoneNumber}
                      onChange={(e) => setSelectedEmployee({...selectedEmployee, phoneNumber: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="+212 6 12 34 56 78"
          />
        </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDepartment" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Département</Label>
                    <Input
                      id="editDepartment"
                      value={selectedEmployee.department}
                      onChange={(e) => setSelectedEmployee({...selectedEmployee, department: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Ex: RH, IT, Marketing"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPosition" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Poste</Label>
                  <Input
                    id="editPosition"
                    value={selectedEmployee.position}
                    onChange={(e) => setSelectedEmployee({...selectedEmployee, position: e.target.value})}
                    className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Ex: Développeur, Manager, Analyste"
                  />
      </div>

                {/* Additional Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="editGender" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Genre *</Label>
                    <Select value={selectedEmployee.gender} onValueChange={(value) => setSelectedEmployee({...selectedEmployee, gender: value})}>
                      <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md">
                        <SelectValue placeholder="Sélectionner le genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Homme</SelectItem>
                        <SelectItem value="FEMALE">Femme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editBirthDate" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Date de naissance *</Label>
                    <Input
                      id="editBirthDate"
                      type="date"
                      value={selectedEmployee.birthDate}
                      onChange={(e) => setSelectedEmployee({...selectedEmployee, birthDate: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editAddress" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Adresse *</Label>
                  <Input
                    id="editAddress"
                    value={selectedEmployee.address}
                    onChange={(e) => setSelectedEmployee({...selectedEmployee, address: e.target.value})}
                    className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Ex: 123 Rue de la Paix, Paris"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="editCompany" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Entreprise *</Label>
                    <Input
                      id="editCompany"
                      value={selectedEmployee.company}
                      onChange={(e) => setSelectedEmployee({...selectedEmployee, company: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Ex: OHSE CAPITAL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editHireDate" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Date d'embauche *</Label>
                    <Input
                      id="editHireDate"
                      type="date"
                      value={selectedEmployee.hireDate}
                      onChange={(e) => setSelectedEmployee({...selectedEmployee, hireDate: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editMatriculeNumber" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Numéro matricule</Label>
                  <Input
                    id="editMatriculeNumber"
                    value={selectedEmployee.matriculeNumber}
                    onChange={(e) => setSelectedEmployee({...selectedEmployee, matriculeNumber: e.target.value})}
                    className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Ex: MAT-1234567890"
                  />
                </div>

                {/* Manager Assignment Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="editManager1" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Responsable N+1</Label>
                    <Select value={selectedEmployee.manager1Id?.toString() || "none"} onValueChange={(value) => setSelectedEmployee({...selectedEmployee, manager1Id: value === "none" ? undefined : parseInt(value)})}>
                      <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md">
                        <SelectValue placeholder="Sélectionner le responsable N+1" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun</SelectItem>
                        {employees
                          .filter(emp => emp.id !== selectedEmployee.id)
                          .map(emp => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>
                              {emp.firstName} {emp.lastName} - {emp.department || 'N/A'}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editManager2" className="text-slate-700 dark:text-slate-300 font-medium text-sm">Responsable N+2</Label>
                    <Select value={selectedEmployee.manager2Id?.toString() || "none"} onValueChange={(value) => setSelectedEmployee({...selectedEmployee, manager2Id: value === "none" ? undefined : parseInt(value)})}>
                      <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500 transition-all duration-300 shadow-sm hover:shadow-md">
                        <SelectValue placeholder="Sélectionner le responsable N+2" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun</SelectItem>
                        {employees
                          .filter(emp => emp.id !== selectedEmployee.id)
                          .map(emp => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>
                              {emp.firstName} {emp.lastName} - {emp.department || 'N/A'}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/60 dark:border-slate-700/60 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
                className="border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-300"
              >
          Annuler
        </Button>
              <Button 
                onClick={updateEmployee}
                style={{
                  background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[600]})`
                }}
                className="text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 px-8 py-2.5"
              >
                <Edit className="h-4 w-4 mr-2" />
                Mettre à jour
        </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Employee Dialog */}
        <EmployeeInfoDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          employeeId={selectedEmployee?.id || 0}
        />


      </div>
    </div>
  )
}
