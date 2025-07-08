import { LoadingSpinner } from "@/components/loading-spinner"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-slate-600 dark:text-slate-300">Chargement...</p>
      </div>
    </div>
  )
}
