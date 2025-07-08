"use client"

import { useState } from "react"
import { Navigation } from "../../components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, User, Bell, Shield, Globe, Save } from "lucide-react"

export default function SettingsPage() {
  const [language, setLanguage] = useState<"en" | "fr">("en")
  const [notifications, setNotifications] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const text = {
    en: {
      title: "Settings",
      subtitle: "Manage your account and application preferences",
      profile: "Profile Settings",
      notifications: "Notification Settings",
      security: "Security Settings",
      preferences: "Preferences",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      department: "Department",
      enableNotifications: "Enable Notifications",
      emailAlerts: "Email Alerts",
      pushNotifications: "Push Notifications",
      changePassword: "Change Password",
      twoFactor: "Two-Factor Authentication",
      language: "Language",
      theme: "Theme",
      darkMode: "Dark Mode",
      saveChanges: "Save Changes",
    },
    fr: {
      title: "Paramètres",
      subtitle: "Gérer votre compte et préférences d'application",
      profile: "Paramètres de Profil",
      notifications: "Paramètres de Notification",
      security: "Paramètres de Sécurité",
      preferences: "Préférences",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Adresse Email",
      department: "Département",
      enableNotifications: "Activer Notifications",
      emailAlerts: "Alertes Email",
      pushNotifications: "Notifications Push",
      changePassword: "Changer Mot de Passe",
      twoFactor: "Authentification à Deux Facteurs",
      language: "Langue",
      theme: "Thème",
      darkMode: "Mode Sombre",
      saveChanges: "Sauvegarder",
    },
  }

  const t = text[language]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation language={language} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold ohse-text-primary">{t.title}</h1>
          <p className="ohse-text-secondary mt-2">{t.subtitle}</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Settings */}
          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 ohse-text-primary">
                <User className="h-5 w-5" />
                {t.profile}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="ohse-text-primary">
                    {t.firstName}
                  </Label>
                  <Input id="firstName" defaultValue="John" className="ohse-input" />
                </div>
                <div>
                  <Label htmlFor="lastName" className="ohse-text-primary">
                    {t.lastName}
                  </Label>
                  <Input id="lastName" defaultValue="Doe" className="ohse-input" />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="ohse-text-primary">
                  {t.email}
                </Label>
                <Input id="email" type="email" defaultValue="john.doe@company.com" className="ohse-input" />
              </div>
              <div>
                <Label htmlFor="department" className="ohse-text-primary">
                  {t.department}
                </Label>
                <Input id="department" defaultValue="Safety Management" className="ohse-input" />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 ohse-text-primary">
                <Bell className="h-5 w-5" />
                {t.notifications}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="ohse-text-primary">{t.enableNotifications}</Label>
                  <p className="text-sm ohse-text-secondary">Receive notifications about safety alerts</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="ohse-text-primary">{t.emailAlerts}</Label>
                  <p className="text-sm ohse-text-secondary">Get email notifications for incidents</p>
                </div>
                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 ohse-text-primary">
                <Shield className="h-5 w-5" />
                {t.security}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="ohse-btn-secondary bg-transparent border-slate-200 dark:border-slate-600"
              >
                {t.changePassword}
              </Button>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="ohse-text-primary">{t.twoFactor}</Label>
                  <p className="text-sm ohse-text-secondary">Add an extra layer of security</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ohse-btn-secondary bg-transparent border-slate-200 dark:border-slate-600"
                >
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="ohse-card animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 ohse-text-primary">
                <Settings className="h-5 w-5" />
                {t.preferences}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 ohse-text-secondary" />
                  <Label className="ohse-text-primary">{t.language}</Label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLanguage(language === "en" ? "fr" : "en")}
                  className="ohse-btn-secondary border-slate-200 dark:border-slate-600"
                >
                  {language === "en" ? "Français" : "English"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="ohse-text-primary">{t.darkMode}</Label>
                  <p className="text-sm ohse-text-secondary">Switch to dark theme</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <Button className="ohse-btn-primary">
              <Save className="h-4 w-4 mr-2" />
              {t.saveChanges}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
