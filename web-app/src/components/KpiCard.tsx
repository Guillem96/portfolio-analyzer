import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  label: string
  children: React.ReactNode
  accent?: "default" | "primary" | "violet" | "amber"
  className?: string
}

const accentClasses = {
  default: "border-t-border",
  primary: "border-t-primary",
  violet: "border-t-violet-500",
  amber: "border-t-amber-500",
}

export function KpiCard({ label, children, accent = "primary", className }: KpiCardProps) {
  return (
    <Card className={cn("border-t-4", accentClasses[accent], className)}>
      <CardHeader className="gap-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">{children}</CardTitle>
      </CardHeader>
    </Card>
  )
}
