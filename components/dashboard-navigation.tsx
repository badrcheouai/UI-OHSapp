"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CompanyLogo } from "@/components/company-logo"
import { ThemeSelector } from "@/components/theme-selector"
import NotificationBell from "@/components/NotificationBell"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, ChevronDown, Home, Stethoscope, Globe, Users, Calendar } from "lucide-react"
import Link from "next/link"
import { useState, useContext } from "react"
import { useTranslation, LanguageProvider } from "@/components/language-toggle"

interface DashboardNavigationProps {
  userRole: string
  currentPage?: string
}

function DashboardNavigationContent({ userRole, currentPage = "dashboard" }: DashboardNavigationProps) {
  const { user, logout } = useAuth()
  const { themeColors } = useTheme()
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "fr">("fr")
  
  // Simple translation function
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      fr: {
        "Mon profil": "Mon profil",
        "Déconnexion": "Déconnexion",
        "Tableau de bord": "Tableau de bord",
        "Visite Médicale": "Visite Médicale",
        "Demande de Visite Médicale": "Demande de Visite Médicale",
        "Gestion des salariés": "Gestion des salariés",
        "Visites médicales": "Visites médicales"
      },
      en: {
        "Mon profil": "My Profile",
        "Déconnexion": "Logout",
        "Tableau de bord": "Dashboard",
        "Visite Médicale": "Medical Visit",
        "Demande de Visite Médicale": "Medical Visit Request",
        "Gestion des salariés": "Employee Management",
        "Visites médicales": "Medical Visits"
      }
    }
    return translations[language][key] || key
  }

  // Use theme gradients instead of hardcoded colors
  const getRoleColor = () => {
    return `from-${themeColors.colors.primary[500]} to-${themeColors.colors.primary[700]}`
  }

  const getRoleColorDark = () => {
    return `from-${themeColors.colors.primary[600]} to-${themeColors.colors.primary[800]}`
  }

  // Get theme color for inline styles
  const getThemeColor = (shade: keyof typeof themeColors.colors.primary) => {
    return themeColors.colors.primary[shade]
  }

  const getNotificationGradient = () => {
    return `linear-gradient(90deg, ${themeColors.colors.primary[500]} 0%, ${themeColors.colors.primary[700]} 100%)`
  }

  const getNavigationLabel = () => {
    switch (userRole) {
      case "SALARIE":
        return "Visite Médicale"
      case "INFIRMIER_ST":
      case "MEDECIN_TRAVAIL":
        return "Visite Médicale"
      default:
        return "Visite Médicale"
    }
  }

  const getMedicalVisitHref = () => {
    switch (userRole) {
      case "SALARIE":
        return "/demande-visite-medicale"
      case "INFIRMIER_ST":
        return "/demande-visite-medicale-infirmier"
      case "MEDECIN_TRAVAIL":
        return "/demande-visite-medicale-medecin"
      case "RESP_RH":
        return "/rh/visites"
      default:
        return "/demande-visite-medicale"
    }
  }

  const getDashboardHref = () => {
    switch (userRole) {
      case "SALARIE":
        return "/dashboard-salarie"
      case "INFIRMIER_ST":
        return "/dashboard-infirmier"
      case "MEDECIN_TRAVAIL":
        return "/dashboard-medecin"
      case "RESP_HSE":
        return "/dashboard-hse"
      case "RESP_RH":
        return "/dashboard-rh"
      case "ADMIN":
        return "/dashboard-admin"
      default:
        return "/dashboard"
    }
  }

  // Base navigation items for all roles
  const baseNavigationItems = [
    {
      icon: Home,
      label: t("Tableau de bord"),
      href: getDashboardHref(),
      current: currentPage === "dashboard"
    },
  ]

  // RH-specific navigation items
  const rhNavigationItems = [
    {
      icon: Home,
      label: t("Tableau de bord"),
      href: getDashboardHref(),
      current: currentPage === "dashboard"
    },
    {
      icon: Users,
      label: t("Gestion des salariés"),
      href: "/rh/employees",
      current: currentPage === "rh-employees"
    },
    {
      icon: Calendar,
      label: t("Visites médicales"),
      href: "/rh/visites",
      current: currentPage === "rh-visites"
    },
  ]

  // Regular navigation items for other roles
  const regularNavigationItems = [
    {
      icon: Home,
      label: t("Tableau de bord"),
      href: getDashboardHref(),
      current: currentPage === "dashboard"
    },
    {
      icon: Stethoscope,
      label: t(getNavigationLabel()),
      href: getMedicalVisitHref(),
      current: currentPage === "demande-visite-medicale" || 
               currentPage === "demande-visite-medicale-infirmier" || 
               currentPage === "demande-visite-medicale-medecin"
    },
  ]

  // Choose navigation items based on role
  const navigationItems = userRole === "RESP_RH" ? rhNavigationItems : regularNavigationItems

  return (
    <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-300/50 dark:border-slate-600/50 shadow-lg dark:shadow-slate-900/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo, Company Name, and Navigation */}
          <div className="flex items-center gap-10">
            {/* Logo and Company Name - Far Left */}
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-md border border-slate-200/50 dark:border-slate-700/50">
                <CompanyLogo />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                OHSE CAPITAL
              </span>
            </div>
            
            {/* Navigation Links - Well Placed */}
            <nav className="hidden md:flex items-center gap-3">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={item.current ? "default" : "ghost"}
                      size="sm"
                      className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                        item.current 
                          ? "text-white transform scale-105"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50"
                      }`}
                      style={{
                        background: item.current 
                          ? `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`
                          : undefined,
                        boxShadow: item.current 
                          ? `0 10px 25px -3px ${getThemeColor(500)}40, 0 4px 6px -2px ${getThemeColor(500)}20`
                          : undefined
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right side - User controls */}
          <div className="flex items-center gap-4">
            {/* Language Toggle - Admin Style */}
            <div 
              className="rounded-lg shadow-lg"
              style={{
                boxShadow: `0 10px 25px -3px ${getThemeColor(500)}20, 0 4px 6px -2px ${getThemeColor(500)}10`
              }}
            >
              <Button
                onClick={() => setLanguage(language === "en" ? "fr" : "en")}
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-sm font-semibold rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100/90 dark:hover:bg-slate-700/90 border border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 flex items-center gap-2 text-slate-700 dark:text-slate-300"
              >
                <Globe className="h-4 w-4 transition-transform duration-300 hover:rotate-180" />
                <span className="font-bold">{language === "en" ? "FR" : "EN"}</span>
              </Button>
            </div>

            {/* Theme Selector - Admin Style */}
            <div 
              className="rounded-lg shadow-lg"
              style={{
                boxShadow: `0 10px 25px -3px ${getThemeColor(500)}20, 0 4px 6px -2px ${getThemeColor(500)}10`
              }}
            >
              <ThemeSelector />
            </div>
            
            {/* Enhanced Notification Bell */}
            <div 
              className="p-1 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-lg border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm"
              style={{
                boxShadow: `0 10px 25px -3px ${getThemeColor(500)}20, 0 4px 6px -2px ${getThemeColor(500)}10`
              }}
            >
              <NotificationBell 
                userId={user?.email ?? ''} 
                userRole={user?.roles?.[0]}
                gradient={getNotificationGradient()}
                menuGradient={getNotificationGradient()}
              />
            </div>
            
            {/* Enhanced User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-3 h-12 px-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/90 dark:hover:bg-slate-800/90 transition-all duration-300 shadow-md hover:shadow-lg rounded-xl"
                >
                  <div 
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`,
                      boxShadow: `0 4px 6px -2px ${getThemeColor(500)}40`
                    }}
                  >
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {user?.username}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-slate-200/60 dark:border-slate-700/60 shadow-2xl rounded-2xl p-2">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-foreground dark:text-white p-4 rounded-xl transition-all duration-200">
                    <User className="h-5 w-5" /> 
                    <span className="font-semibold">{t("Mon profil")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200/60 dark:bg-slate-700/60 my-2" />
                <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400 flex items-center gap-3 cursor-pointer hover:bg-red-50/80 dark:hover:bg-red-900/20 p-4 rounded-xl transition-all duration-200">
                  <LogOut className="h-5 w-5" /> 
                  <span className="font-semibold">{t("Déconnexion")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        <div className="md:hidden mt-4 pt-4 border-t border-slate-300/50 dark:border-slate-600/50">
          <div className="flex items-center gap-3 overflow-x-auto pb-3">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={item.current ? "default" : "outline"}
                    size="sm"
                    className={`flex items-center gap-3 whitespace-nowrap px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${
                      item.current 
                        ? "text-white transform scale-105"
                        : "border-2 border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
                    }`}
                    style={{
                      background: item.current 
                        ? `linear-gradient(135deg, ${getThemeColor(500)}, ${getThemeColor(700)})`
                        : undefined,
                      boxShadow: item.current 
                        ? `0 10px 25px -3px ${getThemeColor(500)}40, 0 4px 6px -2px ${getThemeColor(500)}20`
                        : undefined
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            {/* Mobile Language Toggle */}
            <Button
              onClick={() => setLanguage(language === "en" ? "fr" : "en")}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 whitespace-nowrap px-4 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300 border-2 border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            >
              <Globe className="h-4 w-4" />
              <span className="font-bold">{language === "en" ? "FR" : "EN"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardNavigation(props: DashboardNavigationProps) {
  return (
    <LanguageProvider>
      <DashboardNavigationContent {...props} />
    </LanguageProvider>
  )
} 