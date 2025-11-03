import { Card } from "@tremor/react"
import { useBoundStore } from "@/store"
import { useMemo } from "react"
import { currencyFormatter } from "@/services/utils"

const TotalCardAmount = ({ currency }: { currency: "€" | "$" }) => {
  const [buys, privateMode] = useBoundStore((state) => [state.buys, state.privateMode])
  const amount = useMemo(
    () =>
      buys
        .filter((inv) => inv.currency === currency)
        .filter(({ isDividendReinvestment }) => !isDividendReinvestment)
        .map(({ amount, taxes, fee }) => amount + fee + taxes)
        .reduce((a, b) => a + b, 0),
    [buys, currency],
  )
  return (
    <Card decoration="top">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
        Total Investment Amount {currency}
      </p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {currencyFormatter(amount, currency, privateMode)}
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
