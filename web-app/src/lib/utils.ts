import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** @deprecated Use cn() instead — kept for legacy chart components */
export const cx = cn

export const focusInput = [
  "focus:ring-2",
  "focus:ring-ring/30",
  "focus:border-ring",
]

export const focusRing = [
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  "outline-ring",
]

export const hasErrorInput = [
  "ring-2",
  "border-destructive",
  "ring-destructive/20",
]
