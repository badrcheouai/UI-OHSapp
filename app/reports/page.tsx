"use client"

import { useState } from "react"
import { Navigation } from "../../components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, BarChart3, TrendingUp } from "lucide-react"

export default function ReportsPage() {
  const [language, setLanguage] = useState<"en" | "fr">("en")

  const text = {
    en: {
      title: "Reports & Analytics",
      subtitle: "Generate and view safety performance reports",
      generateReport: "Generate Report",
      monthlyReports: "Monthly Reports",
      safetyMetrics: "Safety Metrics",
      complianceReports: "Compliance Reports",
      downloadReport: "Download",
      viewReport: "View Report",
      lastGenerated: "Last Generated",
    },
    fr: {
      title: "Rapports et Analyses",
      subtitle: "Générer et consulter les rapports de performance sécuritaire",
      generateReport: "Générer Rapport",
      monthlyReports: "Rapports Mensuels",
      safetyMetrics: "Métriques de Sécurité",
      complianceReports: "Rapports de Conformité",
      downloadReport: "Télécharger",
      viewReport: "Voir Rapport",
      lastGenerated: "Dernière Génération",
    },
  }

  const t = text[language]

  const reports = [
    {
      id: 1,
      title: "Monthly Safety Report - January 2024",
      type: "monthly",
      generated: "2024-01-31",
      size: "2.4 MB",
    },
    {
      id: 2,
      title: "Incident Analysis Report",
      type: "incident",
      generated: "2024-01-28",
      size: "1.8 MB",
    },
    {
      id: 3,
      title: "Compliance Audit Report",
      type: "compliance",
      generated: "2024-01-25",
      size: "3.2 MB",
    },
    {
      id: 4,
      title: "Training Effectiveness Report",
      type: "training",
      generated: "2024-01-20",
      size: "1.5 MB",
    },
  ]

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
              <FileText className="h-4 w-4 mr-2" />
              {t.generateReport}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ohse-text-secondary">{t.monthlyReports}</CardTitle>
              <Calendar className="h-5 w-5 ohse-text-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ohse-text-primary">12</div>
              <p className="text-xs ohse-text-secondary">Generated this year</p>
            </CardContent>
          </Card>

          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ohse-text-secondary">{t.safetyMetrics}</CardTitle>
              <BarChart3 className="h-5 w-5 ohse-text-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ohse-text-primary">94.2%</div>
              <p className="text-xs ohse-text-secondary">Average safety score</p>
            </CardContent>
          </Card>

          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ohse-text-secondary">{t.complianceReports}</CardTitle>
              <TrendingUp className="h-5 w-5 ohse-text-burgundy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ohse-text-primary">98.7%</div>
              <p className="text-xs ohse-text-secondary">Compliance rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle className="ohse-text-primary">Available Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 ohse-gradient-red rounded-xl flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold ohse-text-primary">{report.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs ohse-text-secondary">
                          {t.lastGenerated}: {report.generated}
                        </p>
                        <p className="text-xs ohse-text-secondary">Size: {report.size}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="ohse-btn-secondary bg-transparent border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {t.viewReport}
                    </Button>
                    <Button size="sm" className="ohse-btn-primary">
                      <Download className="h-4 w-4 mr-2" />
                      {t.downloadReport}
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
