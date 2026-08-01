import { KpiCard } from "@/components/KpiCard"
import { useBoundStore } from "@/store"
import { useMemo } from "react"
import { currencyFormatter } from "@/services/utils"
import { Skeleton } from "@/components/ui/Skeleton"

export const InvestmentTotalAmount = () => {
  const [assets, assetsLoading, privateMode, mainCurrency] = useBoundStore((state) => [
    state.assets,
    state.assetsLoading,
    state.privateMode,
    state.mainCurrency,
  ])
  const amount = useMemo(() => assets.map(({ buyValue }) => buyValue).reduce((a, b) => a + b, 0), [assets])

  return (
    <KpiCard label={`Total Investment Amount ${mainCurrency}`} className="flex flex-col justify-between">
      {assetsLoading ? <Skeleton height={32} width={64} /> : currencyFormatter(amount, mainCurrency, privateMode)}
    </KpiCard>
  )
}
