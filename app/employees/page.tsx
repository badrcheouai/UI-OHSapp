"use client"

import { useState } from "react"
import { Navigation } from "../../components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, UserPlus, Search, Filter, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function EmployeesPage() {
  const [language, setLanguage] = useState<"en" | "fr">("en")

  const text = {
    en: {
      title: "Employee Management",
      subtitle: "Manage employee safety profiles and training records",
      searchPlaceholder: "Search employees...",
      addEmployee: "Add Employee",
      totalEmployees: "Total Employees",
      activeTraining: "Active Training",
      certificationsDue: "Certifications Due",
      name: "Name",
      department: "Department",
      safetyStatus: "Safety Status",
      lastTraining: "Last Training",
      compliant: "Compliant",
      pending: "Pending",
      overdue: "Overdue",
    },
    fr: {
      title: "Gestion des Employés",
      subtitle: "Gérer les profils de sécurité et dossiers de formation des employés",
      searchPlaceholder: "Rechercher employés...",
      addEmployee: "Ajouter Employé",
      totalEmployees: "Total Employés",
      activeTraining: "Formation Active",
      certificationsDue: "Certifications Dues",
      name: "Nom",
      department: "Département",
      safetyStatus: "Statut Sécurité",
      lastTraining: "Dernière Formation",
      compliant: "Conforme",
      pending: "En Attente",
      overdue: "En Retard",
    },
  }

  const t = text[language]

  const employees = [
    {
      id: 1,
      name: "John Doe",
      department: "Manufacturing",
      safetyStatus: "compliant",
      lastTraining: "2024-01-05",
      avatar: "JD",
    },
    {
      id: 2,
      name: "Jane Smith",
      department: "Chemical Processing",
      safetyStatus: "pending",
      lastTraining: "2023-12-20",
      avatar: "JS",
    },
    {
      id: 3,
      name: "Mike Johnson",
      department: "Maintenance",
      safetyStatus: "compliant",
      lastTraining: "2024-01-08",
      avatar: "MJ",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      department: "Quality Control",
      safetyStatus: "overdue",
      lastTraining: "2023-11-15",
      avatar: "SW",
    },
    {
      id: 5,
      name: "David Brown",
      department: "Logistics",
      safetyStatus: "compliant",
      lastTraining: "2024-01-03",
      avatar: "DB",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return <Badge className="px-3 py-1.5 text-xs font-semibold border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-200 shadow-emerald-200/50 dark:shadow-emerald-800/30">{t.compliant}</Badge>
      case "pending":
        return <Badge className="px-3 py-1.5 text-xs font-semibold border-2 border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-200 shadow-amber-200/50 dark:shadow-amber-800/30">{t.pending}</Badge>
      case "overdue":
        return <Badge className="px-3 py-1.5 text-xs font-semibold border-2 border-red-600 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-200 shadow-red-200/50 dark:shadow-red-800/30">{t.overdue}</Badge>
      default:
        return <Badge className="px-3 py-1.5 text-xs font-semibold border-2 border-slate-500 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/30 text-slate-700 dark:text-slate-200 shadow-slate-200/50 dark:shadow-slate-800/30">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 ohse-text-green" />
      case "pending":
        return <Clock className="h-4 w-4 ohse-text-orange" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4 ohse-text-red" />
      default:
        return <Clock className="h-4 w-4 ohse-text-secondary" />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation language={language} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-up">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold ohse-text-primary">{t.title}</h1>
              <p className="ohse-text-secondary mt-2">{t.subtitle}</p>
            </div>
            <Button className="ohse-btn-primary">
              <UserPlus className="h-4 w-4 mr-2" />
              {t.addEmployee}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ohse-text-secondary">{t.totalEmployees}</CardTitle>
              <Users className="h-5 w-5 ohse-text-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ohse-text-primary">1,247</div>
              <p className="text-xs ohse-text-secondary">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ohse-text-secondary">{t.activeTraining}</CardTitle>
              <CheckCircle className="h-5 w-5 ohse-text-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ohse-text-primary">89</div>
              <p className="text-xs ohse-text-secondary">In progress</p>
            </CardContent>
          </Card>

          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ohse-text-secondary">{t.certificationsDue}</CardTitle>
              <AlertTriangle className="h-5 w-5 ohse-text-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ohse-text-primary">23</div>
              <p className="text-xs ohse-text-secondary">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="ohse-card mb-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ohse-text-secondary" />
                <Input placeholder={t.searchPlaceholder} className="pl-10 ohse-input" />
              </div>
              <Button
                variant="outline"
                className="ohse-btn-secondary bg-transparent border-slate-200 dark:border-slate-600"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employees List */}
        <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <CardHeader>
            <CardTitle className="ohse-text-primary">Employee Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.map((employee, index) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="ohse-gradient-red text-white font-semibold">
                        {employee.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold ohse-text-primary">{employee.name}</h3>
                      <p className="text-sm ohse-text-secondary">{employee.department}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusIcon(employee.safetyStatus)}
                        {getStatusBadge(employee.safetyStatus)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs ohse-text-secondary">{t.lastTraining}</p>
                    <p className="text-xs ohse-text-secondary">{employee.lastTraining}</p>
                    <Button variant="ghost" size="sm" className="mt-2 ohse-text-burgundy hover:underline">
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
