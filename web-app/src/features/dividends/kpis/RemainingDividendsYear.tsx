import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { Card } from "@tremor/react"
import { useMemo } from "react"

export default function RemainingDividendsYear() {
  const [assets, mainCurrency, privateMode] = useBoundStore((state) => [
    state.assets,
    state.mainCurrency,
    state.privateMode,
  ])

  const leftDividendsYear = useMemo(
    () =>
      assets
        .map(({ ticker, units }) => ({
          exDividendDate: ticker.exDividendDate,
          expectedAmount: (ticker.nextDividendValue || 0) * units,
        }))
        .filter(
          ({ exDividendDate }) =>
            exDividendDate >= new Date() && exDividendDate.getFullYear() === new Date().getFullYear(),
        )
        .map(({ expectedAmount }) => expectedAmount)
        .reduce((a, b) => a + b, 0),
    [assets],
  )

  return (
    <Card decoration="top">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
        Expected earnings this year
      </p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {currencyFormatter(leftDividendsYear, mainCurrency, privateMode)}
        </p>
      </div>
    </Card>
  )
}
