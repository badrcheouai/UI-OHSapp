"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import keycloak, { initKC } from "@/lib/keycloak"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "next/navigation"
import { clearTokens, logout as authLogout } from "@/lib/auth"
import { LoadingOverlay } from "@/components/loading-overlay"

const CLIENT_ID = "oshapp-frontend"

export type User = {
    username: string
    email?: string
    firstName?: string
    lastName?: string
    roles:    string[]
    sub?: string // Keycloak userId (JWT 'sub' claim)
    emailVerified?: boolean // <-- Add this
    matriculeNumber?: string // Numéro de matricule (employee number)
}

export type AuthCtx = {
    user:  User | null
    token?: string
    logout: () => void
    accessToken: string | null
    loading: boolean
    setLoginInProgress: (inProgress: boolean) => void
    resetLogoutFlag: () => void
}

const Ctx = createContext<AuthCtx | undefined>(undefined)

// WARNING: Only mount AuthProvider ONCE at the top level (e.g., in app/layout.tsx) to avoid double initialization and code reuse issues.
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser]           = useState<User | null>(null)
    const [accessToken, setToken]   = useState<string | null>(null)
    const [loading, setLoading]     = useState(true)
    const [isLoginInProgress, setIsLoginInProgress] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [showLogoutOverlay, setShowLogoutOverlay] = useState(false)
    const router = useRouter()

    useEffect(() => {
        console.log("🔄 AuthContext useEffect triggered, isLoginInProgress:", isLoginInProgress, "isLoggingOut:", isLoggingOut)
        
        // Don't authenticate if we're in the process of logging out
        if (isLoggingOut) {
            console.log("⏸️ AuthContext: Skipping authentication - logout in progress")
            setLoading(false)
            return
        }
        
        // 1. Try to load classic token from localStorage
        const stored = localStorage.getItem("oshapp_tokens");
        if (!stored) {
            setUser(null);
            setToken(null);
            setLoading(false);
            console.log("🚫 No tokens found, user set to null");
            return;
        }
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                const payload = jwtDecode(parsed.access_token) as any;
                let roles: string[] = [];
                if (payload.realm_access?.roles) roles = payload.realm_access.roles;
                else if (payload.resource_access && payload.resource_access[CLIENT_ID]?.roles) roles = payload.resource_access[CLIENT_ID].roles;
                else if (payload.roles) roles = Array.isArray(payload.roles) ? payload.roles : [payload.roles];
                const userObj = {
                    username: payload.preferred_username,
                    sub: payload.sub,
                    email: payload.email,
                    firstName: payload.given_name,
                    lastName: payload.family_name,
                    roles,
                    emailVerified: payload.email_verified // <-- Add this
                };
                setUser(userObj);
                setToken(parsed.access_token);
                setLoading(false);
                console.log("✅ AuthContext: Token found, user set")
                // Only redirect if not in login progress and on specific paths
                if (typeof window !== 'undefined' && !isLoginInProgress) {
                  console.log("🔄 AuthContext: Attempting redirect (not in login progress)")
                  const path = window.location.pathname;
                  // Don't redirect from login page - let the login form handle it
                  if ((path === '/' || path === '/dashboard') && path !== '/login') {
                    console.log("🎯 AuthContext: Redirecting from", path)
                    if (roles.includes('ADMIN')) {
                      console.log("👑 Redirecting admin to admin dashboard")
                      router.push('/dashboard-admin')
                    } else if (roles.includes('RESP_RH')) {
                      console.log("👥 Redirecting RH to RH dashboard")
                      router.push('/dashboard-rh')
                    } else if (roles.includes('INFIRMIER_ST')) {
                      console.log("🏥 Redirecting infirmier to infirmier dashboard")
                      router.push('/dashboard-infirmier')
                    } else if (roles.includes('MEDECIN_TRAVAIL')) {
                      console.log("👨‍⚕️ Redirecting medecin to medecin dashboard")
                      router.push('/dashboard-medecin')
                    } else if (roles.includes('RESP_HSE')) {
                      console.log("🛡️ Redirecting HSE to HSE dashboard")
                      router.push('/dashboard-hse')
                    } else if (roles.includes('SALARIE')) {
                      console.log("👤 Redirecting salarie to salarie dashboard")
                      router.push('/dashboard-salarie')
                    } else {
                      console.log("👤 Redirecting to profile (no specific role)")
                      router.push('/profile')
                    }
                  } else {
                    console.log("⏸️ AuthContext: Not redirecting, path is", path)
                  }
                } else {
                  console.log("⏸️ AuthContext: Not redirecting, login in progress or not on redirect path")
                }
                return; // Don't run Keycloak init if classic token is present
            } catch (e) {
                console.log("❌ AuthContext: Error parsing stored token:", e)
                // If token is invalid, fall through to Keycloak init
            }
        } else {
            console.log("📭 AuthContext: No stored tokens found")
        }
        // 2. Otherwise, use Keycloak JS adapter (for social login)
        (async () => {
            console.log("🔑 AuthContext: Initializing Keycloak...")
            const authenticated = await initKC();
            if (authenticated) {
                console.log("✅ AuthContext: Keycloak authenticated")
                const payload = jwtDecode(keycloak.token!) as any;
                let roles: string[] = [];
                if (payload.realm_access?.roles) roles = payload.realm_access.roles;
                else if (payload.resource_access && payload.resource_access[CLIENT_ID]?.roles) roles = payload.resource_access[CLIENT_ID].roles;
                else if (payload.roles) roles = Array.isArray(payload.roles) ? payload.roles : [payload.roles];
                const userObj = {
                    username: payload.preferred_username,
                    sub: payload.sub,
                    email: payload.email,
                    firstName: payload.given_name,
                    lastName: payload.family_name,
                    roles,
                    emailVerified: payload.email_verified // <-- Add this
                };
                setUser(userObj);
                setToken(keycloak.token!);
                console.log("✅ AuthContext: Keycloak user set")
                // Only redirect if not in login progress and on specific paths
                if (typeof window !== 'undefined' && !isLoginInProgress) {
                  console.log("🔄 AuthContext: Attempting Keycloak redirect (not in login progress)")
                  const path = window.location.pathname;
                  // Don't redirect from login page - let the login form handle it
                  if ((path === '/' || path === '/dashboard') && path !== '/login') {
                    console.log("🎯 AuthContext: Keycloak redirecting from", path)
                    if (roles.includes('ADMIN')) {
                      console.log("👑 Redirecting admin to admin dashboard")
                      router.push('/dashboard-admin')
                    } else if (roles.includes('RESP_RH')) {
                      console.log("👥 Redirecting RH to RH dashboard")
                      router.push('/dashboard-rh')
                    } else if (roles.includes('INFIRMIER_ST')) {
                      console.log("🏥 Redirecting infirmier to infirmier dashboard")
                      router.push('/dashboard-infirmier')
                    } else if (roles.includes('MEDECIN_TRAVAIL')) {
                      console.log("👨‍⚕️ Redirecting medecin to medecin dashboard")
                      router.push('/dashboard-medecin')
                    } else if (roles.includes('RESP_HSE')) {
                      console.log("🛡️ Redirecting HSE to HSE dashboard")
                      router.push('/dashboard-hse')
                    } else if (roles.includes('SALARIE')) {
                      console.log("👤 Redirecting salarie to salarie dashboard")
                      router.push('/dashboard-salarie')
                    } else {
                      console.log("👤 Redirecting to profile (no specific role)")
                      router.push('/profile')
                    }
                  } else {
                    console.log("⏸️ AuthContext: Not redirecting Keycloak, path is", path)
                  }
                } else {
                  console.log("⏸️ AuthContext: Not redirecting Keycloak, login in progress or not on redirect path")
                }
            } else {
                console.log("❌ AuthContext: Keycloak not authenticated")
                setUser(null);
                setToken(null);
            }
            setLoading(false);
            console.log("🏁 AuthContext: Loading finished")
        })();
    }, [router, isLoginInProgress, isLoggingOut]);

    // Function to set login in progress (called from login form)
    const setLoginInProgress = (inProgress: boolean) => {
        console.log("🔧 setLoginInProgress called with:", inProgress)
        setIsLoginInProgress(inProgress);
    };

    // Function to reset logout flag (called from login form)
    const resetLogoutFlag = () => {
        console.log("🔄 Resetting logout flag")
        setIsLoggingOut(false);
    };

    // Function to perform the actual logout (called after animation)
    const performLogout = () => {
        console.log("🔧 Performing actual logout...")
        
        // Set logout flag to prevent navigation guards from interfering
        setIsLoggingOut(true)
        
        // Use the proper logout function that handles back-channel logout
        authLogout()
        console.log("🔑 Back-channel logout sent to Keycloak")
        
        // Clear any other auth-related data
        localStorage.clear()
        
        // Clear any Keycloak-specific storage
        sessionStorage.removeItem("kc_tokens")
        sessionStorage.removeItem("kc_refreshToken")
        sessionStorage.removeItem("kc_idToken")
        sessionStorage.removeItem("kc_token")
        
        // Clear cookies (if any)
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        console.log("🗑️ All storage cleared")
        console.log("🔍 After logout - localStorage:", localStorage.getItem("oshapp_tokens"))
        console.log("🔍 After logout - Keycloak tokens:", sessionStorage.getItem("kc_tokens"))
        console.log("🔍 After logout - Cookies:", document.cookie)
        
        // Reset state
        setUser(null)
        setToken(null)
        console.log("🔄 State reset")
        
        // Hide logout overlay
        setShowLogoutOverlay(false)
        
        // Redirect to login page with force reload to prevent infinite redirects
        console.log("🔄 Redirecting to login page")
        window.location.href = "/login"
        
        // Reset logout flag
        setIsLoggingOut(false)
    }

    function logoutAndReset() {
        console.log("🚪 Logout started...")
        console.log("🔍 Before logout - localStorage:", localStorage.getItem("oshapp_tokens"))
        console.log("🔍 Before logout - Keycloak tokens:", sessionStorage.getItem("kc_tokens"))
        console.log("🔍 Before logout - Cookies:", document.cookie)
        
        // Show logout animation
        setShowLogoutOverlay(true)
        console.log("🎬 Logout overlay started")
        
        // Reset login progress flag
        setIsLoginInProgress(false)
        setIsLoggingOut(true) // Set logout flag
        
        // The actual logout will be handled by the LoadingOverlay onComplete callback
    }

    // Remove login function (no username/password login)

    function SplashScreen() {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mb-4"></div>
          <div className="text-lg">Chargement...</div>
        </div>
      );
    }

    if (loading) {
        return <SplashScreen />;
    }

    return (
        <>
            <Ctx.Provider value={{ user, logout: logoutAndReset, accessToken, token: accessToken ?? undefined, loading, setLoginInProgress, resetLogoutFlag }}>
                {children}
            </Ctx.Provider>
            
            {/* Logout Loading Overlay */}
            <LoadingOverlay
                isVisible={showLogoutOverlay}
                type="logout"
                message="Déconnexion en cours..."
                onComplete={performLogout}
            />
        </>
    )
}

export function useAuth() {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error("useAuth must be within <AuthProvider>")
    return ctx
}
