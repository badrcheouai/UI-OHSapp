import { LoadingSpinner, LoadingSkeleton } from "@/components/loading-spinner"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <LoadingSkeleton className="h-8 w-64 mb-2" />
          <LoadingSkeleton className="h-4 w-96" />
        </div>

        {/* Key Metrics Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="ohse-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <LoadingSkeleton className="h-4 w-24" />
                <LoadingSkeleton className="h-10 w-10 rounded-xl" />
              </CardHeader>
              <CardContent>
                <LoadingSkeleton className="h-8 w-20 mb-2" />
                <LoadingSkeleton className="h-2 w-full mb-2" />
                <LoadingSkeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Loading */}
        <Card className="ohse-card mb-8">
          <CardHeader>
            <LoadingSkeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <LoadingSkeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Grid Loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="ohse-card">
              <CardHeader className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="mt-4 ohse-text-secondary">Loading dashboard data...</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
