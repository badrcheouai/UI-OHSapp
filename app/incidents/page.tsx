"use client"

import { useState } from "react"
import { Navigation } from "../../components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Plus, Search, Calendar, User, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function IncidentsPage() {
  const [language, setLanguage] = useState<"en" | "fr">("en")

  const text = {
    en: {
      title: "Incident Management",
      subtitle: "Track and manage workplace incidents and near misses",
      searchPlaceholder: "Search incidents...",
      reportIncident: "Report Incident",
      totalIncidents: "Total Incidents",
      openCases: "Open Cases",
      resolvedCases: "Resolved Cases",
      severity: "Severity",
      status: "Status",
      reportedBy: "Reported By",
      location: "Location",
      date: "Date",
      high: "High",
      medium: "Medium",
      low: "Low",
      open: "Open",
      investigating: "Investigating",
      resolved: "Resolved",
    },
    fr: {
      title: "Gestion des Incidents",
      subtitle: "Suivre et gérer les incidents et quasi-accidents au travail",
      searchPlaceholder: "Rechercher incidents...",
      reportIncident: "Signaler Incident",
      totalIncidents: "Total Incidents",
      openCases: "Cas Ouverts",
      resolvedCases: "Cas Résolus",
      severity: "Gravité",
      status: "Statut",
      reportedBy: "Signalé Par",
      location: "Lieu",
      date: "Date",
      high: "Élevé",
      medium: "Moyen",
      low: "Faible",
      open: "Ouvert",
      investigating: "En Investigation",
      resolved: "Résolu",
    },
  }

  const t = text[language]

  const incidents = [
    {
      id: 1,
      title: "Chemical Spill in Lab 3",
      description: "Minor chemical spill during routine testing",
      severity: "medium",
      status: "investigating",
      reportedBy: "John Doe",
      location: "Laboratory 3",
      date: "2024-01-10",
    },
    {
      id: 2,
      title: "Slip and Fall Incident",
      description: "Employee slipped on wet floor in cafeteria",
      severity: "low",
      status: "resolved",
      reportedBy: "Jane Smith",
      location: "Cafeteria",
      date: "2024-01-08",
    },
    {
      id: 3,
      title: "Equipment Malfunction",
      description: "Safety guard failure on manufacturing equipment",
      severity: "high",
      status: "open",
      reportedBy: "Mike Johnson",
      location: "Production Floor A",
      date: "2024-01-12",
    },
    {
      id: 4,
      title: "Near Miss - Falling Object",
      description: "Tool fell from height, no injury occurred",
      severity: "medium",
      status: "resolved",
      reportedBy: "Sarah Wilson",
      location: "Warehouse",
      date: "2024-01-05",
    },
  ]

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">{t.high}</Badge>
      case "medium":
        return <Badge className="status-warning">{t.medium}</Badge>
      case "low":
        return <Badge className="status-success">{t.low}</Badge>
      default:
        return <Badge variant="secondary">{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive">{t.open}</Badge>
      case "investigating":
        return <Badge className="status-info">{t.investigating}</Badge>
      case "resolved":
        return <Badge className="status-success">{t.resolved}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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
              {t.reportIncident}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ohse-text-secondary">{t.totalIncidents}</CardTitle>
              <AlertTriangle className="h-5 w-5 ohse-text-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ohse-text-primary">47</div>
              <p className="text-xs ohse-text-secondary">This year</p>
            </CardContent>
          </Card>

          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ohse-text-secondary">{t.openCases}</CardTitle>
              <AlertTriangle className="h-5 w-5 ohse-text-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ohse-text-primary">8</div>
              <p className="text-xs ohse-text-secondary">Requires attention</p>
            </CardContent>
          </Card>

          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ohse-text-secondary">{t.resolvedCases}</CardTitle>
              <AlertTriangle className="h-5 w-5 ohse-text-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ohse-text-primary">39</div>
              <p className="text-xs ohse-text-secondary">83% resolution rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="ohse-card mb-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ohse-text-secondary" />
              <Input placeholder={t.searchPlaceholder} className="pl-10 ohse-input" />
            </div>
          </CardContent>
        </Card>

        {/* Incidents List */}
        <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <CardHeader>
            <CardTitle className="ohse-text-primary">Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incidents.map((incident, index) => (
                <div
                  key={incident.id}
                  className="flex items-start justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 ohse-gradient-red rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold ohse-text-primary mb-1">{incident.title}</h3>
                      <p className="text-sm ohse-text-secondary mb-3">{incident.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs ohse-text-secondary">{t.severity}:</span>
                          {getSeverityBadge(incident.severity)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs ohse-text-secondary">{t.status}:</span>
                          {getStatusBadge(incident.status)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs ohse-text-secondary">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>
                            {t.reportedBy}: {incident.reportedBy}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {t.location}: {incident.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {t.date}: {incident.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="ohse-text-burgundy hover:underline">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
