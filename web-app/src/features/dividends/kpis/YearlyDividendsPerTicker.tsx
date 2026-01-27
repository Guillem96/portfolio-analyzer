import { Skeleton } from "@/components/ui/Skeleton"
import { useDividedsStats } from "@/hooks/dividends"
import { currencyFormatter, getWebsiteLogo } from "@/services/utils"
import { useBoundStore } from "@/store"
import { CurrencyType } from "@/types"
import { Button, Card, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tremor/react"
import { DonutChart } from "@/components/ui/DonutChart"
import { useMemo, useState } from "react"

const currFmt = (currency: CurrencyType, privateMode: boolean) => (num: number) =>
  currencyFormatter(num, currency, privateMode)

export default function YearlyDividendsPerTicker() {
  const { loading, yearlyDividendsPerTicker } = useDividedsStats()
  const [mainCurrency, privateMode] = useBoundStore((s) => [s.mainCurrency, s.privateMode])
  const [showMore, setShowMore] = useState(false)

  const tableData = useMemo(() => {
    const elementsToShow = showMore ? yearlyDividendsPerTicker.length : 5
    return yearlyDividendsPerTicker.slice(0, elementsToShow)
  }, [yearlyDividendsPerTicker, showMore])

  return (
    <Card className="flex flex-col">
      <h1 className="mb-4 max-w-2xl text-4xl tracking-tight text-slate-900 dark:text-neutral-300">Dividends</h1>
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:flex-row md:gap-8">
        {loading ? (
          <Skeleton isCircle width={300} height={300} />
        ) : (
          <DonutChart
            className="h-64 w-64 md:h-96 md:w-96"
            data={yearlyDividendsPerTicker}
            value="dividend"
            category="tickerName"
            showLabel={true}
            valueFormatter={currFmt(mainCurrency, privateMode)}
            showTooltip={true}
          />
        )}

        {loading ? (
          <Skeleton width={700} height={400} />
        ) : (
          <div className="flex flex-col gap-4">
            <Table className="max-h-96 w-full">
              <TableHead>
                <TableRow>
                  <TableHeaderCell></TableHeaderCell>
                  <TableHeaderCell>%</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map(({ tickerName, ticker, pct, dividend }) => {
                  return (
                    <TableRow key={`dividend-pct-${tickerName}`}>
                      <TableCell>
                        <div className="flex flex-row items-center gap-x-2 align-middle">
                          <img
                            className="d-block h-8 w-8 rounded-full bg-transparent bg-white"
                            src={getWebsiteLogo(ticker?.website ?? null)}
                            alt={`${ticker.ticker} company logo`}
                          />
                          <p className="hidden md:block">{ticker.name}</p>
                          <p className="block md:hidden">{ticker.ticker}</p>
                        </div>
                      </TableCell>
                      <TableCell>{(pct * 100).toFixed(2)}%</TableCell>
                      <TableCell>{currencyFormatter(dividend, mainCurrency, privateMode)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <Button size="xs" variant="light" onClick={() => setShowMore(!showMore)}>
              {showMore ? "Show Less" : "Show More"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
