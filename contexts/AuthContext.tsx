"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import keycloak, { initKC } from "@/lib/keycloak"
import { jwtDecode } from "jwt-decode"

const CLIENT_ID = "oshapp-frontend"

export type User = {
    username: string
    email?: string
    firstName?: string
    lastName?: string
    roles:    string[]
    sub?: string // Keycloak userId (JWT 'sub' claim)
}

export type AuthCtx = {
    user:  User | null
    token?: string
    logout: () => void
    accessToken: string | null
    loading: boolean
}

const Ctx = createContext<AuthCtx | undefined>(undefined)

// WARNING: Only mount AuthProvider ONCE at the top level (e.g., in app/layout.tsx) to avoid double initialization and code reuse issues.
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser]           = useState<User | null>(null)
    const [accessToken, setToken]   = useState<string | null>(null)
    const [loading, setLoading]     = useState(true)

    useEffect(() => {
        // 1. Try to load classic token from sessionStorage
        const stored = sessionStorage.getItem("oshapp_tokens");
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
                    roles
                };
                setUser(userObj);
                setToken(parsed.access_token);
                setLoading(false);
                return; // Don't run Keycloak init if classic token is present
            } catch (e) {
                // If token is invalid, fall through to Keycloak init
            }
        }
        // 2. Otherwise, use Keycloak JS adapter (for social login)
        (async () => {
            const authenticated = await initKC();
            if (authenticated) {
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
                    roles
                };
                setUser(userObj);
                setToken(keycloak.token!);
            } else {
                setUser(null);
                setToken(null);
            }
            setLoading(false);
        })();
    }, []);

    function logoutAndReset() {
        // Remove classic tokens
        sessionStorage.removeItem("oshapp_tokens");
        // If Keycloak is initialized and has a session, use Keycloak logout
        if (keycloak && typeof keycloak.logout === "function" && keycloak.authenticated) {
            keycloak.logout();
        } else {
            setUser(null);
            setToken(null);
            window.location.href = "/login";
        }
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
        <Ctx.Provider value={{ user, logout: logoutAndReset, accessToken, token: accessToken ?? undefined, loading }}>
            {children}
        </Ctx.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error("useAuth must be within <AuthProvider>")
    return ctx
}
