"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeSelector } from "@/components/theme-selector"
import { CompanyLogo } from "@/components/company-logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  LogOut,
  User,
  Crown,
  Bell,
  Menu,
  X,
  Globe,
  Activity,
  FileText,
  BarChart3,
  Shield,
} from "lucide-react"

interface AdminNavigationProps {
  language: "en" | "fr"
  setLanguage: (lang: "en" | "fr") => void
}

export function AdminNavigation({ language, setLanguage }: AdminNavigationProps) {
  const { user, logout } = useAuth()
  const { themeColors } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const text = {
    fr: {
      dashboard: "Tableau de Bord",
      users: "Utilisateurs",
      logs: "Logs",
      profile: "Profil",
      logout: "Déconnexion",
      notifications: "Notifications",
      admin: "Administrateur",
      welcome: "Bienvenue",
    },
    en: {
      dashboard: "Dashboard",
      users: "Users",
      logs: "Logs",
      profile: "Profile",
      logout: "Logout",
      notifications: "Notifications",
      admin: "Administrator",
      welcome: "Welcome",
    },
  }

  const t = text[language]

  const navigationItems = [
    { name: t.dashboard, href: "/dashboard-admin", icon: Activity },
    { name: t.users, href: "/dashboard-admin/users", icon: Users },
    { name: t.logs, href: "/dashboard-admin/logs", icon: FileText },
  ]

  const handleLogout = async () => {
    // Use the AuthContext logout function which now includes the animation
    logout()
  }

  return (
    <>
      
      <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-2xl sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 group">
                <div className="relative">
                  <CompanyLogo size={40} className="group-hover:scale-110 transition-all duration-500 shadow-lg" />
                  <div
                    className="absolute -inset-3 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                    }}
                  ></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">OSHapp</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
                    <div className="h-6 w-6 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-md">
                      <Crown className="h-3 w-3 text-white" />
                    </div>
                    {t.admin}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {/* Navigation Links */}
              <div className="flex items-center gap-2">
                {navigationItems.map((item, index) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-3 px-6 py-3 text-base font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-slate-100/80 hover:to-blue-50/80 dark:hover:from-slate-800/80 dark:hover:to-slate-700/80 transition-all duration-500 rounded-xl relative group overflow-hidden shadow-md hover:shadow-lg transform hover:scale-105"
                    onClick={() => router.push(item.href)}
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      background: pathname === item.href ? `linear-gradient(135deg, ${themeColors.colors.primary[100]}, ${themeColors.colors.primary[200]})` : 'transparent',
                      color: pathname === item.href ? themeColors.colors.primary[700] : undefined
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"></div>
                    <item.icon className="h-5 w-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
                    <span className="relative z-10">{item.name}</span>
                  </Button>
                ))}
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-3">
                {/* Language Toggle */}
                <Button
                  onClick={() => setLanguage(language === "en" ? "fr" : "en")}
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 text-sm font-semibold rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100/90 dark:hover:bg-slate-700/90 border border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md text-slate-700 dark:text-slate-300"
                >
                  <Globe className="h-4 w-4 transition-transform duration-300 hover:rotate-180" />
                  <span className="font-bold">{language === "en" ? "FR" : "EN"}</span>
                </Button>

                {/* Notifications - Hidden for admin users */}
                {!user?.roles?.includes("ADMIN") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-9 w-9 p-0 rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100/90 dark:hover:bg-slate-700/90 border border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <Bell className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                    <span 
                      className="absolute -top-1 -right-1 h-3 w-3 rounded-full animate-pulse"
                      style={{ backgroundColor: themeColors.colors.primary[500] }}
                    ></span>
                  </Button>
                )}

                {/* Theme Selector */}
                <ThemeSelector />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-12 w-12 p-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[700]})`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${themeColors.colors.primary[700]}, ${themeColors.colors.primary[800]})`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[700]})`
                      }}
                    >
                      <User className="h-5 w-5 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl rounded-xl"
                  >
                    <DropdownMenuLabel className="text-slate-900 dark:text-white">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.firstName || user?.username}</p>
                        <p className="text-xs leading-none text-slate-500 dark:text-slate-400">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t.logout}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-9 w-9 p-0 rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100/90 dark:hover:bg-slate-700/90 border border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                ) : (
                  <Menu className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200/60 dark:border-slate-700/60 animate-slide-down">
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="w-full justify-start flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-300 rounded-lg"
                    onClick={() => {
                      router.push(item.href)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                ))}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={() => setLanguage(language === "en" ? "fr" : "en")}
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-9 text-sm font-semibold rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100/90 dark:hover:bg-slate-700/90 border border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md text-slate-700 dark:text-slate-300"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="font-bold">{language === "en" ? "FR" : "EN"}</span>
                  </Button>
                  <ThemeSelector />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
} 