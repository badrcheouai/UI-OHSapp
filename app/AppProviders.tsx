"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { PageTransitionProvider } from "@/components/page-transition-provider"
import { AuthProvider } from "@/contexts/AuthContext"

export default function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
            >
                <PageTransitionProvider>{children}</PageTransitionProvider>
            </ThemeProvider>
        </AuthProvider>
    )
}
