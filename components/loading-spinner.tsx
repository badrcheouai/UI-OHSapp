"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  }

  return (
    <div
      className={cn(
        "border-slate-300 border-t-red-600 dark:border-slate-600 dark:border-t-red-400 rounded-full animate-spin-smooth",
        sizeClasses[size],
        className,
      )}
    />
  )
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("loading-dots", className)}>
      <div />
      <div />
      <div />
    </div>
  )
}

export function LoadingSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("loading-skeleton", className)} {...props} />
}
