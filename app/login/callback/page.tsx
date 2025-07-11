"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { saveTokens } from "@/lib/auth"
import { jwtDecode } from "jwt-decode"

export default function GoogleCallback() {
  const router = useRouter()
  const params = useSearchParams()
  const hasRun = useRef(false)
  const [status, setStatus] = useState<'loading' | 'error'>('loading')

  const code = params.get("code")
  const errorParam = params.get("error")
  const sessionState = params.get("session_state")

  // Helper to remove code/state params from URL
  function removeAuthParamsFromUrl() {
    if (typeof window !== 'undefined' && window.history.replaceState) {
      const url = new URL(window.location.href)
      url.searchParams.delete('code')
      url.searchParams.delete('state')
      url.searchParams.delete('error')
      url.searchParams.delete('error_description')
      url.searchParams.delete('iss')
      url.searchParams.delete('session_state')
      window.history.replaceState({}, document.title, url.pathname + url.search)
    }
  }

  // Helper: redirect user based on their role
  function redirectByRole(token: string) {
    try {
      // jwtDecode returns unknown, so cast as any for role access
      const payload = jwtDecode(token) as any
      const roles = payload?.realm_access?.roles || []
      if (roles.includes("ADMIN")) router.replace("/dashboard")
      else if (roles.includes("RESP_RH")) router.replace("/dashboard-rh")
      else if (roles.includes("INFIRMIER_ST")) router.replace("/dashboard-infirmier")
      else if (roles.includes("MEDECIN_TRAVAIL")) router.replace("/dashboard-medecin")
      else if (roles.includes("RESP_HSE")) router.replace("/dashboard-hse")
      else if (roles.includes("SALARIE")) router.replace("/dashboard-salarie")
      else router.replace("/profile")
    } catch {
      router.replace("/profile")
    }
  }

  useEffect(() => {
    // If error param in URL, redirect to login immediately
    if (errorParam) {
      setStatus('error')
      setTimeout(() => {
        removeAuthParamsFromUrl()
        router.replace('/login')
      }, 1000)
      return
    }
    // If session_state is present but no code, treat as expired/invalid session
    if (sessionState && !code) {
      setStatus('error')
      setTimeout(() => {
        removeAuthParamsFromUrl()
        router.replace('/login')
      }, 3000)
      return
    }
    if (!code) return; // Wait until code is present
    if (hasRun.current) return;
    hasRun.current = true;

    // Always show spinner for at least 3 seconds
    const minWait = new Promise(res => setTimeout(res, 3000))
    fetch("http://localhost:8080/realms/oshapp/protocol/openid-connect/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: "oshapp-frontend",
        code,
        redirect_uri: "http://localhost:3000/login/callback",
      }),
    })
      .then(res => res.json())
      .then(tokens => {
        if (tokens && typeof tokens.access_token === 'string') {
          saveTokens(tokens)
          removeAuthParamsFromUrl()
          // Wait for spinner, then redirect by role
          minWait.then(() => redirectByRole(tokens.access_token))
        } else {
          setStatus('error')
          setTimeout(() => {
            removeAuthParamsFromUrl()
            router.replace('/login')
          }, 5000)
        }
      })
      .catch(() => {
        setStatus('error')
        setTimeout(() => {
          removeAuthParamsFromUrl()
          router.replace('/login')
        }, 5000)
      })
  }, [router, code, errorParam, sessionState])

  const lang = typeof navigator !== 'undefined' && navigator.language.startsWith('en') ? 'en' : 'fr';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900">
      <div className="flex flex-col items-center gap-6 p-8 rounded-2xl shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center animate-spin-slow">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
        </div>
        <h1 className="text-2xl font-bold ohse-text-primary">Connexion Google…</h1>
        {status === 'loading' && (
          <p className="text-green-600 text-center font-semibold">
            {lang === 'fr' ? "Connexion en cours, tu vas être redirigé…" : "Connecting, you will be redirected…"}
          </p>
        )}
        {status === 'error' && (
          <p className="text-green-600 text-center font-semibold">
            {lang === 'fr' ? "Tu vas être redirigé..." : "You will be redirected..."}
          </p>
        )}
      </div>
    </div>
  )
}