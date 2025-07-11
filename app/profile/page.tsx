"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from "@/components/language-toggle"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  LogOut,
  ArrowLeft,
  Globe,
  Sparkles,
  Mail,
  User,
  Badge,
  Crown,
  Lock,
  Eye,
  EyeOff,
  Heart,
  Star,
  Zap,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useJwt } from "@/hooks/use-jwt"
import { useRef } from "react"

export default function ProfilePage() {
  const { user, token, logout, loading } = useAuth()
  const jwtPayload = useJwt(token)
  const userId = user?.sub || jwtPayload?.sub
  const username = user?.username || jwtPayload?.preferred_username
  const { t } = useTranslation()
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "fr">("fr")
  const [currentPassword, setCurrentPassword] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [message, setMessage] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [showSpinner, setShowSpinner] = useState(false);
  const [tokenRetryCount, setTokenRetryCount] = useState(0);
  const [reloadAttempt, setReloadAttempt] = useState(0); // 0: first try, 1: after reload
  const spinnerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Robust spinner and reload logic
  useEffect(() => {
    if (!user && !loading) {
      setShowSpinner(true);
      let elapsed = 0;
      const interval = 200; // ms
      const maxWait = 3000; // 3 seconds
      const checkInterval = setInterval(() => {
        elapsed += interval;
        if (user || token) {
          setShowSpinner(false);
          clearInterval(checkInterval);
        } else if (elapsed >= maxWait) {
          clearInterval(checkInterval);
          if (reloadAttempt === 0) {
            setReloadAttempt(1);
            window.location.reload();
          } else {
            setShowSpinner(false);
            setMessage(t("Impossible de charger les informations utilisateur après plusieurs tentatives. Veuillez réessayer plus tard."));
          }
        }
      }, interval);
      return () => clearInterval(checkInterval);
    }
  }, [user, token, loading, reloadAttempt, t]);

  useEffect(() => {
    if (!loading && !user && token) {
      router.replace("/login")
    }
  }, [user, loading, router, token])

  if (showSpinner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mb-4"></div>
        <div className="text-lg">{t("Chargement du profil...")}</div>
      </div>
    )
  }
  // Only show full-page error for session expiration or backend/server errors
  if (message && (message.includes("session") || message.includes("Impossible de trouver l'identifiant utilisateur") || message.includes("Impossible de charger les informations utilisateur"))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-lg text-red-600 font-bold mb-2">{t("Erreur de session")}</div>
        <div className="mb-4">{message}</div>
        <button
          onClick={() => {
            logout();
            router.replace("/login");
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          {t("Se reconnecter")}
        </button>
      </div>
    );
  }

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = []
    if (pwd.length < 8) errors.push(t("Au moins 8 caractères"))
    if (!/[A-Z]/.test(pwd)) errors.push(t("Au moins 1 majuscule"))
    if (!/[0-9]/.test(pwd)) errors.push(t("Au moins 1 chiffre"))
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push(t("Au moins 1 caractère spécial"))
    return errors
  }

  // Creative icons for different field types
  const getFieldIcon = (label: string) => {
    if (label.includes("utilisateur") || label.includes("username")) return User
    if (label.includes("Email") || label.includes("email")) return Mail
    if (label.includes("Prénom") || label.includes("firstName")) return Heart
    if (label.includes("Nom") || label.includes("lastName")) return Star
    if (label.includes("Rôle") || label.includes("role")) return Crown
    return Sparkles
  }

  // Profile fields with creative icons
  const profileFields = user ? [
    { label: t("Nom d'utilisateur"), value: user.username },
    user.email ? { label: t("Email"), value: user.email } : null,
    user.firstName ? { label: t("Prénom"), value: user.firstName } : null,
    user.lastName ? { label: t("Nom"), value: user.lastName } : null,
    { label: t("Rôle"), value: user.roles[0] },
  ]
    .filter((f): f is { label: string; value: string } => Boolean(f))
    .map((field) => ({
      ...field,
      icon: getFieldIcon(field.label),
    })) : []

  // Warn if any user info is missing
  const missingFields = user ? [
    !user.email && t("L'email est manquant dans votre profil."),
    !user.firstName && t("Le prénom est manquant dans votre profil."),
    !user.lastName && t("Le nom de famille est manquant dans votre profil."),
  ].filter(Boolean) : [];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Clear previous error
    // Prevent submission if token is missing
    if (!token) {
      setMessage(t("Session expirée, veuillez vous reconnecter."));
      setTimeout(() => {
        logout();
        router.replace("/login");
      }, 1500);
      return;
    }
    if (!currentPassword) {
      setFormError(t("Veuillez saisir votre mot de passe actuel."));
      return;
    }
    if (currentPassword && password && currentPassword === password) {
      setFormError(t("Le nouveau mot de passe doit être différent de l'ancien."));
      setPasswordErrors([]);
      return;
    }
    const errors = validatePassword(password);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      setFormError(t("Le mot de passe ne respecte pas les critères de sécurité."));
      return;
    }
    if (password !== confirm) {
      setFormError(t("Les nouveaux mots de passe ne correspondent pas."));
      setPasswordErrors([]);
      return;
    }
    if (!userId || !username) {
      setMessage(t("Impossible de trouver l'identifiant utilisateur."));
      return;
    }
    try {
      // Call backend endpoint
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch("http://localhost:8081/account/change-password", {
        method: "POST",
        headers,
        body: JSON.stringify({ currentPassword, newPassword: password }),
      });
      if (!res.ok) {
        const msg = await res.text();
        setFormError(msg || t("Erreur lors du changement de mot de passe."));
        return;
      }
      setMessage(t("Mot de passe changé avec succès. Vous allez être déconnecté."));
      setTimeout(() => {
        logout();
        router.replace("/login");
      }, 2000);
    } catch (err) {
      setFormError(t("Erreur lors du changement de mot de passe."));
    }
  }

  const handlePasswordInput = (value: string) => {
    setPassword(value)
    if (value) {
      setPasswordErrors(validatePassword(value))
    } else {
      setPasswordErrors([])
    }
  }

  const getDashboardPath = () => {
    if (!user) return "/"
    if (user.roles.includes("ADMIN")) return "/dashboard"
    if (user.roles.includes("RESP_RH")) return "/dashboard-rh"
    if (user.roles.includes("INFIRMIER_ST")) return "/dashboard-infirmier"
    if (user.roles.includes("MEDECIN_TRAVAIL")) return "/dashboard-medecin"
    if (user.roles.includes("RESP_HSE")) return "/dashboard-hse"
    if (user.roles.includes("SALARIE")) return "/dashboard-salarie"
    return "/"
  }

  const isGoogleUser = user && user.email && user.username === user.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-red-950 p-4">
      {/* Warning for missing user info */}
      {missingFields.length > 0 && (
        <div className="max-w-md mx-auto mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded animate-fade-in">
          <div className="font-bold mb-1">{t("Attention")}</div>
          <ul className="list-disc pl-5">
            {missingFields.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
          <div className="mt-2 text-xs">{t("Veuillez mettre à jour votre profil dans Keycloak ou contacter l'administrateur.")}</div>
        </div>
      )}
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-20 h-20 bg-red-200/20 dark:bg-red-800/20 rounded-full animate-pulse"></div>
        <div
          className="absolute top-40 right-32 w-16 h-16 bg-red-300/20 dark:bg-red-700/20 rounded-full animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-40 w-12 h-12 bg-red-400/20 dark:bg-red-600/20 rounded-full animate-ping"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Compact Header */}
      <div className="flex justify-between items-center mb-8 animate-slide-down">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-r from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-red-700 to-red-900 bg-clip-text text-transparent">
            OHSE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === "en" ? "fr" : "en")}
            className="h-8 px-3 text-xs font-medium rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-300 flex items-center gap-1"
          >
            <Globe className="h-3 w-3" />
            {language.toUpperCase()}
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto">
        {/* Action Buttons */}
        <div className="flex gap-2 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <button
            onClick={() => router.push(getDashboardPath())}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("Tableau de bord")}
          </button>
          <button
            onClick={() => {
              logout()
              router.replace("/login")
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-300 hover:scale-105"
          >
            <LogOut className="h-4 w-4" />
            {t("Sortir")}
          </button>
        </div>

        {/* Profile Card */}
        <div
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-red-600 to-red-800 p-6 text-center">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 animate-bounce">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">{t("Mon profil")}</h1>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6 space-y-3">
            {profileFields.map((field, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
              >
                <div className="h-8 w-8 bg-gradient-to-r from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-md">
                  <field.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{field.label}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{field.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Change Password Section */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="text-center mb-4">
              <div className="h-10 w-10 bg-gradient-to-r from-red-500 to-red-700 rounded-xl flex items-center justify-center mx-auto mb-2 animate-pulse">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">{t("Changer le mot de passe")}</h3>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="w-full h-12 px-4 pr-12 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder={t("Mot de passe actuel")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* New Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full h-12 px-4 pr-12 text-sm rounded-xl bg-white dark:bg-slate-800 border transition-all duration-300 ${
                    passwordErrors.length > 0 && password
                      ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400"
                      : "border-slate-200 dark:border-slate-600 focus:border-red-500 dark:focus:border-red-400"
                  } focus:ring-2 focus:ring-red-500/20`}
                  value={password}
                  onChange={(e) => handlePasswordInput(e.target.value)}
                  required
                  placeholder={t("Nouveau mot de passe")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    {t("Critères de sécurité :")}
                  </p>
                  {[
                    { check: password.length >= 8, text: t("Au moins 8 caractères") },
                    { check: /[A-Z]/.test(password), text: t("Au moins 1 majuscule") },
                    { check: /[0-9]/.test(password), text: t("Au moins 1 chiffre") },
                    { check: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: t("Au moins 1 caractère spécial") },
                  ].map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full flex items-center justify-center ${
                          req.check ? "bg-green-500 text-white" : "bg-slate-300 dark:bg-slate-600"
                        }`}
                      >
                        {req.check && <span className="text-[8px]">✓</span>}
                      </div>
                      <span
                        className={`text-xs ${
                          req.check ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  className={`w-full h-12 px-4 pr-12 text-sm rounded-xl bg-white dark:bg-slate-800 border transition-all duration-300 ${
                    confirm && password !== confirm
                      ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400"
                      : "border-slate-200 dark:border-slate-600 focus:border-red-500 dark:focus:border-red-400"
                  } focus:ring-2 focus:ring-red-500/20`}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder={t("Confirmer le nouveau mot de passe")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Match Indicator */}
              {confirm && (
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full flex items-center justify-center ${
                      password === confirm ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    <span className="text-[8px]">{password === confirm ? "✓" : "✗"}</span>
                  </div>
                  <span
                    className={`text-xs ${
                      password === confirm ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {password === confirm
                      ? t("Les mots de passe correspondent")
                      : t("Les mots de passe ne correspondent pas")}
                  </span>
                </div>
              )}

              {message && (
                <div
                  className={`text-center p-3 rounded-xl text-sm font-medium animate-bounce ${
                    message.includes("succès")
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {message.includes("succès") ? <Zap className="h-4 w-4" /> : <Badge className="h-4 w-4" />}
                    {message}
                  </div>
                </div>
              )}

              {formError && (
                <div className="text-red-600 font-semibold mt-2 animate-shake">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  passwordErrors.length > 0 || !currentPassword || !password || !confirm || password !== confirm
                }
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Lock className="h-4 w-4" />
                {t("Changer le mot de passe")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
 