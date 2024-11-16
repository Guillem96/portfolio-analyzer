import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { Country } from "@/types.d"
import { Button, Callout, Card } from "@tremor/react"
import { format } from "date-fns/format"

const TAX_RATE: Record<Country, number> = {
  [Country.ES]: 19,
  [Country.FR]: 25,
  [Country.US]: 15,
  [Country.GR]: 26.38,
  [Country.UK]: 0,
}

export default function UpcomingDividends() {
  const [assets, mainCurrency, privateMode, selectDividend] = useBoundStore((state) => [
    state.assets,
    state.mainCurrency,
    state.privateMode,
    state.selectDividend,
  ])

  const nextExDividends = assets
    .map(({ ticker, country, units }) => ({
      ticker: ticker.ticker,
      exDividendDate: ticker.exDividendDate,
      nextDividendValue: ticker.nextDividendValue || 0,
      country,
      units,
      expectedAmount: (ticker.nextDividendYield || 0) * units,
    }))
    .sort((a, b) => a.exDividendDate.getTime() - b.exDividendDate.getTime())

  return (
    <Card>
      <h1 className="mb-4 max-w-2xl text-3xl tracking-tight text-slate-900 dark:text-neutral-300">
        Upcoming Ex Dividends
      </h1>
      <div className="flex flex-col gap-2 overflow-scroll md:grid md:grid-cols-4">
        {nextExDividends.map(({ ticker, exDividendDate, units, nextDividendValue, expectedAmount, country }, index) => (
          <Callout
            key={`exdiv-${ticker}-${index}`}
            title={`${exDividendDate.toLocaleDateString("es")} - ${ticker} (${currencyFormatter(nextDividendValue, mainCurrency, privateMode)})`}
            color={exDividendDate >= new Date() ? "teal" : "red"}
          >
            Approx. amount:{" "}
            <div className="flex justify-between">
              <span>
                {`${units} shares x ${currencyFormatter(nextDividendValue, mainCurrency, privateMode)} = `}
                <b>{currencyFormatter(expectedAmount, mainCurrency, privateMode)}</b>
              </span>
              <Button
                variant="light"
                size="sm"
                color={exDividendDate >= new Date() ? "teal" : "red"}
                onClick={() =>
                  selectDividend({
                    company: ticker,
                    amount: expectedAmount,
                    date: format(exDividendDate, "yyyy-MM-dd"),
                    country,
                    doubleTaxationOrigin: TAX_RATE[country],
                    doubleTaxationDestination: 0,
                    currency: mainCurrency,
                  })
                }
              >
                Add
              </Button>
            </div>
          </Callout>
        ))}
      </div>
    </Card>
  )
}
