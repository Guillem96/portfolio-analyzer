import { Card } from "@tremor/react"
import { useBoundStore } from "@/store"
import { Skeleton } from "@/components/ui/Skeleton"

export default function BuysCount() {
  const [assets, assetsLoading] = useBoundStore((state) => [state.assets, state.assetsLoading])

  return (
    <Card decoration="top">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content"># Assets</p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {assetsLoading ? <Skeleton width={64} height={32} /> : assets.length}
        </p>
      </div>
    </Card>
  )
}
