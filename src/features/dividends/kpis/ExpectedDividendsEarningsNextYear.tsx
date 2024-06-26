import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { Card } from "@tremor/react"
import { useMemo } from "react"

export default function ExpectedDividendsEarningsNextYear() {
  const [tickerToInfo, assets, mainCurrency, privateMode] = useBoundStore((state) => [
    state.tickerToInfo,
    state.assets,
    state.mainCurrency,
    state.privateMode,
  ])

  const totalInvested = useMemo(() => assets.map(({ value }) => value).reduce((a, b) => a + b, 0), [assets])

  const tickerToAssetValue = useMemo(
    () => Object.fromEntries(assets.map(({ ticker, value }) => [ticker, value])),
    [assets],
  )

  const nextYearDividends = useMemo(
    () =>
      Object.values(tickerToInfo)
        .map(({ ticker, yearlyDividendYield }) => tickerToAssetValue[ticker] * (yearlyDividendYield || 0))
        .reduce((a, b) => a + b, 0),
    [tickerToAssetValue],
  )

  return (
    <Card decoration="top">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
        Estimation earnings next year ({new Date().getFullYear() + 1})
      </p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {`${currencyFormatter(nextYearDividends, mainCurrency, privateMode)} (${((nextYearDividends / totalInvested) * 100).toFixed(2)}%)`}
        </p>
      </div>
    </Card>
  )
}
