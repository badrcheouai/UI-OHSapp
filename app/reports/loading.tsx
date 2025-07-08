import { LoadingSpinner, LoadingSkeleton } from "@/components/loading-spinner"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <LoadingSkeleton className="h-8 w-64 mb-2" />
          <LoadingSkeleton className="h-4 w-96" />
        </div>

        {/* Quick Stats Loading */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="ohse-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <LoadingSkeleton className="h-4 w-24" />
                <LoadingSkeleton className="h-5 w-5 rounded" />
              </CardHeader>
              <CardContent>
                <LoadingSkeleton className="h-8 w-16 mb-2" />
                <LoadingSkeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reports Loading */}
        <Card className="ohse-card">
          <CardHeader className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 ohse-text-secondary">Loading reports...</p>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
