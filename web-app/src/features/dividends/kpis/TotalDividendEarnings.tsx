import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { Card } from "@tremor/react"
import { useMemo } from "react"

export default function TotalDividendEarnings() {
  const [dividends, mainCurrency, privateMode] = useBoundStore((state) => [state.dividendsPreferredCurrency, state.mainCurrency, state.privateMode])

  const dividendsEarnings = useMemo(
    () =>
      dividends
        .map(
          ({ amount, doubleTaxationDestination, doubleTaxationOrigin }) =>
            amount * (1 - doubleTaxationOrigin / 100) * (1 - doubleTaxationDestination / 100),
        )
        .reduce((a, b) => a + b, 0),
    [dividends],
  )

  return (
    <Card decoration="top">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
        Net Dividend Earnings
      </p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {currencyFormatter(dividendsEarnings, mainCurrency, privateMode)}
        </p>
      </div>
    </Card>
  )
}

