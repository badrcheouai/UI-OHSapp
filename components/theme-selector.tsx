"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Palette, Check, Moon, Sun, Sparkles } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import { type ThemeColor, themes } from "@/lib/theme-config"
import { cn } from "@/lib/utils"

export function ThemeSelector() {
  const { currentTheme, setTheme, isDark, toggleDarkMode } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredTheme, setHoveredTheme] = useState<ThemeColor | null>(null)

  const themeOptions: { value: ThemeColor; colors: string[] }[] = [
    { value: "red", colors: ["#dc2626", "#b91c1c", "#991b1b"] },
    { value: "blue", colors: ["#2563eb", "#1d4ed8", "#1e40af"] },
    { value: "green", colors: ["#16a34a", "#15803d", "#166534"] },
    { value: "purple", colors: ["#9333ea", "#7c3aed", "#6b21a8"] },
    { value: "orange", colors: ["#ea580c", "#c2410c", "#9a3412"] },
    { value: "teal", colors: ["#0d9488", "#0f766e", "#115e59"] },
  ]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative h-10 w-10 p-0 border-2 hover:scale-105 transition-all duration-300 glass-effect bg-transparent group"
          style={{
            borderColor: themes[currentTheme].colors.primary[600],
            background: `conic-gradient(from 0deg, ${themes[currentTheme].colors.primary[500]}, ${themes[currentTheme].colors.primary[700]}, ${themes[currentTheme].colors.primary[500]})`,
            boxShadow: `0 4px 20px -4px ${themes[currentTheme].colors.primary[500]}40`,
          }}
        >
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Palette className="h-4 w-4 text-white drop-shadow-sm relative z-10 group-hover:animate-pulse" />
          <Sparkles className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-spin" />
          <span className="sr-only">Select theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl rounded-xl animate-scale-in"
      >
        {/* Theme Grid */}
        <div className="grid grid-cols-3 gap-2 p-1">
          {themeOptions.map((option, index) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              onMouseEnter={() => setHoveredTheme(option.value)}
              onMouseLeave={() => setHoveredTheme(null)}
              className={cn(
                "relative p-0 aspect-square rounded-lg cursor-pointer transition-all duration-500 hover:scale-110 group overflow-hidden",
                currentTheme === option.value ? "scale-110 ring-2 ring-white/80 shadow-lg" : "hover:shadow-md",
              )}
              style={{ 
                animationDelay: `${index * 0.08}s`,
                background: `conic-gradient(from ${index * 60}deg, ${option.colors[0]}, ${option.colors[1]}, ${option.colors[2]}, ${option.colors[0]})`,
              }}
            >
              {/* Hover overlay */}
              <div 
                className={cn(
                  "absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-all duration-300",
                  hoveredTheme === option.value ? "opacity-100" : ""
                )}
              />
              
              {/* Selection indicator */}
              {currentTheme === option.value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md animate-bounce">
                    <Check className="h-3 w-3 text-slate-800" />
                  </div>
                </div>
              )}
              
              {/* Sparkle effect on hover */}
              {hoveredTheme === option.value && (
                <div className="absolute inset-0">
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  <div className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </div>

        {/* Dark mode toggle - compact */}
        <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
          <DropdownMenuItem
            onClick={toggleDarkMode}
            className="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 group"
          >
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-100/80 dark:bg-slate-700/80 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                {isDark ? (
                  <Moon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300 transition-all duration-300 group-hover:animate-pulse" />
                ) : (
                  <Sun className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300 transition-all duration-300 group-hover:animate-spin" />
                )}
              </div>
            </div>
            
            {/* Compact toggle switch */}
            <div
              className={cn(
                "relative w-10 h-5 rounded-full transition-all duration-500 cursor-pointer shadow-sm group-hover:shadow-md overflow-hidden",
                isDark 
                  ? "bg-gradient-to-r from-slate-600 to-slate-700" 
                  : "bg-gradient-to-r from-slate-300 to-slate-400",
              )}
            >
              {/* Toggle background animation */}
              <div 
                className={cn(
                  "absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 transition-opacity duration-500",
                  isDark ? "opacity-0" : "opacity-100"
                )}
              />
              
              {/* Toggle handle */}
              <div
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-500 ease-out group-hover:scale-110",
                  isDark ? "translate-x-5" : "translate-x-0.5",
                )}
              />
              
              {/* Stars for dark mode */}
              {isDark && (
                <div className="absolute inset-0">
                  <div className="absolute top-0.5 left-1.5 w-0.5 h-0.5 bg-white rounded-full animate-pulse" />
                  <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
              )}
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
