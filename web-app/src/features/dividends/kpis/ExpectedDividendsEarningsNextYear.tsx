import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { Card } from "@tremor/react"
import { useMemo } from "react"

export default function ExpectedDividendsEarningsNextYear() {
  const [assets, mainCurrency, privateMode] = useBoundStore((state) => [
    state.assets,
    state.mainCurrency,
    state.privateMode,
  ])

  const nextYearDividends = useMemo(
    () => assets.map(({ ticker, units }) => (ticker.yearlyDividendValue || 0) * units).reduce((a, b) => a + b, 0),
    [assets],
  )

  return (
    <Card decoration="top">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
        Estimation earnings next year ({new Date().getFullYear() + 1})
      </p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {currencyFormatter(nextYearDividends, mainCurrency, privateMode)}
        </p>
      </div>
    </Card>
  )
}
