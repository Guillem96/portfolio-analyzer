import { Card } from "@tremor/react"
import { useBoundStore } from "@/store"

export default function BuysCount() {
  const assets = useBoundStore((state) => state.assets)
  return (
    <Card decoration="top">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content"># Assets</p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {assets.length}
        </p>
      </div>
    </Card>
  )
}
