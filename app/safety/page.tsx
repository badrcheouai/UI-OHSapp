"use client"

import { useState } from "react"
import { Navigation } from "../../components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, CheckCircle, Clock, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function SafetyPage() {
  const [language, setLanguage] = useState<"en" | "fr">("en")

  const text = {
    en: {
      title: "Safety Management",
      subtitle: "Monitor and manage workplace safety protocols",
      searchPlaceholder: "Search safety protocols...",
      addProtocol: "Add Protocol",
      activeProtocols: "Active Protocols",
      pendingReviews: "Pending Reviews",
      completedAudits: "Completed Audits",
      riskLevel: "Risk Level",
      status: "Status",
      lastUpdated: "Last Updated",
      high: "High",
      medium: "Medium",
      low: "Low",
      active: "Active",
      pending: "Pending",
      completed: "Completed",
    },
    fr: {
      title: "Gestion de la Sécurité",
      subtitle: "Surveiller et gérer les protocoles de sécurité au travail",
      searchPlaceholder: "Rechercher protocoles de sécurité...",
      addProtocol: "Ajouter Protocole",
      activeProtocols: "Protocoles Actifs",
      pendingReviews: "Révisions en Attente",
      completedAudits: "Audits Terminés",
      riskLevel: "Niveau de Risque",
      status: "Statut",
      lastUpdated: "Dernière Mise à Jour",
      high: "Élevé",
      medium: "Moyen",
      low: "Faible",
      active: "Actif",
      pending: "En Attente",
      completed: "Terminé",
    },
  }

  const t = text[language]

  const safetyProtocols = [
    {
      id: 1,
      title: "Fire Safety Protocol",
      description: "Emergency evacuation procedures and fire prevention measures",
      riskLevel: "high",
      status: "active",
      lastUpdated: "2024-01-10",
    },
    {
      id: 2,
      title: "Chemical Handling Safety",
      description: "Safe handling and storage of hazardous chemicals",
      riskLevel: "high",
      status: "active",
      lastUpdated: "2024-01-08",
    },
    {
      id: 3,
      title: "Equipment Maintenance",
      description: "Regular maintenance schedule for safety equipment",
      riskLevel: "medium",
      status: "pending",
      lastUpdated: "2024-01-05",
    },
    {
      id: 4,
      title: "Personal Protective Equipment",
      description: "PPE requirements and usage guidelines",
      riskLevel: "medium",
      status: "active",
      lastUpdated: "2024-01-03",
    },
    {
      id: 5,
      title: "Workplace Ergonomics",
      description: "Guidelines for ergonomic workplace setup",
      riskLevel: "low",
      status: "completed",
      lastUpdated: "2023-12-28",
    },
  ]

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "destructive"
      case "medium":
        return "outline" // Changed to neutral outline
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 ohse-text-green" />
      case "pending":
        return <Clock className="h-4 w-4 ohse-text-orange" />
      case "completed":
        return <CheckCircle className="h-4 w-4 ohse-text-green" />
      default:
        return <AlertTriangle className="h-4 w-4 ohse-text-red" />
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
              <Plus className="h-4 w-4 mr-2" />
              {t.addProtocol}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ohse-text-secondary">{t.activeProtocols}</CardTitle>
              <Shield className="h-5 w-5 ohse-text-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ohse-text-primary">12</div>
              <p className="text-xs ohse-text-secondary">+2 from last month</p>
            </CardContent>
          </Card>

          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ohse-text-secondary">{t.pendingReviews}</CardTitle>
              <Clock className="h-5 w-5 ohse-text-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ohse-text-primary">3</div>
              <p className="text-xs ohse-text-secondary">Due this week</p>
            </CardContent>
          </Card>

          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ohse-text-secondary">{t.completedAudits}</CardTitle>
              <CheckCircle className="h-5 w-5 ohse-text-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ohse-text-primary">8</div>
              <p className="text-xs ohse-text-secondary">This quarter</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="ohse-card mb-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ohse-text-secondary" />
              <Input placeholder={t.searchPlaceholder} className="pl-10 ohse-input" />
            </div>
          </CardContent>
        </Card>

        {/* Safety Protocols List */}
        <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <CardHeader>
            <CardTitle className="ohse-text-primary">Safety Protocols</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safetyProtocols.map((protocol, index) => (
                <div
                  key={protocol.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 ohse-gradient-red rounded-xl flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold ohse-text-primary">{protocol.title}</h3>
                      <p className="text-sm ohse-text-secondary">{protocol.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={getRiskBadgeColor(protocol.riskLevel)}
                          className="border-slate-200 dark:border-slate-600"
                        >
                          {t.riskLevel}: {t[protocol.riskLevel as keyof typeof t]}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(protocol.status)}
                          <span className="text-xs ohse-text-secondary">{t[protocol.status as keyof typeof t]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs ohse-text-secondary">{t.lastUpdated}</p>
                    <p className="text-xs ohse-text-secondary">{protocol.lastUpdated}</p>
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
