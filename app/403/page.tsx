"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function getDashboardPath(user: any) {
  if (!user || !user.roles) return "/";
  if (user.roles.includes("ADMIN")) return "/dashboard";
  if (user.roles.includes("RESP_RH")) return "/dashboard-rh";
  if (user.roles.includes("INFIRMIER_ST")) return "/dashboard-infirmier";
  if (user.roles.includes("MEDECIN_TRAVAIL")) return "/dashboard-medecin";
  if (user.roles.includes("RESP_HSE")) return "/dashboard-hse";
  if (user.roles.includes("SALARIE")) return "/dashboard-salarie";
  return "/";
}

export default function ForbiddenPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleDashboard = () => {
    router.replace(getDashboardPath(user));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-red-950 p-4">
      <div className="text-5xl font-bold text-red-700 mb-4">403</div>
      <div className="text-xl font-semibold mb-2">Accès refusé</div>
      <div className="mb-6 text-slate-600 dark:text-slate-300 text-center max-w-md">
        Vous n'avez pas la permission d'accéder à cette page.<br />
        Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur.
      </div>
      <div className="flex gap-4">
        {user && user.roles && user.roles.length > 0 && (
          <button
            onClick={handleDashboard}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold shadow hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200"
          >
            Retour au tableau de bord
          </button>
        )}
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold shadow hover:bg-red-700 transition-all duration-200"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
