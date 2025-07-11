"use client"

import { useState } from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, Shield, Users, Settings, Home, AlertTriangle, FileText, Globe, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

interface NavigationProps {
  language?: "en" | "fr"
}

export function Navigation({ language = "fr" }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState(language)
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const text = {
    fr: {
      home: "Tableau de bord",
      safety: "Sécurité",
      employees: "Employés",
      incidents: "Incidents",
      reports: "Rapports",
      settings: "Paramètres",
      logout: "Déconnexion",
    },
    en: {
      home: "Dashboard",
      safety: "Safety",
      employees: "Employees",
      incidents: "Incidents",
      reports: "Reports",
      settings: "Settings",
      logout: "Logout",
    },
  }

  const t = text[currentLanguage]

  const navigation = [
    { name: t.home, href: "/dashboard", icon: Home },
    { name: t.safety, href: "/safety", icon: Shield },
    { name: t.employees, href: "/employees", icon: Users },
    { name: t.incidents, href: "/incidents", icon: AlertTriangle },
    { name: t.reports, href: "/reports", icon: FileText },
    { name: t.settings, href: "/settings", icon: Settings },
  ]

  const handleNavigation = (href: string) => {
    setIsNavigating(true)
    setIsOpen(false)

    // Add a small delay to show loading state
    setTimeout(() => {
      router.push(href)
      setIsNavigating(false)
    }, 100)
  }

  const handleLogout = () => {
    setIsNavigating(true)
    setTimeout(() => {
      logout()
    }, 100)
  }

  return (
    <>
      {/* Navigation Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 flex items-center justify-center">
          <div className="loading-spinner" />
        </div>
      )}

      <nav className="ohse-card border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => handleNavigation("/dashboard")} className="flex items-center gap-3">
                <Image src="/images/ohse-logo.png" alt="OHSE Capital" width={32} height={32} className="h-8 w-8" />
                <span className="text-xl font-bold ohse-text-burgundy">OHSE CAPITAL</span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      pathname === item.href
                        ? "bg-red-50 dark:bg-red-900/20 ohse-text-burgundy shadow-sm"
                        : "ohse-text-secondary hover:ohse-text-primary hover:bg-slate-50 dark:hover:bg-slate-700",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </button>
                )
              })}

              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setCurrentLanguage(currentLanguage === "en" ? "fr" : "en")}
                  className="h-9 px-3 text-sm font-medium rounded-lg ohse-btn-secondary flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  {currentLanguage === "en" ? "FR" : "EN"}
                </button>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="ohse-text-secondary hover:ohse-bg-burgundy hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t.logout}
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-700">
            <div className="px-4 pt-2 pb-3 space-y-1 bg-slate-50 dark:bg-slate-800">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200",
                      pathname === item.href
                        ? "bg-red-50 dark:bg-red-900/20 ohse-text-burgundy"
                        : "ohse-text-secondary hover:ohse-text-primary hover:bg-slate-100 dark:hover:bg-slate-700",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </button>
                )
              })}

              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <button
                  onClick={() => setCurrentLanguage(currentLanguage === "en" ? "fr" : "en")}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium ohse-btn-secondary"
                >
                  <Globe className="h-5 w-5" />
                  {currentLanguage === "en" ? "Français" : "English"}
                </button>

                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start gap-3 px-3 py-3 h-auto text-base font-medium ohse-text-secondary hover:ohse-bg-burgundy hover:text-white transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  {t.logout}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
