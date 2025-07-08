import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-slate-200 dark:text-slate-700 mb-4">404</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Page non trouvée</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild className="bg-red-900 hover:bg-red-800 text-white dark:bg-red-800 dark:hover:bg-red-700">
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Tableau de bord
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 bg-transparent"
          >
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
