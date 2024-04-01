import { Card } from "@tremor/react"
import { useBoundStore } from "@/store"
import { useMemo } from "react"
import { currencyFormatter } from "@/services/utils"

const TotalCardAmount = ({ currency }: { currency: "€" | "$" }) => {
  const investments = useBoundStore((state) => state.investments)
  const amount = useMemo(
    () =>
      investments
        .filter((inv) => inv.currency === currency)
        .map(({ amount }) => amount)
        .reduce((a, b) => a + b, 0),
    [investments, currency],
  )
  return (
    <Card decoration="top">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
        Total Investment Amount {currency}
      </p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {currencyFormatter(amount, currency)}
        </p>
      </div>
    </Card>
  )
}

export const InvestmentEurTotalAmount = () => {
  return <TotalCardAmount currency="€" />
}

export const InvestmentUsdTotalAmount = () => {
  return <TotalCardAmount currency="$" />
}
