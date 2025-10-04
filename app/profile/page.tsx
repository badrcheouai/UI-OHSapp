"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Mail, UserCheck, Shield, Lock, Eye, EyeOff, Sparkles, Globe, Calendar, MapPin, Building, Briefcase, Hash, AlertCircle, Phone, MessageCircle, Info, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { ThemeSelector } from "@/components/theme-selector"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ProfilePage() {
  const { user, accessToken } = useAuth()
  const { themeColors } = useTheme()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [language, setLanguage] = useState<"en" | "fr">("fr")
  const [profileData, setProfileData] = useState<any>(null)
  const [userAuthData, setUserAuthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const text = {
    fr: {
      dashboard: "Tableau de bord",
      logout: "Sortir",
      profile: "Mon profil",
      profileSubtitle: "Vos informations personnelles",
      username: "NOM D'UTILISATEUR",
      email: "Email",
      firstName: "Prénom",
      lastName: "Nom",
      roles: "Rôles",
      confirmed: "Confirmé",
      noRoles: "Aucun rôle assigné",
      changePassword: "Changer le mot de passe",
      passwordSubtitle: "Sécurisez votre compte avec un nouveau mot de passe",
      currentPassword: "Mot de passe actuel",
      newPassword: "Nouveau mot de passe",
      currentPasswordPlaceholder: "Entrez votre mot de passe actuel",
      newPasswordPlaceholder: "Entrez votre nouveau mot de passe",
      updatePassword: "Mettre à jour le mot de passe",
      // Profile fields
      dossierNumber: "N° Dossier",
      cin: "CIN",
      gender: "Sexe",
      birthDate: "Date de naissance",
      address: "Adresse",
      company: "Entreprise",
      hireDate: "Date d'embauche",
      profession: "Profession",
      personalInfo: "Informations Générales",
      personalInfoSubtitle: "Vos informations personnelles",
      notProvided: "Non renseigné",
      matriculeNumber: "N° Matricule",
      // Support message
      supportTitle: "Information incorrecte ?",
      supportMessage: "Si vous constatez une erreur dans vos informations, veuillez contacter le support technique.",
      contactSupport: "Contacter le support",
      supportPhone: "+33 1 23 45 67 89",
      supportEmail: "support@ohse.com",
      // Password section
      passwordReadOnly: "Champ en lecture seule"
    },
    en: {
      dashboard: "Dashboard",
      logout: "Logout",
      profile: "My Profile",
      profileSubtitle: "Your personal information",
      username: "USERNAME",
      email: "Email",
      firstName: "First Name",
      lastName: "Last Name",
      roles: "Roles",
      confirmed: "Confirmed",
      noRoles: "No roles assigned",
      changePassword: "Change Password",
      passwordSubtitle: "Secure your account with a new password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      currentPasswordPlaceholder: "Enter your current password",
      newPasswordPlaceholder: "Enter your new password",
      updatePassword: "Update Password",
      // Profile fields
      dossierNumber: "Dossier Number",
      cin: "CIN",
      gender: "Gender",
      birthDate: "Birth Date",
      address: "Address",
      company: "Company",
      hireDate: "Hire Date",
      profession: "Profession",
      personalInfo: "General Information",
      personalInfoSubtitle: "Your personal information",
      notProvided: "Not provided",
      matriculeNumber: "Matricule Number",
      // Support message
      supportTitle: "Incorrect information?",
      supportMessage: "If you notice an error in your information, please contact technical support.",
      contactSupport: "Contact Support",
      supportPhone: "+33 1 23 45 67 89",
      supportEmail: "support@ohse.com",
      // Password section
      passwordReadOnly: "Read-only field"
    }
  }

  const t = text[language]

  // Function to translate gender values
  const translateGender = (gender: string, lang: "fr" | "en") => {
    if (!gender) return lang === 'fr' ? t.notProvided : 'Not specified';
    const map: Record<string, { fr: string; en: string }> = {
      MALE: { fr: 'Homme', en: 'Male' },
      FEMALE: { fr: 'Femme', en: 'Female' },
      OTHER: { fr: 'Autre', en: 'Other' },
      Homme: { fr: 'Homme', en: 'Male' },
      Femme: { fr: 'Femme', en: 'Female' },
      Autre: { fr: 'Autre', en: 'Other' },
      Male: { fr: 'Homme', en: 'Male' },
      Female: { fr: 'Femme', en: 'Female' },
      Other: { fr: 'Autre', en: 'Other' },
    };
    if (Object.prototype.hasOwnProperty.call(map, gender)) {
      return map[gender][lang];
    }
    return gender;
  };

  // Function to fetch user profile data
  const fetchProfileData = async () => {
    try {
      if (!accessToken || !user?.sub) {
        setLoading(false)
        return
      }

      // Fetch profile data from the correct endpoint that includes detailed profile information
      const profileResponse = await fetch(`/api/v1/admin/keycloak/users/${user.sub}/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (profileResponse.ok) {
        const result = await profileResponse.json()
        
        if (result.success && result.profile) {
          setProfileData(result.profile)
          setUserAuthData(result.profile) // Also set auth data for admins
        } else {
          console.log("No profile data received")
          setProfileData({})
        }
      } else {
        console.log("Profile response not ok:", profileResponse.status)
        setProfileData({})
      }

      // Auth data is now fetched above for all users, no need for separate admin check
    } catch (error) {
      console.error("Error fetching profile data:", error)
      setProfileData({})
    } finally {
      setLoading(false)
    }
  }

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData()
  }, [accessToken, user?.sub])

  // Handle password change
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordMessage({ type: 'error', text: 'Veuillez remplir tous les champs' })
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 6 caractères' })
      return
    }

    try {
      setPasswordLoading(true)
      setPasswordMessage(null)

      const response = await fetch('/api/v1/account/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      if (response.ok) {
        setPasswordMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès' })
        setCurrentPassword("")
        setNewPassword("")
      } else {
        const errorText = await response.text()
        setPasswordMessage({ type: 'error', text: errorText || 'Erreur lors du changement de mot de passe' })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setPasswordMessage({ type: 'error', text: 'Erreur de connexion' })
    } finally {
      setPasswordLoading(false)
    }
  }

  // Function to get the correct dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user?.roles) return "/dashboard"
    
    const roles = user.roles
    if (roles.includes("ADMIN")) return "/dashboard"
    if (roles.includes("RESP_RH")) return "/dashboard-rh"
    if (roles.includes("INFIRMIER_ST")) return "/dashboard-infirmier"
    if (roles.includes("MEDECIN_TRAVAIL")) return "/dashboard-medecin"
    if (roles.includes("RESP_HSE")) return "/dashboard-hse"
    if (roles.includes("SALARIE")) return "/dashboard-salarie"
    
    return "/dashboard" // fallback
  }

  // Function to get role colors with prominent ADMIN styling
  const getRoleColors = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return {
          bg: 'bg-red-500 dark:bg-red-600',
          text: 'text-white dark:text-white font-bold',
          border: 'border-red-600 dark:border-red-700',
          size: 'text-sm px-3 py-1'
        }
      case 'SALARIE':
        return {
          bg: 'bg-teal-100 dark:bg-teal-900/20',
          text: 'text-teal-800 dark:text-teal-400',
          border: 'border-teal-200 dark:border-teal-800/30',
          size: 'text-xs'
        }
      case 'INFIRMIER_ST':
        return {
            bg: 'bg-emerald-100 dark:bg-emerald-900/20',
  text: 'text-emerald-800 dark:text-emerald-400',
  border: 'border-emerald-200 dark:border-emerald-800/30',
          size: 'text-xs'
        }
      case 'MEDECIN_TRAVAIL':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          text: 'text-blue-800 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-800/30',
          size: 'text-xs'
        }
      case 'RESP_HSE':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/20',
          text: 'text-orange-800 dark:text-orange-400',
          border: 'border-orange-200 dark:border-orange-800/30',
          size: 'text-xs'
        }
      case 'RH':
        return {
          bg: 'bg-purple-100 dark:bg-purple-900/20',
          text: 'text-purple-800 dark:text-purple-400',
          border: 'border-purple-200 dark:border-purple-800/30',
          size: 'text-xs'
        }
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-700',
          text: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-200 dark:border-slate-600/30',
          size: 'text-xs'
        }
    }
  }

  // Admin access restriction - show only decoration
  if (user?.roles?.includes("ADMIN")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
        {/* Professional Background Bubbles Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div
            className="absolute top-24 right-20 w-28 h-28 rounded-full animate-ping"
            style={{
              background: `linear-gradient(135deg, ${themeColors.colors.primary[300]}, ${themeColors.colors.primary[500]})`,
              opacity: 0.06,
              animationDelay: "0s",
              animationDuration: "15s",
            }}
          ></div>
          <div
            className="absolute top-48 right-12 w-20 h-20 rounded-full animate-ping"
            style={{
              background: `linear-gradient(135deg, ${themeColors.colors.primary[200]}, ${themeColors.colors.primary[400]})`,
              opacity: 0.04,
              animationDelay: "5s",
              animationDuration: "18s",
            }}
          ></div>
          <div
            className="absolute top-72 right-28 w-16 h-16 rounded-full animate-ping"
            style={{
              background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[600]})`,
              opacity: 0.03,
              animationDelay: "2s",
              animationDuration: "20s",
            }}
          ></div>
        </div>

        <div className="flex items-center justify-center min-h-screen relative z-10">
          <Card className="w-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl animate-scale-in">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Accès Administrateur
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Cette page est réservée aux utilisateurs non-administrateurs.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/dashboard-admin">
                <Button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Retour au Tableau de Bord
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
      {/* Professional Background Bubbles Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* RIGHT SIDE BUBBLES - PROFESSIONAL ANIMATIONS */}
        <div
          className="absolute top-24 right-20 w-28 h-28 rounded-full animate-ping"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[300]}, ${themeColors.colors.primary[500]})`,
            opacity: 0.06,
            animationDelay: "0s",
            animationDuration: "15s",
          }}
        ></div>
        <div
          className="absolute top-48 right-12 w-20 h-20 rounded-full animate-ping"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[200]}, ${themeColors.colors.primary[400]})`,
            opacity: 0.04,
            animationDelay: "5s",
            animationDuration: "18s",
          }}
        ></div>
        <div
          className="absolute top-72 right-28 w-16 h-16 rounded-full animate-ping"
          style={{
            background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[600]})`,
            opacity: 0.03,
            animationDelay: "2s",
            animationDuration: "20s",
          }}
        ></div>

        {/* FLOATING PARTICLES - PROFESSIONAL ANIMATIONS */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-ping"
            style={{
              right: `${20 + i * 15}%`,
              top: `${15 + i * 12}%`,
              background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[600]})`,
              opacity: 0.15,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${8 + i * 0.5}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Header */}
      <div className="border-b border-border/30 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 shadow-lg relative z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={getDashboardUrl()}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 bg-green-100 dark:bg-slate-800/80 text-green-700 dark:text-white hover:bg-green-200 dark:hover:bg-slate-700/80 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t.dashboard}
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setLoading(true)
                  fetchProfileData()
                }}
                className="h-7 px-3 text-xs bg-green-100 dark:bg-slate-800/80 text-green-700 dark:text-white hover:bg-green-200 dark:hover:bg-slate-700/80 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              <button
                onClick={() => setLanguage(language === "en" ? "fr" : "en")}
                className="h-7 px-3 text-xs bg-blue-100 dark:bg-slate-800/80 text-blue-700 dark:text-white hover:bg-blue-200 dark:hover:bg-slate-700/80 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Globe className="h-3 w-3" />
                {language === "en" ? "FR" : "EN"}
              </button>
              <ThemeSelector />
              <Link href="/auth/logout">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-3 text-xs bg-red-100 dark:bg-slate-800/80 text-red-700 dark:text-white border-red-300 dark:border-slate-600 hover:bg-red-200 dark:hover:bg-slate-700/80 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg"
                >
                  {t.logout}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-6 relative z-10">
        <div className="grid gap-6">
          {/* Support Alert */}
          <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <div className="flex flex-col gap-2">
                <div className="font-semibold">{t.supportTitle}</div>
                <div className="text-sm">{t.supportMessage}</div>
                <div className="flex flex-wrap gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{t.supportPhone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{t.supportEmail}</span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Profile Card */}
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 rounded-2xl overflow-hidden">
            <CardHeader
              className="text-center pb-6 rounded-t-2xl"
              style={{
                background: `linear-gradient(135deg, ${themeColors.colors.primary[500]} 0%, ${themeColors.colors.primary[600]} 25%, ${themeColors.colors.primary[700]} 50%, ${themeColors.colors.primary[800]} 75%, ${themeColors.colors.primary[900]} 100%)`,
                color: "white",
              }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 border-4 border-white/30 shadow-xl rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[700]}, ${themeColors.colors.primary[900]})`,
                    }}
                  >
                    <UserCheck className="h-8 w-8" style={{ color: "white" }} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white flex items-center justify-center shadow-md">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold mb-1">{t.profile}</CardTitle>
                  <p className="text-white/80 text-xs">{t.profileSubtitle}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* User Info */}
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <User className="h-4 w-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.username}</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{user?.username || t.notProvided}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <Mail className="h-4 w-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.email}</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{user?.email || t.notProvided}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 text-xs">
                    {t.confirmed}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <UserCheck className="h-4 w-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.firstName}</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{user?.firstName || t.notProvided}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <Shield className="h-4 w-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.lastName}</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{user?.lastName || t.notProvided}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <Shield className="h-4 w-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.roles}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user?.roles?.map((role: string) => {
                        const { bg, text, border, size } = getRoleColors(role)
                        return (
                          <Badge key={role} className={`${bg} ${text} ${border} ${size}`}>
                            {role}
                          </Badge>
                        )
                      }) || <span className="text-slate-500 dark:text-slate-400 text-xs">{t.noRoles}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Card */}
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-6">
              <div className="flex flex-col items-center gap-4">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                    border: `2px solid ${themeColors.colors.primary[700]}`
                  }}
                >
                  <User className="h-6 w-6" style={{ color: "white" }} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-100">{t.personalInfo}</CardTitle>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">{t.personalInfoSubtitle}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <Hash className="h-4 w-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.dossierNumber}</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{profileData?.dossierNumber || t.notProvided}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <Hash className="h-4 w-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.matriculeNumber}</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{profileData?.matriculeNumber || t.notProvided}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <Hash className="h-4 w-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.cin}</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{profileData?.cin || t.notProvided}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <UserCheck className="h-4 w-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.gender}</p>
                    <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {profileData?.gender ? (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs">
                          {translateGender(profileData.gender, language)}
                        </Badge>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400">{t.notProvided}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <Calendar className="h-4 w-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.birthDate}</p>
                    <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {profileData?.birthDate ? (
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800 text-xs">
                          {new Date(profileData.birthDate).toLocaleDateString('fr-FR')}
                        </Badge>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400">{t.notProvided}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <MapPin className="h-4 w-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.address}</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{profileData?.address || t.notProvided}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <Building className="h-4 w-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.company}</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{profileData?.company || t.notProvided}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <Calendar className="h-4 w-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.hireDate}</p>
                    <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {profileData?.hireDate ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800 text-xs">
                          {new Date(profileData.hireDate).toLocaleDateString('fr-FR')}
                        </Badge>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400">{t.notProvided}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <Briefcase className="h-4 w-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.profession}</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{profileData?.profession || t.notProvided}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <Phone className="h-4 w-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Téléphone</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{profileData?.phoneNumber || t.notProvided}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <Building className="h-4 w-4" style={{ color: "white" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Département</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{profileData?.department || t.notProvided}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authentication Information Card - Only for Admins */}
          {user?.roles?.includes("ADMIN") && (
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 rounded-2xl overflow-hidden">
              <CardHeader className="text-center pb-6">
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                      border: `2px solid ${themeColors.colors.primary[700]}`
                    }}
                  >
                    <Shield className="h-6 w-6" style={{ color: "white" }} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-100">Informations d'Authentification</CardTitle>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">Détails de sécurité et connexion (Admin uniquement)</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                      style={{ 
                        background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                        border: `2px solid ${themeColors.colors.primary[700]}`
                      }}
                    >
                      <Mail className="h-4 w-4" style={{ color: "white" }} />
                    </div>
                                         <div className="flex-1">
                       <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email vérifié</p>
                       <div className="mt-1">
                         <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800 text-xs">
                           Vérifié
                         </Badge>
                       </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                      style={{ 
                        background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                        border: `2px solid ${themeColors.colors.primary[700]}`
                      }}
                    >
                      <Calendar className="h-4 w-4" style={{ color: "white" }} />
                    </div>
                                         <div className="flex-1">
                       <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dernière connexion</p>
                       <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                         {(() => {
                           // Check if we have lastLogin data (this should be an ISO string from the admin users page)
                           const lastLogin = userAuthData?.lastLogin;
                           
                           console.log("Last login value:", lastLogin);
                           console.log("User auth data:", userAuthData);
                           
                           if (lastLogin) {
                             try {
                               return new Date(lastLogin).toLocaleString('fr-FR');
                             } catch (error) {
                               console.error("Error parsing date:", error);
                               return "Format de date invalide";
                             }
                           } else {
                             return "Jamais connecté";
                           }
                         })()}
                       </p>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                      style={{ 
                        background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                        border: `2px solid ${themeColors.colors.primary[700]}`
                      }}
                    >
                      <Calendar className="h-4 w-4" style={{ color: "white" }} />
                    </div>
                                         <div className="flex-1">
                       <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date de création</p>
                       <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                         {userAuthData?.createdTimestamp ? 
                           new Date(userAuthData.createdTimestamp).toLocaleDateString('fr-FR') : 
                           "Non disponible"
                         }
                       </p>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
                      style={{ 
                        background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                        border: `2px solid ${themeColors.colors.primary[700]}`
                      }}
                    >
                      <Hash className="h-4 w-4" style={{ color: "white" }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID Keycloak</p>
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 font-mono text-xs">
                        {user?.sub || "Non disponible"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Password Change Card */}
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-6">
              <div className="flex flex-col items-center gap-4">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${themeColors.colors.primary[600]}, ${themeColors.colors.primary[800]})`,
                    border: `2px solid ${themeColors.colors.primary[700]}`
                  }}
                >
                  <Lock className="h-6 w-6" style={{ color: "white" }} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-100">{t.changePassword}</CardTitle>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">{t.passwordSubtitle}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Password Message */}
              {passwordMessage && (
                <Alert className={`${
                  passwordMessage.type === 'success' 
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                }`}>
                  <AlertCircle className={`h-4 w-4 ${
                    passwordMessage.type === 'success' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`} />
                  <AlertDescription className={`text-sm ${
                    passwordMessage.type === 'success' 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {passwordMessage.text}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{t.currentPassword}</p>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-10 px-3 rounded-lg border-slate-200/50 dark:border-slate-600/50 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-sm text-sm w-full"
                      placeholder={t.currentPasswordPlaceholder}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-all duration-300 rounded-lg"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{t.newPassword}</p>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-10 px-3 rounded-lg border-slate-200/50 dark:border-slate-600/50 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-sm text-sm w-full"
                      placeholder={t.newPasswordPlaceholder}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-all duration-300 rounded-lg"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handlePasswordChange}
                  disabled={passwordLoading || !currentPassword || !newPassword}
                  className="h-10 w-full rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.colors.primary[500]} 0%, ${themeColors.colors.primary[600]} 25%, ${themeColors.colors.primary[700]} 50%, ${themeColors.colors.primary[800]} 75%, ${themeColors.colors.primary[900]} 100%)`,
                    color: "white"
                  }}
                >
                  <div className="flex items-center gap-2">
                    {passwordLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {passwordLoading ? "Mise à jour..." : t.updatePassword}
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
