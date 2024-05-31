import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { Card } from "@tremor/react"
import { useMemo } from "react"

interface Props {
  currency: "$" | "€"
}

export default function TotalDividendEarnings({ currency }: Props) {
  const [dividends] = useBoundStore((state) => [state.dividends])

  const dividendsEarnings = useMemo(
    () =>
      dividends
        .filter((inv) => inv.currency === currency)
        .map(({ amount }) => amount)
        .reduce((a, b) => a + b, 0),
    [dividends],
  )

  return (
    <Card decoration="top">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
        Dividend Earnings {currency}
      </p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {currencyFormatter(dividendsEarnings, currency)}
        </p>
      </div>
    </Card>
  )
}

export const TotalDividendEarningsUSD = () => <TotalDividendEarnings currency="$" />
export const TotalDividendEarningsEUR = () => <TotalDividendEarnings currency="€" />
