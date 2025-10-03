"use client"
import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Mail, Shield, LogOut, Globe } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from '../../../components/theme-toggle';
import { useToast } from '../../../components/ui/use-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

export default function ActivationPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<'en' | 'fr'>('fr');
  const { toast } = useToast();
  const { logout, accessToken, user } = useAuth();
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const text = {
    fr: {
      title: "Activer Votre Compte",
      subtitle: "Entrez le code d'activation envoyé à votre email pour vérifier votre compte.",
      code: "Code d'activation",
      verify: "Vérifier",
      resend: "Renvoyer le code",
      logout: "Déconnexion",
      success: "Votre compte est maintenant actif ! Vous pouvez vous connecter.",
      error: "Code invalide ou expiré.",
    },
    en: {
      title: "Activate Your Account",
      subtitle: "Enter the activation code sent to your email to verify your account.",
      code: "Activation code",
      verify: "Verify",
      resend: "Resend code",
      logout: "Logout",
      success: "Your account is now active! You can log in.",
      error: "Invalid or expired code.",
    },
  };
  const t = text[language];

  // Placeholder: Replace with actual API call
  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!user || !user.email) {
        setError(language === 'fr' ? "Utilisateur non trouvé." : "User not found.");
        setLoading(false);
        return;
      }
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      const response = await fetch(`${API_URL}/account/verify-activation-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email: user.email, code }),
      });

      if (response.ok) {
        setSuccess(true);
        toast({ title: language === 'fr' ? "Activation réussie !" : "Activation successful!", description: language === 'fr' ? "Votre compte est maintenant actif. Veuillez vous reconnecter." : "Your account is now active. Please log in again." });
        setTimeout(() => {
          logout();
          router.push('/login?activated=1');
        }, 2000);
      } else {
        const msg = await response.text();
        setError(msg || (language === 'fr' ? "Code invalide ou expiré." : "Invalid or expired code."));
      }
    } catch (err) {
      setError(language === 'fr' ? "Erreur réseau." : "Network error.");
    } finally {
      setLoading(false);
    }
  };

  // Placeholder: Replace with actual resend logic
  const handleResend = async () => {
    setIsResending(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      };
      const body = JSON.stringify({ email: user?.email });
      // Debug logs
      console.log('Resend Activation Debug:');
      console.log('accessToken:', accessToken);
      console.log('user:', user);
      console.log('headers:', headers);
      console.log('body:', body);
      // --- Resend Activation Code API Call ---
      if (!user || !user.email) {
        throw new Error("User or user email is missing");
      }
      const resendUrl = "http://localhost:8081/account/send-activation-code";
      const resendBody = JSON.stringify({ email: user.email });
      const resendHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      };
      console.log("Resend Activation Debug:");
      console.log("accessToken:", accessToken);
      console.log("user:", user);
      console.log("headers:", resendHeaders);
      console.log("body:", resendBody);
      const response = await fetch(resendUrl, {
        method: "POST",
        headers: resendHeaders,
        body: resendBody,
      });
      if (!response.ok) throw new Error("Failed to resend code");
      setResendTimer(60);
      toast({ title: t.resend, description: language === 'fr' ? "Un nouveau code a été envoyé à votre email." : "A new code has been sent to your email." });
    } catch (err) {
      toast({ title: language === 'fr' ? "Erreur" : "Error", description: language === 'fr' ? "Impossible d'envoyer le code. Réessayez plus tard." : "Unable to send code. Please try again later.", variant: "destructive" });
    } finally {
      setIsResending(false);
    }
  };

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  React.useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) setCode(urlCode);
    // Optionally, auto-submit if both code and user.email are present
    const urlEmail = searchParams.get('email');
    if (urlCode && urlEmail && user && user.email === urlEmail) {
      // Only auto-submit if not already activated
      if (!success && !loading) {
        handleActivate({ preventDefault: () => {} } as React.FormEvent);
      }
    }
  }, [searchParams, user]);

  // Role-based dashboard path
  const getDashboardPath = () => {
    if (!user) return "/";
    if (user.roles.includes("ADMIN")) return "/dashboard";
    if (user.roles.includes("RESP_RH")) return "/dashboard-rh";
    if (user.roles.includes("INFIRMIER_ST")) return "/dashboard-infirmier";
    if (user.roles.includes("MEDECIN_TRAVAIL")) return "/dashboard-medecin";
    if (user.roles.includes("RESP_HSE")) return "/dashboard-hse";
    if (user.roles.includes("SALARIE")) return "/dashboard-salarie";
    return "/";
  };

  const [redirectCountdown, setRedirectCountdown] = useState(2);
  React.useEffect(() => {
    if (success && redirectCountdown > 0) {
      const timer = setTimeout(() => setRedirectCountdown(redirectCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (success && redirectCountdown === 0) {
      router.push(getDashboardPath());
    }
  }, [success, redirectCountdown]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-6 relative">
      {/* Profile menu top right */}
      <div className="absolute top-6 right-8 flex items-center gap-2 z-10">
        <button
          onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
          className="h-9 px-3 text-sm font-medium rounded-lg ohse-btn-secondary flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          {language === 'en' ? 'FR' : 'EN'}
        </button>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="ohse-text-secondary hover:bg-red-900 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t.logout}
        </Button>
      </div>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/login" className="flex items-center gap-3">
            <div className="h-10 w-10 ohse-gradient-burgundy rounded-xl shadow-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold ohse-text-burgundy">OHSE CAPITAL</span>
          </Link>
        </div>
        {/* Main Card */}
        <Card className="ohse-card shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 ohse-text-burgundy" />
            </div>
            <CardTitle className="text-2xl font-bold ohse-text-primary">
              {t.title}
            </CardTitle>
            <p className="text-sm ohse-text-secondary mt-2">
              {t.subtitle}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleActivate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="activation-code" className="ohse-text-burgundy font-medium">
                  {t.code}
                </Label>
                <Input
                  id="activation-code"
                  type="text"
                  placeholder={t.code}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  disabled={loading || success}
                  required
                  maxLength={8}
                  className="h-11 ohse-input"
                />
              </div>
              {error && (
                <div className="text-red-600 text-xs text-center mt-2">
                  {error.toLowerCase().includes('expired') || error.toLowerCase().includes('invalid')
                    ? (language === 'fr'
                        ? 'Code invalide ou expiré. Veuillez utiliser le code le plus récent envoyé à votre email.'
                        : 'Invalid or expired code. Please use the most recent code sent to your email.')
                    : error}
                </div>
              )}
              {success && (
                <div className="text-green-600 text-sm text-center flex flex-col items-center gap-2">
                  {t.success}
                  <div className="mt-2 flex items-center gap-2 animate-pulse">
                    <span>{language === 'fr' ? 'Redirection dans' : 'Redirecting in'}</span>
                    <span className="font-bold text-lg">{redirectCountdown}</span>
                    <svg className="w-5 h-5 text-green-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    <span>{language === 'fr' ? 'secondes...' : 'seconds...'}</span>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full h-11 ohse-btn-primary shadow-lg hover:shadow-xl transition-all duration-300" disabled={loading || success}>
                {loading ? t.verify + '...' : t.verify}
              </Button>
            </form>
            <div className="flex flex-col items-center mt-6">
              <Button
                variant="outline"
                className="w-full h-11 ohse-btn-secondary bg-transparent"
                style={{
                  borderColor: (hover || focus) ? '#cbd5e1' : '#e2e8f0',
                  borderWidth: '2px',
                  backgroundColor: hover ? '#f1f5f9' : (resendTimer > 0 ? '#f8fafc' : ''),
                  color: hover ? '#0f172a' : (resendTimer > 0 ? '#64748b' : ''),
                  transition: 'all 0.2s',
                  boxShadow: 'none',
                  outline: 'none',
                  cursor: resendTimer > 0 || loading || success || isResending ? 'not-allowed' : 'pointer',
                  opacity: resendTimer > 0 || loading || success || isResending ? 0.6 : 1,
                }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                onMouseDown={e => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.outline = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={handleResend}
                disabled={isResending || resendTimer > 0}
              >
                {isResending ? (language === 'fr' ? 'Envoi...' : 'Sending...') : resendTimer > 0 ? `${t.resend} (${resendTimer})` : t.resend}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
