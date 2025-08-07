"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, Sparkles, Shield, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loginWithCredentials } from "@/lib/keycloak-login"
import { saveTokens } from "@/lib/auth"
import { CompanyLogo } from "@/components/company-logo"
import { useTheme } from "@/contexts/ThemeContext"
import { LoadingOverlay } from "@/components/loading-overlay"
import { useAuth } from "@/contexts/AuthContext"

interface LoginFormProps extends React.ComponentPropsWithoutRef<"form"> {
  language?: "en" | "fr"
}

export function LoginForm({ className, language = "fr", ...props }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)
  const [loginResponse, setLoginResponse] = useState<any>(null)
  const router = useRouter()
  const { themeColors } = useTheme()
  const { user, logout, setLoginInProgress, resetLogoutFlag } = useAuth()

  // Reset login response when overlay is hidden
  useEffect(() => {
    if (!showLoadingOverlay) {
      setLoginResponse(null)
    }
  }, [showLoadingOverlay])

  const text = {
    fr: {
      title: "Connexion",
      subtitle: "Accédez à votre espace de travail",
      email: "Email",
      password: "Mot de passe",
      forgot: "Mot de passe oublié?",
      login: "Se connecter",
      google: "Continuer avec Google",
      emailPlaceholder: "nom@entreprise.com",
      or: "Ou continuer avec",
      signing: "Connexion...",
    },
    en: {
      title: "Sign In",
      subtitle: "Access your workspace",
      email: "Email",
      password: "Password",
      forgot: "Forgot password?",
      login: "Sign In",
      google: "Continue with Google",
      emailPlaceholder: "name@company.com",
      or: "Or continue with",
      signing: "Signing in...",
    },
  }

  const t = text[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🚀 Login started...")
    setIsLoading(true)
    setError("")
    
    // Set login in progress to prevent AuthContext from redirecting
    setLoginInProgress(true)
    console.log("✅ Login progress flag set")

    // Show loading overlay immediately
    setShowLoadingOverlay(true)
    console.log("🎬 Loading overlay started")

    try {
      console.log("📡 Calling loginWithCredentials...")
      const res = await loginWithCredentials(email, password)
      console.log("✅ Login successful, tokens received")
      saveTokens(res)
      console.log("💾 Tokens saved")
      
      // Store the response for the onComplete callback
      setLoginResponse(res)
      
      // Reset logout flag to allow authentication
      resetLogoutFlag()
      console.log("🔄 Logout flag reset")
      
      // The redirect will be handled by the LoadingOverlay onComplete callback
      // after the animation finishes
      
    } catch (err: any) {
      console.error("❌ Login failed:", err)
      setError(err.message || (language === "fr" ? "Erreur de connexion" : "Connection error"))
      setShowLoadingOverlay(false)
      setLoginInProgress(false)
      setLoginResponse(null) // Reset login response on error
    } finally {
      setIsLoading(false)
      console.log("🏁 Login process finished")
    }
  }

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true)
    setShowLoadingOverlay(true)
    
    // Set login in progress to prevent AuthContext from redirecting
    setLoginInProgress(true)
    
    // Professional delay for smooth transition
    setTimeout(() => {
      window.location.href =
        "http://localhost:8080/realms/oshapp/protocol/openid-connect/auth" +
        "?client_id=oshapp-frontend" +
        "&redirect_uri=http://localhost:3000/login/callback" +
        "&response_type=code" +
        "&scope=openid email profile" +
        "&kc_idp_hint=google" +
        "&prompt=select_account"
    }, 300)
  }

  return (
    <>
      <LoadingOverlay 
        isVisible={showLoadingOverlay}
        type="login"
        message={language === "fr" ? "Authentification en cours..." : "Authenticating..."}
        onComplete={() => {
          console.log("🎬 LoadingOverlay onComplete called")
          // This will be called after the animation completes
          try {
            if (!loginResponse) {
              console.error("❌ No login response available")
              setLoginInProgress(false)
              return
            }
            
            const payload = JSON.parse(atob(loginResponse.access_token.split('.')[1]))
            const roles = payload.realm_access?.roles || payload.resource_access?.["oshapp-frontend"]?.roles || []
            
            console.log("🔍 User roles:", roles)
            console.log("📋 Token payload:", payload)
            
            // Clear login in progress flag
            setLoginInProgress(false)
            console.log("🏁 Login progress flag cleared")
            
            // Redirect after animation completes
            if (roles.includes('ADMIN')) {
              console.log("👑 Redirecting to admin dashboard")
              router.push('/dashboard-admin')
            } else if (roles.includes('RESP_RH')) {
              console.log("👥 Redirecting to RH dashboard")
              router.push('/dashboard-rh')
            } else if (roles.includes('INFIRMIER_ST')) {
              console.log("🏥 Redirecting to infirmier dashboard")
              router.push('/dashboard-infirmier')
            } else if (roles.includes('MEDECIN_TRAVAIL')) {
              console.log("👨‍⚕️ Redirecting to medecin dashboard")
              router.push('/dashboard-medecin')
            } else if (roles.includes('RESP_HSE')) {
              console.log("🛡️ Redirecting to HSE dashboard")
              router.push('/dashboard-hse')
            } else if (roles.includes('SALARIE')) {
              console.log("👤 Redirecting to salarie dashboard")
              router.push('/dashboard-salarie')
            } else {
              console.log("👤 Redirecting to profile")
              router.push('/profile')
            }
          } catch (parseError) {
            console.error("❌ Error parsing token:", parseError)
            setLoginInProgress(false)
            router.push('/profile')
          }
        }}
      />
      
      <div className="w-full max-w-md mx-auto animate-fade-in relative">
        {/* Enhanced background elements */}
        <div className="absolute -top-2 -right-2 w-20 h-20 rounded-full animate-ping pointer-events-none z-0"
          style={{
            background: `conic-gradient(from 0deg, ${themeColors.colors.primary[200]}, ${themeColors.colors.primary[300]}, ${themeColors.colors.primary[400]})`,
            opacity: 0.03,
            animationDuration: "15s",
          }}
        ></div>
        <div className="absolute top-8 right-4 w-14 h-14 rounded-full animate-ping pointer-events-none z-0"
          style={{
            background: `conic-gradient(from 180deg, ${themeColors.colors.primary[300]}, ${themeColors.colors.primary[400]}, ${themeColors.colors.primary[500]})`,
            opacity: 0.02,
            animationDuration: "20s",
            animationDelay: "2s",
          }}
        ></div>
        
        {/* Enhanced form container with premium styling */}
        <div className="bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-700 relative overflow-hidden group">
          {/* Premium background gradient overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-white/30 dark:from-slate-800/50 dark:via-transparent dark:to-slate-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          />
          
          {/* Subtle border glow */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: `linear-gradient(135deg, ${themeColors.colors.primary[400]}20, ${themeColors.colors.primary[600]}20, ${themeColors.colors.primary[800]}20)`,
              boxShadow: `inset 0 0 0 1px ${themeColors.colors.primary[500]}30`,
            }}
          />
          
          {/* Enhanced shadow edge effect */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              boxShadow: `0 0 40px -10px ${themeColors.colors.primary[500]}40`,
            }}
          />
          
          <form className={cn("flex flex-col gap-7 relative z-10", className)} onSubmit={handleSubmit} {...props}>
            {/* Enhanced Header Section */}
            <div className="flex flex-col items-center gap-6 text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative group">
                {/* Enhanced logo container */}
                <div className="h-24 w-24 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:scale-110 transition-all duration-700 bg-gradient-to-br from-white/90 to-white/70 dark:from-slate-800/90 dark:to-slate-800/70 backdrop-blur-xl border border-white/40 dark:border-slate-700/40">
                  {/* OHSE Logo image in the center */}
                  <div className="w-20 h-20 relative flex items-center justify-center">
                    <img 
                      src="/images/Logo-ohse.png" 
                      alt="OHSE Logo" 
                      className="w-16 h-16 object-contain transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Enhanced notification dot */}
                  <div className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white shadow-lg z-20 animate-pulse"></div>
                  
                  {/* Subtle glow effect */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                      background: `radial-gradient(circle at center, ${themeColors.colors.primary[400]}20, transparent 70%)`,
                    }}
                  />
                </div>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <h1 className="text-3xl font-bold text-foreground dark:text-white mb-3 tracking-tight bg-gradient-to-r from-foreground to-foreground/80 dark:from-white dark:to-white/80 bg-clip-text text-transparent">{t.title}</h1>
                <p className="text-slate-600 dark:text-white/80 text-base font-medium">{t.subtitle}</p>
              </div>
            </div>

            {/* Enhanced Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg animate-scale-in text-center shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  <XCircle className="h-4 w-4" />
                  <p className="text-sm font-semibold">{error}</p>
                </div>
              </div>
            )}

            {/* Enhanced Form Fields */}
            <div className="space-y-6">
              {/* Enhanced Email Field */}
              <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.6s" }}>
                <Label htmlFor="email" className="text-sm font-bold text-foreground dark:text-white flex items-center gap-2">
                  <Mail className="h-4 w-4" style={{ color: themeColors.colors.primary[600] }} />
                  {t.email}
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/50 to-white/30 dark:from-slate-800/50 dark:to-slate-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-16 pl-16 pr-4 text-base bg-white/90 dark:bg-slate-800/90 border-white/60 dark:border-slate-700/60 text-foreground dark:text-white rounded-xl transition-all duration-500 shadow-lg hover:shadow-xl focus:shadow-2xl focus:border-white/80 dark:focus:border-slate-600/80 backdrop-blur-sm group-hover:scale-[1.02] group-hover:-translate-y-1 relative z-10"
                    placeholder={t.emailPlaceholder}
                    style={{
                      boxShadow: `0 4px 20px -4px ${themeColors.colors.primary[500]}20`,
                    }}
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 z-20"
                    style={{ color: themeColors.colors.primary[600] }}
                  />
                  
                  {/* Input glow effect on hover */}
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
                    style={{
                      boxShadow: `0 0 25px -5px ${themeColors.colors.primary[500]}40`,
                    }}
                  />
                  
                  {/* Shimmer effect */}
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full z-0"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${themeColors.colors.primary[400]}20, transparent)`,
                    }}
                  />
                </div>
              </div>

              {/* Enhanced Password Field */}
              <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.8s" }}>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-bold text-foreground dark:text-white flex items-center gap-2">
                    <Lock className="h-4 w-4" style={{ color: themeColors.colors.primary[600] }} />
                    {t.password}
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm hover:underline transition-all duration-300 font-semibold hover:scale-105 hover:text-primary"
                    style={{ color: themeColors.colors.primary[600] }}
                  >
                    {t.forgot}
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/50 to-white/30 dark:from-slate-800/50 dark:to-slate-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-16 pl-16 pr-16 text-base bg-white/90 dark:bg-slate-800/90 border-white/60 dark:border-slate-700/60 text-foreground dark:text-white rounded-xl transition-all duration-500 shadow-lg hover:shadow-xl focus:shadow-2xl focus:border-white/80 dark:focus:border-slate-600/80 backdrop-blur-sm group-hover:scale-[1.02] group-hover:-translate-y-1 relative z-10"
                    style={{
                      boxShadow: `0 4px 20px -4px ${themeColors.colors.primary[500]}20`,
                    }}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 z-20"
                    style={{ color: themeColors.colors.primary[600] }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 text-muted-foreground transition-all duration-300 rounded-lg hover:scale-110 z-20"
                    style={{ color: themeColors.colors.primary[600] }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                  
                  {/* Input glow effect on hover */}
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
                    style={{
                      boxShadow: `0 0 25px -5px ${themeColors.colors.primary[500]}40`,
                    }}
                  />
                  
                  {/* Shimmer effect */}
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full z-0"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${themeColors.colors.primary[400]}20, transparent)`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 rounded-2xl text-lg font-bold animate-fade-in disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden group"
              style={{ 
                animationDelay: "1s",
                background: `linear-gradient(135deg, ${themeColors.colors.primary[500]} 0%, ${themeColors.colors.primary[600]} 25%, ${themeColors.colors.primary[700]} 50%, ${themeColors.colors.primary[800]} 75%, ${themeColors.colors.primary[900]} 100%)`,
                color: "white"
              }}
            >
              {/* Button background animation */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent, ${themeColors.colors.primary[400]}40, transparent)`,
                }}
              />
              
              {/* Shimmer effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"
              />
              
              {isLoading ? (
                <div className="flex items-center gap-3 relative z-10">
                  <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t.signing}
                </div>
              ) : (
                <div className="flex items-center gap-3 relative z-10">
                  <Sparkles className="h-6 w-6 group-hover:animate-pulse group-hover:rotate-12 transition-all duration-300" />
                  {t.login}
                </div>
              )}
            </Button>

            {/* Enhanced Divider */}
            <div className="relative text-center text-sm animate-fade-in" style={{ animationDelay: "1.2s" }}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60 dark:border-slate-600/60"></div>
              </div>
              <span className="relative px-6 text-slate-600 dark:text-white/80 font-bold bg-white/98 dark:bg-slate-900/98 backdrop-blur-sm rounded-full py-2">{t.or}</span>
            </div>

            {/* Enhanced Google Login Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full h-16 bg-white/90 dark:bg-slate-800/90 border-white/60 dark:border-slate-700/60 text-foreground dark:text-white hover:bg-white dark:hover:bg-slate-700 hover:border-white/80 dark:hover:border-slate-600/80 font-bold animate-fade-in disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm group relative overflow-hidden hover:scale-[1.02] hover:-translate-y-1"
              style={{ 
                animationDelay: "1.4s",
                boxShadow: `0 4px 20px -4px ${themeColors.colors.primary[500]}20`,
              }}
            >
              {/* Google button background animation */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent, ${themeColors.colors.primary[400]}20, transparent)`,
                }}
              />
              
              {/* Shimmer effect for Google button */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"
              />
              
              {/* Subtle border glow on hover */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  boxShadow: `inset 0 0 0 1px ${themeColors.colors.primary[500]}30`,
                }}
              />
              
              {/* Enhanced glow effect on hover */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  boxShadow: `0 0 25px -5px ${themeColors.colors.primary[500]}40`,
                }}
              />
              
              {isGoogleLoading ? (
                <div className="flex items-center gap-3 relative z-10">
                  <div className="h-5 w-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>
                  {language === "fr" ? "Connexion..." : "Connecting..."}
                </div>
              ) : (
                <div className="flex items-center gap-3 relative z-10">
                  <svg className="w-7 h-7 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span 
                    className="group-hover:scale-110 group-hover:font-extrabold transition-all duration-300 group-hover:tracking-wide"
                    style={{
                      color: 'inherit',
                      textShadow: 'none',
                    }}
                  >
                    {t.google}
                  </span>
                </div>
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
