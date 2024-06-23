import { Card } from "@tremor/react"
import AssetDonut from "@/components/AssetDonut"

interface SectorDonutProps {
  className?: string
}

export default function SectorDonut({ className = "" }: SectorDonutProps) {
  return (
    <Card className={className}>
      <h1 className="mb-4 max-w-2xl text-3xl tracking-tight text-slate-900 dark:text-neutral-300">
        Total asset value by sector
      </h1>
      <div className="max-w-lg">
        <AssetDonut by="sector" />
      </div>
    </Card>
  )
}
