import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { Callout, Card } from "@tremor/react"

export default function UpcomingDividends() {
  const [tickerToInfo, assets, mainCurrency, privateMode] = useBoundStore((state) => [
    state.tickerToInfo,
    state.assets,
    state.mainCurrency,
    state.privateMode,
  ])
  const tickerToAssetValue = Object.fromEntries(assets.map(({ ticker, value }) => [ticker, value]))

  const nextExDividends = Object.values(tickerToInfo)
    .map(({ ticker, exDividendDate, nextDividendYield }) => ({
      ticker,
      exDividendDate,
      nextDividendYield,
      expectedAmount: tickerToAssetValue[ticker] * nextDividendYield,
    }))
    .sort((a, b) => a.exDividendDate.getTime() - b.exDividendDate.getTime())

  return (
    <Card>
      <h1 className="mb-4 max-w-2xl text-3xl tracking-tight text-slate-900 dark:text-neutral-300">
        Upcoming Ex Dividends
      </h1>
      <div className="flex flex-col gap-2 overflow-scroll md:grid md:grid-cols-2">
        {nextExDividends.map(({ ticker, exDividendDate, nextDividendYield, expectedAmount }, index) => (
          <Callout
            key={`exdiv-${ticker}-${index}`}
            title={`${ticker} (${(nextDividendYield * 100).toFixed(2)}%)`}
            color={exDividendDate >= new Date() ? "teal" : "red"}
          >
            {exDividendDate.toLocaleDateString("es")} - Approx. amount:{" "}
            {currencyFormatter(expectedAmount, mainCurrency, privateMode)}
          </Callout>
        ))}
      </div>
    </Card>
  )
}
