"use client"

import type React from "react"

import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { Toaster } from "@/components/ui/toaster"
import { PageTransition } from "@/components/page-transition"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PageTransition>
          {children}
        </PageTransition>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}
