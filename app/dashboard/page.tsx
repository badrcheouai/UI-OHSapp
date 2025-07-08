"use client"

import { useState, useEffect } from "react"
import { Navigation } from "../../components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  FileText,
  Calendar,
  ArrowRight,
} from "lucide-react"

export default function DashboardPage() {
  const [language, setLanguage] = useState<"en" | "fr">("fr")
  const [safetyScore, setSafetyScore] = useState(0)
  const [activeEmployees, setActiveEmployees] = useState(0)
  const [incidents, setIncidents] = useState(0)
  const [compliance, setCompliance] = useState(0)

  // Animated counters
  useEffect(() => {
    const animateValue = (setter: (value: number) => void, target: number, duration = 2000) => {
      let start = 0
      const increment = target / (duration / 16)
      const timer = setInterval(() => {
        start += increment
        if (start >= target) {
          setter(target)
          clearInterval(timer)
        } else {
          setter(Math.floor(start))
        }
      }, 16)
    }

    setTimeout(() => animateValue(setSafetyScore, 94.2), 200)
    setTimeout(() => animateValue(setActiveEmployees, 1247), 400)
    setTimeout(() => animateValue(setIncidents, 3), 600)
    setTimeout(() => animateValue(setCompliance, 98.7), 800)
  }, [])

  const text = {
    fr: {
      title: "Tableau de Bord Sécurité",
      subtitle: "Aperçu en temps réel des métriques de sécurité au travail",
      safetyScore: "Score de Sécurité",
      activeEmployees: "Employés Actifs",
      incidents: "Incidents ce Mois",
      compliance: "Taux de Conformité",
      recentActivity: "Activité Récente",
      upcomingTraining: "Formation à Venir",
      viewAll: "Voir Tout",
      excellent: "Excellent",
      quickActions: "Actions Rapides",
      reportIncident: "Signaler Incident",
      scheduleTraining: "Planifier Formation",
      viewReports: "Voir Rapports",
    },
    en: {
      title: "Safety Dashboard",
      subtitle: "Real-time overview of workplace safety metrics",
      safetyScore: "Safety Score",
      activeEmployees: "Active Employees",
      incidents: "Incidents This Month",
      compliance: "Compliance Rate",
      recentActivity: "Recent Activity",
      upcomingTraining: "Upcoming Training",
      viewAll: "View All",
      excellent: "Excellent",
      quickActions: "Quick Actions",
      reportIncident: "Report Incident",
      scheduleTraining: "Schedule Training",
      viewReports: "View Reports",
    },
  }

  const t = text[language]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navigation language={language} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold ohse-text-primary">{t.title}</h1>
          <p className="ohse-text-secondary mt-2">{t.subtitle}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ohse-text-secondary">{t.safetyScore}</CardTitle>
              <div className="h-10 w-10 ohse-bg-green rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold ohse-text-green mb-2">{safetyScore.toFixed(1)}%</div>
              <Progress value={safetyScore} className="h-2 mb-2" />
              <p className="text-xs ohse-text-secondary">{t.excellent}</p>
            </CardContent>
          </Card>

          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ohse-text-secondary">{t.activeEmployees}</CardTitle>
              <div className="h-10 w-10 bg-slate-600 dark:bg-slate-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold ohse-text-primary mb-2">{activeEmployees.toLocaleString()}</div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 ohse-text-green" />
                <p className="text-xs ohse-text-green">+12% du mois dernier</p>
              </div>
            </CardContent>
          </Card>

          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ohse-text-secondary">{t.incidents}</CardTitle>
              <div className="h-10 w-10 bg-orange-500 dark:bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">{incidents}</div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 ohse-text-green rotate-180" />
                <p className="text-xs ohse-text-green">-50% du mois dernier</p>
              </div>
            </CardContent>
          </Card>

          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium ohse-text-secondary">{t.compliance}</CardTitle>
              <div className="h-10 w-10 ohse-gradient-burgundy rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold ohse-text-burgundy mb-2">{compliance.toFixed(1)}%</div>
              <Progress value={compliance} className="h-2 mb-2" />
              <p className="text-xs ohse-text-secondary">{t.excellent}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="ohse-card mb-8 animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <CardHeader>
            <CardTitle className="ohse-text-primary">{t.quickActions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-16 ohse-btn-primary justify-between group">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{t.reportIncident}</span>
                </div>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                className="h-16 justify-between group border-emerald-200 hover:bg-emerald-50 dark:border-emerald-700 dark:hover:bg-emerald-900/20 bg-transparent"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 ohse-text-green" />
                  <span className="ohse-text-green">{t.scheduleTraining}</span>
                </div>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform ohse-text-green" />
              </Button>
              <Button
                variant="outline"
                className="h-16 justify-between group bg-transparent border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 ohse-text-primary" />
                  <span className="ohse-text-primary">{t.viewReports}</span>
                </div>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.6s" }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 ohse-text-primary">
                <div className="h-8 w-8 ohse-bg-green rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                {t.recentActivity}
              </CardTitle>
              <Button variant="ghost" size="sm" className="ohse-text-burgundy hover:underline hover:ohse-text-burgundy">
                {t.viewAll}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  action: "Formation sécurité terminée",
                  user: "Jean Dupont",
                  time: "Il y a 2 heures",
                  type: "success",
                },
                { action: "Rapport d'incident déposé", user: "Marie Martin", time: "Il y a 4 heures", type: "warning" },
                {
                  action: "Évaluation des risques mise à jour",
                  user: "Pierre Durand",
                  time: "Il y a 1 jour",
                  type: "info",
                },
                {
                  action: "Contrôle de conformité réussi",
                  user: "Sophie Moreau",
                  time: "Il y a 2 jours",
                  type: "success",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:shadow-md transition-all duration-200 animate-fade-in interactive-hover"
                  style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        activity.type === "success"
                          ? "status-success"
                          : activity.type === "warning"
                            ? "status-warning"
                            : "status-info"
                      }
                    >
                      {activity.type}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium ohse-text-primary">{activity.action}</p>
                      <p className="text-xs ohse-text-secondary">{activity.user}</p>
                    </div>
                  </div>
                  <span className="text-xs ohse-text-secondary">{activity.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.7s" }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 ohse-text-primary">
                <div className="h-8 w-8 bg-slate-600 dark:bg-slate-500 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                {t.upcomingTraining}
              </CardTitle>
              <Button variant="ghost" size="sm" className="ohse-text-burgundy hover:underline hover:ohse-text-burgundy">
                {t.viewAll}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "Formation Sécurité Incendie", date: "15 Jan 2024", participants: 45, status: "upcoming" },
                { title: "Certification Premiers Secours", date: "22 Jan 2024", participants: 32, status: "upcoming" },
                { title: "Sécurité Équipements", date: "5 Fév 2024", participants: 28, status: "scheduled" },
                { title: "Procédures d'Urgence", date: "12 Fév 2024", participants: 67, status: "scheduled" },
              ].map((training, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 animate-fade-in interactive-hover"
                  style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 ohse-text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium ohse-text-primary">{training.title}</p>
                      <p className="text-xs ohse-text-secondary">{training.date}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize border-slate-200 dark:border-slate-600">
                    {training.participants}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
