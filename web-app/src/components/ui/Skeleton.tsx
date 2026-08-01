import React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps {
  width?: string | number
  height?: string | number
  isCircle?: boolean
  className?: string
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ width = "100%", height = "16px", isCircle = false, className }, ref) => {
    const widthClass = typeof width === "number" ? `${width}px` : width
    const heightClass = typeof height === "number" ? `${height}px` : height

    return (
      <div
        ref={ref}
        className={cn("skeleton-loading", isCircle && "rounded-full", !isCircle && "rounded-md", className)}
        style={{
          width: widthClass,
          height: heightClass,
        }}
      />
    )
  },
)

Skeleton.displayName = "Skeleton"

export { Skeleton }
