import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProviders } from "./AppProviders"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OHSE Capital - Occupational Health & Safety Excellence",
  description: "Plateforme intégrée de gestion de la santé et sécurité au travail pour les entreprises modernes",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning className={inter.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
