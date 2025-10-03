"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function ChangePasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    // Get email from URL parameters
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const validatePassword = (password: string) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    const errors = []
    if (password.length < minLength) errors.push(`Au moins ${minLength} caractères`)
    if (!hasUpperCase) errors.push("Au moins une majuscule")
    if (!hasLowerCase) errors.push("Au moins une minuscule")
    if (!hasNumbers) errors.push("Au moins un chiffre")
    if (!hasSpecialChar) errors.push("Au moins un caractère spécial")

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validation
    const newPasswordErrors = validatePassword(newPassword)
    if (newPasswordErrors.length > 0) {
      setErrors({ newPassword: newPasswordErrors.join(", ") })
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Les mots de passe ne correspondent pas" })
      setIsLoading(false)
      return
    }

    if (!email) {
      setErrors({ general: "Email manquant. Veuillez utiliser le lien depuis votre email." })
      setIsLoading(false)
      return
    }

    try {
      // Call the password reset API
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      console.log("Sending password reset request to:", `${API_URL}/api/v1/account/reset-password`);
      console.log("Email:", email);
      
      const response = await fetch(`${API_URL}/api/v1/account/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newPassword
        })
      })

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setErrors({ general: responseData.message || "Erreur lors de la réinitialisation du mot de passe" })
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrors({ general: "Erreur de connexion. Veuillez réessayer." })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
            <CardHeader className="text-center pb-6">
              <div className="h-16 w-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-700 dark:to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                Mot de passe réinitialisé !
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
              </p>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/login" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 rounded-xl shadow-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">OSHapp</span>
          </Link>
        </div>

        {/* Main Card */}
        <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <CardHeader className="text-center pb-6">
            <div className="h-16 w-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              Réinitialiser le mot de passe
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Veuillez entrer votre nouveau mot de passe sécurisé.
            </p>
            {email && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Compte: {email}
              </p>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-slate-700 dark:text-slate-300 font-medium">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className={`h-11 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-slate-400 dark:focus:ring-slate-500 pr-10 ${
                      errors.newPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    placeholder="Entrez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-600 text-sm">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300 font-medium">
                  Confirmer le nouveau mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`h-11 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-slate-400 dark:focus:ring-slate-500 pr-10 ${
                      errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-600 dark:text-red-400 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Password Requirements */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Exigences du mot de passe :
                </h4>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Au moins 8 caractères</li>
                  <li>• Au moins une majuscule</li>
                  <li>• Au moins une minuscule</li>
                  <li>• Au moins un chiffre</li>
                  <li>• Au moins un caractère spécial</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    Réinitialisation en cours...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Réinitialiser le mot de passe
                  </>
                )}
              </Button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 