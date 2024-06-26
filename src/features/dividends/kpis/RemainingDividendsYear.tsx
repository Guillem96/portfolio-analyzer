import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { Card } from "@tremor/react"
import { useMemo } from "react"

export default function RemainingDividendsYear() {
  const [tickerToInfo, assets, mainCurrency, privateMode] = useBoundStore((state) => [
    state.tickerToInfo,
    state.assets,
    state.mainCurrency,
    state.privateMode,
  ])

  const tickerToAssetValue = useMemo(
    () => Object.fromEntries(assets.map(({ ticker, value }) => [ticker, value])),
    [assets],
  )

  const leftDividendsYear = useMemo(
    () =>
      Object.values(tickerToInfo)
        .map(({ ticker, exDividendDate, nextDividendYield }) => ({
          exDividendDate,
          expectedAmount: tickerToAssetValue[ticker] * nextDividendYield,
        }))
        .filter(({ exDividendDate }) => exDividendDate >= new Date())
        .map(({ expectedAmount }) => expectedAmount)
        .reduce((a, b) => a + b, 0),
    [tickerToAssetValue],
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
