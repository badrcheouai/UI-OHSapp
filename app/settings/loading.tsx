import { LoadingSpinner, LoadingSkeleton } from "@/components/loading-spinner"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <LoadingSkeleton className="h-8 w-32 mb-2" />
          <LoadingSkeleton className="h-4 w-64" />
        </div>

        <div className="grid gap-6">
          {/* Settings Cards Loading */}
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="ohse-card">
              <CardHeader>
                <LoadingSkeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <LoadingSkeleton className="h-10 w-full" />
                <LoadingSkeleton className="h-10 w-full" />
                <LoadingSkeleton className="h-10 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    </div>
  )
}
