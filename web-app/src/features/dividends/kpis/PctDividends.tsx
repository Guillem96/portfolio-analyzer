import { useBoundStore } from "@/store"
import { Card } from "@tremor/react"
import { useMemo } from "react"

const PctDividends = (withRespectBuys: boolean) => {
  const [assets] = useBoundStore((state) => [state.assets])

  const totalInvested = useMemo(() => assets.map(({ buyValue }) => buyValue).reduce((a, b) => a + b, 0), [assets])
  const totalAssetValue = useMemo(() => assets.map(({ value }) => value).reduce((a, b) => a + b, 0), [assets])

  const nextYearDividends = useMemo(
    () =>
      assets
        .map(({ ticker, units }) => (ticker.yearlyDividendValue || 0) * units)
        .reduce((a, b) => a + b, 0),
    [assets],
  )

  return (
    <Card decoration="top">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
        Dividend yield with respect to total {withRespectBuys ? "invested" : "asset value"}
      </p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {`${((nextYearDividends / (withRespectBuys ? totalInvested : totalAssetValue)) * 100).toFixed(2)}%`}
        </p>
      </div>
    </Card>
  )
}

export const PctDividendsOverBuys = () => PctDividends(true)
export const PctDividendsOverAssetValue = () => PctDividends(false)
