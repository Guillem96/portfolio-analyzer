import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { Card } from "@tremor/react"
import { useMemo } from "react"

interface Props {
  currency: "$" | "€"
}

export default function TotalAssetValue({ currency }: Props) {
  const [investments, assets] = useBoundStore((state) => [state.investments, state.assets])

  const investmentAmount = useMemo(
    () =>
      investments
        .filter((inv) => inv.currency === currency)
        .map(({ amount }) => amount)
        .reduce((a, b) => a + b, 0),
    [investments, currency],
  )

  const assetAmount = useMemo(
    () =>
      assets
        .filter((asset) => asset.currency === currency)
        .map(({ value }) => value)
        .reduce((a, b) => a + b, 0),
    [assets, currency],
  )

  const rate = assetAmount / investmentAmount
  const changeType = rate > 1 ? "positive" : "negative"
  let rateToRender = rate
  if (changeType === "positive") {
    rateToRender = (1 - rateToRender) * 100
  } else {
    rateToRender = (1 - rateToRender) * 100
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
          Portfolio value in {currency}
        </p>
        <span
          className={`
            ${
              changeType === "positive"
                ? "bg-emerald-100 text-emerald-800 ring-emerald-600/10 dark:bg-emerald-400/10 dark:text-emerald-500 dark:ring-emerald-400/20"
                : "bg-red-100 text-red-800 ring-red-600/10 dark:bg-red-400/10 dark:text-red-500 dark:ring-red-400/20"
            } 
            inline-flex items-center rounded-tremor-small px-2 py-1 text-tremor-label font-medium ring-1 ring-inset`}
        >
          {changeType === "negative" ? "-" : ""}
          {rateToRender.toFixed(2)}%
        </span>
      </div>
      <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
        {currencyFormatter(assetAmount, currency)}
      </p>
    </Card>
  )
}

export const TotalAssetEUR = () => <TotalAssetValue currency="€" />
export const TotalAssetUSD = () => <TotalAssetValue currency="$" />
