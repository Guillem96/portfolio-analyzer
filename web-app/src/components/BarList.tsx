import { cn } from "@/lib/utils"

export interface BarListItem {
  name: string
  value: number
  icon?: React.ReactNode
}

interface BarListProps {
  data: BarListItem[]
  valueFormatter?: (value: number) => string
  className?: string
}

export function BarList({
  data,
  valueFormatter = (value) => `${(value * 100).toFixed(0)}%`,
  className,
}: BarListProps) {
  const max = Math.max(...data.map((item) => item.value), 0.001)

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          {item.icon}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate">{item.name}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{valueFormatter(item.value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
