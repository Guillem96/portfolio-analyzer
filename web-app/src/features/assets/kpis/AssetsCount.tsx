import { KpiCard } from "@/components/KpiCard"
import { useBoundStore } from "@/store"
import { Skeleton } from "@/components/ui/Skeleton"

export default function AssetsCount() {
  const [assets, assetsLoading] = useBoundStore((state) => [state.assets, state.assetsLoading])

  return (
    <KpiCard label="# Assets">
      {assetsLoading ? <Skeleton width={64} height={32} /> : assets.length}
    </KpiCard>
  )
}
