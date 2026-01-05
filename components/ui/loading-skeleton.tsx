import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  count?: number
  className?: string
}

export function LoadingSkeleton({ count = 1, className }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("h-12 bg-muted animate-shimmer rounded-lg", className)} />
      ))}
    </div>
  )
}
