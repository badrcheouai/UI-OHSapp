import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import {PageTransitionProvider} from "@/components/page-transition-provider";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "OHS APP - Occupational Health & Safety Platform",
    description: "Comprehensive workplace safety and employee wellbeing management platform",
    generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head />
        <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <PageTransitionProvider>{children}</PageTransitionProvider>
        </ThemeProvider>
        </body>
        </html>
    )
}
