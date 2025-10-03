"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CompanyLogo } from "@/components/company-logo"
import { ThemeSelector } from "@/components/theme-selector"
import { User, LogOut, Settings, Bell, Menu, X } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
  const { user, logout } = useAuth()
  const { themeColors } = useTheme()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!user) return null

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="sticky top-0 z-50 w-full glass-effect border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div
                className="p-2 rounded-xl shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
                }}
              >
                <CompanyLogo size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground dark:text-white">OHSE CAPITAL</h1>
                <p className="text-xs text-muted-foreground dark:text-white/80">{themeColors.name}</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Selector */}
            <ThemeSelector />

            {/* Notifications */}
            <Button variant="outline" size="sm" className="relative h-10 w-10 p-0 theme-button-outline bg-transparent">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 h-10 px-3 theme-button-outline bg-transparent"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[500]}, ${themeColors.colors.primary[700]})`,
                    }}
                  >
                    {user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}
                  </div>
                  <span className="text-sm font-medium text-foreground dark:text-white">{user.firstName || user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-xl rounded-xl"
              >
                <DropdownMenuLabel className="text-foreground dark:text-white px-3 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground dark:text-white">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/settings")}
                  className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground dark:text-white"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-10 w-10 p-0 theme-button-outline"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-slide-down">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground dark:text-white">Theme</span>
                <ThemeSelector />
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/profile")}
                className="justify-start theme-button-secondary"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/settings")}
                className="justify-start theme-button-secondary"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="justify-start text-destructive hover:bg-destructive/10 bg-transparent"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
