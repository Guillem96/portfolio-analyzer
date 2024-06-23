import { EXCHANGE_RATES } from "@/constants"
import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { Card } from "@tremor/react"
import { useMemo, useState } from "react"

export default function TotalAssetValue() {
  const [buys, assets, privateMode, mainCurrency] = useBoundStore((state) => [
    state.buys,
    state.assets,
    state.privateMode,
    state.mainCurrency,
  ])
  const [showAbsolute, setShowAbsolute] = useState(false)

  const investmentAmount = useMemo(
    () =>
      buys
        .filter((inv) => !inv.isDividendReinvestment)
        .map(({ amount, currency }) => amount * EXCHANGE_RATES[currency][mainCurrency])
        .reduce((a, b) => a + b, 0),
    [buys, mainCurrency],
  )

  const assetAmount = useMemo(() => assets.map(({ value }) => value).reduce((a, b) => a + b, 0), [assets, mainCurrency])

  const rate = (assetAmount / investmentAmount - 1) * 100
  const absolute = assetAmount - investmentAmount
  const changeType = rate > 0 ? "positive" : "negative"

  return (
    <Card onClick={() => setShowAbsolute(!showAbsolute)}>
      <div className="flex items-center justify-between">
        <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
          Portfolio value in {mainCurrency}
        </p>
        <span
          className={` ${
            changeType === "positive"
              ? "bg-emerald-100 text-emerald-800 ring-emerald-600/10 dark:bg-emerald-400/10 dark:text-emerald-500 dark:ring-emerald-400/20"
              : "bg-red-100 text-red-800 ring-red-600/10 dark:bg-red-400/10 dark:text-red-500 dark:ring-red-400/20"
          } inline-flex items-center rounded-tremor-small px-2 py-1 text-tremor-label font-medium ring-1 ring-inset`}
        >
          {showAbsolute ? currencyFormatter(absolute, mainCurrency, privateMode) : `${rate.toFixed(2)} %`}
        </span>
      </div>
      <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
        {currencyFormatter(assetAmount, mainCurrency, privateMode)}
      </p>
    </Card>
  )
}
