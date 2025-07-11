import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

// ─── Client-side providers ─────────────────────────
import { AuthProvider }              from "@/contexts/AuthContext"
import { ThemeProvider }             from "@/components/theme-provider"
import { PageTransitionProvider }    from "@/components/page-transition-provider"
import { LanguageProvider } from "@/components/language-toggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "OHS APP - Occupational Health & Safety Platform",
    description: "Comprehensive workplace safety and employee wellbeing management platform",
    generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-white dark:bg-slate-900`}>
        {/* ─── All app-wide providers in one place ─── */}
        <LanguageProvider>
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
        </LanguageProvider>
        </body>
        </html>
    )
}
