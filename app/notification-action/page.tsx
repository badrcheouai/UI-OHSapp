"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useEffect } from "react"
// Local translations object
const translations = {
  fr: {
    title: "Que souhaitez-vous faire ?",
    accept: "Accepter",
    postpone: "Reporter",
    newDate: "Nouvelle date",
    confirmed: "Vous avez accepté le rendez-vous.",
    postponed: (date: string) => `Vous avez demandé un report pour le ${date}.`,
    actionSaved: "Action enregistrée",
    switchLang: "EN",
    instructions: "Veuillez choisir une action pour ce rendez-vous médical.",
    back: "Retour au tableau de bord",
  },
  en: {
    title: "What would you like to do?",
    accept: "Accept",
    postpone: "Postpone",
    newDate: "New date",
    confirmed: "You have accepted the appointment.",
    postponed: (date: string) => `You requested a postponement to ${date}.`,
    actionSaved: "Action saved",
    switchLang: "FR",
    instructions: "Please choose an action for this medical appointment.",
    back: "Back to dashboard",
  },
};
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Add necessary imports at the top of the file
import { CompanyLogo } from "@/components/company-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Globe, CheckCircle, CalendarCheck, CalendarPlus, ArrowLeft, Bell } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function NotificationActionPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "fr">("fr");
  const t = translations[lang];
  const [action, setAction] = useState<"accept" | "postpone">();
  const [date, setDate] = useState("");
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
  const { user } = useAuth();
  const role = user?.roles?.[0] || "SALARIE";
  const [message, setMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  function getDashboardPath(role: string) {
    switch (role) {
      case "MEDECIN_TRAVAIL":
        return "/dashboard-medecin";
      case "RESP_HSE":
        return "/dashboard-hse";
      case "RESP_RH":
        return "/dashboard-rh";
      case "SALARIE":
        return "/dashboard-salarie";
      case "INFIRMIER_ST":
        return "/dashboard-infirmier";
      default:
        return "/dashboard";
    }
  }
  const dashboardPath = getDashboardPath(role);

  const handleAccept = async () => {
    if (!id) return;
    setActionLoading(true);
    await fetch(`${API_URL}/api/notifications/${id}/accept`, { method: "POST" });
    setMessage(lang === "fr" ? "Rendez-vous accepté ! Redirection..." : "Appointment accepted! Redirecting...");
    setTimeout(() => router.push(dashboardPath), 3000);
  };

  const handlePostpone = async () => {
    if (!id || !date) return;
    setActionLoading(true);
    await fetch(`${API_URL}/api/notifications/${id}/postpone?date=${encodeURIComponent(date)}`, { method: "POST" });
    setMessage(lang === "fr" ? `Report demandé pour le ${date} ! Redirection...` : `Postponement requested for ${date}! Redirecting...`);
    setTimeout(() => router.push(dashboardPath), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-red-950 p-4">
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
      <div className="flex justify-between items-center w-full max-w-md mb-8 animate-slide-down">
        <div className="flex items-center gap-2">
          <CompanyLogo size={32} className="shadow-lg" />
          <span className="text-lg font-bold bg-gradient-to-r from-red-700 to-red-900 bg-clip-text text-transparent">
            OHSE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
            className="h-8 px-3 text-xs font-medium rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-300 flex items-center gap-1"
          >
            <Globe className="h-3 w-3" />
            {t.switchLang}
          </button>
          <ThemeToggle />
        </div>
      </div>

      <Card className="max-w-md w-full shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden animate-slide-up bg-white dark:bg-slate-900">
        {/* Card Header */}
        <div className="relative bg-gradient-to-r from-red-600 to-red-800 p-6 text-center">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 animate-bounce p-2">
              <Bell className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">{t.title}</h1>
          </div>
        </div>
        <CardContent className="p-8 text-center">
          <p className="mb-6 text-slate-600 dark:text-slate-300">{t.instructions}</p>
          {message && (
            <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold animate-fade-in">
              {message}
            </div>
          )}
          <div className="flex flex-col gap-4 items-center">
            <Button
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
              onClick={handleAccept}
              disabled={actionLoading}
            >
              <CheckCircle className="h-5 w-5" />
              {t.accept}
            </Button>
            <div className="flex gap-2 w-full">
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 h-12 px-4 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100"
                placeholder={t.newDate}
                disabled={actionLoading}
              />
              <Button
                className="h-12 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                onClick={handlePostpone}
                disabled={!date || actionLoading}
              >
                <CalendarPlus className="h-5 w-5" />
                {t.postpone}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
