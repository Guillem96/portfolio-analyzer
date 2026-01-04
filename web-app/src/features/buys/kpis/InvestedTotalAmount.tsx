import { Card } from "@tremor/react"
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
    <Card decoration="top" className="flex flex-col justify-between">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
        Total Investment Amount {mainCurrency}
      </p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {assetsLoading ? <Skeleton height={32} width={64} /> : currencyFormatter(amount, mainCurrency, privateMode)}
        </p>
      </div>
    </Card>
  )
}
