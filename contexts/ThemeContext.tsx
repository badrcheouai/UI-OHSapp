"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type ThemeColor, getThemeColors } from "@/lib/theme-config"

interface ThemeContextType {
  currentTheme: ThemeColor
  setTheme: (theme: ThemeColor) => void
  isDark: boolean
  toggleDarkMode: () => void
  themeColors: ReturnType<typeof getThemeColors>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>("red")
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("app-theme") as ThemeColor
    const savedDarkMode = localStorage.getItem("app-dark-mode") === "true"

    if (savedTheme && ["red", "blue", "green", "purple", "orange", "teal"].includes(savedTheme)) {
      setCurrentTheme(savedTheme)
    }
    setIsDark(savedDarkMode)
  }, [])

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement
    const colors = getThemeColors(currentTheme)

    // Set CSS custom properties
    Object.entries(colors.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--primary-${key}`, value)
    })

    Object.entries(colors.colors.accent).forEach(([key, value]) => {
      root.style.setProperty(`--accent-${key}`, value)
    })

    // Set background color based on theme in HSL format
    if (currentTheme === "red") {
      root.style.setProperty("--background", "0 0% 100%") // White background in HSL
    } else if (currentTheme === "blue") {
      root.style.setProperty("--background", "0 0% 100%") // White background in HSL
    } else if (currentTheme === "green") {
      root.style.setProperty("--background", "0 0% 100%") // White background in HSL
    } else if (currentTheme === "purple") {
      root.style.setProperty("--background", "0 0% 100%") // White background in HSL
    } else if (currentTheme === "orange") {
      root.style.setProperty("--background", "0 0% 100%") // White background in HSL
    } else if (currentTheme === "teal") {
      root.style.setProperty("--background", "0 0% 100%") // White background in HSL
    }

    // Apply dark mode class
    if (isDark) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }

    // Save to localStorage
    localStorage.setItem("app-theme", currentTheme)
    localStorage.setItem("app-dark-mode", isDark.toString())
  }, [currentTheme, isDark])

  const setTheme = (theme: ThemeColor) => {
    setCurrentTheme(theme)
  }

  const toggleDarkMode = () => {
    setIsDark(!isDark)
  }

  const themeColors = getThemeColors(currentTheme)

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        isDark,
        toggleDarkMode,
        themeColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
