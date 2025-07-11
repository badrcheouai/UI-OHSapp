"use client"

import React, { createContext, useContext, useState } from "react"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

const translations: {
  fr: { [key: string]: string },
  en: { [key: string]: string }
} = {
  fr: {
    "Bienvenue sur votre espace Salarié": "Bienvenue sur votre espace Salarié",
    "Bienvenue sur votre espace RH": "Bienvenue sur votre espace RH",
    "Bienvenue sur votre espace Infirmier(e) ST": "Bienvenue sur votre espace Infirmier(e) ST",
    "Bienvenue sur votre espace Médecin du Travail": "Bienvenue sur votre espace Médecin du Travail",
    "Bienvenue sur votre espace Responsable HSE": "Bienvenue sur votre espace Responsable HSE",
    "Vous êtes connecté en tant que": "Vous êtes connecté en tant que",
    "Accès à mon compte et documents": "Accès à mon compte et documents",
    "Demander un RDV médical": "Demander un RDV médical",
    "Consulter/annuler/reporter mes RDV médicaux": "Consulter/annuler/reporter mes RDV médicaux",
    "Gestion des salariés et certificats médicaux": "Gestion des salariés et certificats médicaux",
    "Gestion des comités et accidents de travail": "Gestion des comités et accidents de travail",
    "Tableau de bord RH personnalisé": "Tableau de bord RH personnalisé",
    "Planification des visites médicales et examens externes": "Planification des visites médicales et examens externes",
    "Gestion du dossier médical et stock pharmacie": "Gestion du dossier médical et stock pharmacie",
    "Rapports annuels et visites des lieux de travail": "Rapports annuels et visites des lieux de travail",
    "Planification des visites médicales et études de postes": "Planification des visites médicales et études de postes",
    "Validation du dossier médical et émission de fiches d’aptitude": "Validation du dossier médical et émission de fiches d’aptitude",
    "Rapports annuels, CHS et fiche d’entreprise": "Rapports annuels, CHS et fiche d’entreprise",
    "Suivi des indicateurs SST et incidents": "Suivi des indicateurs SST et incidents",
    "Gestion des enquêtes, rapports et exposition": "Gestion des enquêtes, rapports et exposition",
    "Analyse des risques et produits dangereux": "Analyse des risques et produits dangereux",
    "Nom d'utilisateur": "Nom d'utilisateur",
    "Rôle": "Rôle",
    "Département": "Département",
    "Service": "Service",
    "Spécialité": "Spécialité",
    "Zone": "Zone",
    "Mon profil": "Mon profil",
    "Changer le mot de passe": "Changer le mot de passe",
    "Nouveau mot de passe": "Nouveau mot de passe",
    "Confirmer le mot de passe": "Confirmer le mot de passe",
    "Les mots de passe ne correspondent pas.": "Les mots de passe ne correspondent pas.",
    "Mot de passe changé avec succès!": "Mot de passe changé avec succès!",
  },
  en: {
    "Bienvenue sur votre espace Salarié": "Welcome to your Employee space",
    "Bienvenue sur votre espace RH": "Welcome to your HR space",
    "Bienvenue sur votre espace Infirmier(e) ST": "Welcome to your Nurse space",
    "Bienvenue sur votre espace Médecin du Travail": "Welcome to your Occupational Doctor space",
    "Bienvenue sur votre espace Responsable HSE": "Welcome to your HSE Manager space",
    "Vous êtes connecté en tant que": "You are logged in as",
    "Accès à mon compte et documents": "Access my account and documents",
    "Demander un RDV médical": "Request a medical appointment",
    "Consulter/annuler/reporter mes RDV médicaux": "View/cancel/reschedule my medical appointments",
    "Gestion des salariés et certificats médicaux": "Manage employees and medical certificates",
    "Gestion des comités et accidents de travail": "Manage committees and work accidents",
    "Tableau de bord RH personnalisé": "Personalized HR dashboard",
    "Planification des visites médicales et examens externes": "Plan medical visits and external exams",
    "Gestion du dossier médical et stock pharmacie": "Manage medical records and pharmacy stock",
    "Rapports annuels et visites des lieux de travail": "Annual reports and workplace visits",
    "Planification des visites médicales et études de postes": "Plan medical visits and workstation studies",
    "Validation du dossier médical et émission de fiches d’aptitude": "Validate medical records and issue fitness certificates",
    "Rapports annuels, CHS et fiche d’entreprise": "Annual, CHS, and company reports",
    "Suivi des indicateurs SST et incidents": "Track HSE indicators and incidents",
    "Gestion des enquêtes, rapports et exposition": "Manage investigations, reports, and exposure",
    "Analyse des risques et produits dangereux": "Risk analysis and hazardous products",
    "Nom d'utilisateur": "Username",
    "Rôle": "Role",
    "Département": "Department",
    "Service": "Service",
    "Spécialité": "Specialty",
    "Zone": "Zone",
    "Mon profil": "My profile",
    "Changer le mot de passe": "Change password",
    "Nouveau mot de passe": "New password",
    "Confirmer le mot de passe": "Confirm password",
    "Les mots de passe ne correspondent pas.": "Passwords do not match.",
    "Mot de passe changé avec succès!": "Password changed successfully!",
  },
}

const LanguageContext = createContext({
  language: "fr",
  setLanguage: (lang: "fr" | "en") => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<"fr" | "en">("fr")
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const { language } = useContext(LanguageContext)
  function t(key: string) {
    return translations[language as keyof typeof translations][key] || key
  }
  return { t, language }
}

export function LanguageToggle() {
  const { language, setLanguage } = useContext(LanguageContext)
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "en" ? "fr" : "en")}
      className="h-8 px-2 text-sm font-medium"
    >
      <Globe className="h-4 w-4 mr-1" />
      {language === "en" ? "FR" : "EN"}
    </Button>
  )
}
