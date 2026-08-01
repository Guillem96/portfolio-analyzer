import { KpiCard } from "@/components/KpiCard"
import { useBoundStore } from "@/store"
import { Skeleton } from "@/components/ui/Skeleton"

export default function BuysCount() {
  const [buys, loading] = useBoundStore((state) => [state.buys, state.buysLoading])

  return (
    <KpiCard label="# Buys" className="flex flex-col justify-between">
      {loading ? <Skeleton width={64} height={32} /> : buys.length}
    </KpiCard>
  )
}
