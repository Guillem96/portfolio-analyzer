import { Button, Card, Icon } from "@tremor/react"
import { useBoundStore } from "@/store"
import { useEffect, useMemo, useState } from "react"
import { RiTimeLine } from "@remixicon/react"
import { format, isAfter, startOfYear, subDays, subMonths, subYears } from "date-fns"
import { currencyFormatter } from "@/services/utils"
import { AreaChart } from "@/components/ui/AreaChart"
import { PortfolioHistoricEntry } from "@/types"

export default function AssetHistoricValue() {
  const [fetchHistoric, assetsHistoric, assetsHistoricLoading, assets, privateMode, mainCurrency] = useBoundStore(
    (state) => [
      state.fetchHistoric,
      state.assetsHistoric,
      state.assetsHistoricLoading,
      state.assets,
      state.privateMode,
      state.mainCurrency,
    ],
  )
  const [showAbsolute, setShowAbsolute] = useState(false)

  const [shownAssetHistoric, setShownAssetHistoric] = useState<PortfolioHistoricEntry[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<"1W" | "1M" | "1Y" | "YTD" | "MAX">("MAX")
  const [rateRelativeToFirstEntry, setRateRelativeToFirstEntry] = useState<number>(0)

  const investmentAmount = useMemo(
    () => assets.map(({ buyValue }) => buyValue).reduce((a, b) => a + b, 0),
    [assets, mainCurrency],
  )

  const assetAmount = useMemo(() => assets.map(({ value }) => value).reduce((a, b) => a + b, 0), [assets, mainCurrency])
  const absolute = useMemo(() => {
    if (shownAssetHistoric.length === 0) {
      return 0
    }
    return shownAssetHistoric[shownAssetHistoric.length - 1].value - shownAssetHistoric[0].value
  }, [shownAssetHistoric])
  const changeType = useMemo(() => (rateRelativeToFirstEntry > 0 ? "positive" : "negative"), [rateRelativeToFirstEntry])

  useEffect(() => {
    fetchHistoric()
  }, [])

  useEffect(() => {
    if (shownAssetHistoric.length === 0) {
      return
    }
    const firstEntry = shownAssetHistoric[0]
    const lastEntry = shownAssetHistoric[shownAssetHistoric.length - 1]
    setRateRelativeToFirstEntry(((lastEntry.value - firstEntry.value) / firstEntry.value) * 100)
  }, [shownAssetHistoric])

  useEffect(() => {
    const today = new Date()
    let assetHistoricToShow = [...assetsHistoric]
    if (selectedPeriod === "1W") {
      const lastWeek = subDays(today, 7)
      assetHistoricToShow = assetHistoricToShow.filter((entry) => {
        return isAfter(entry.date, lastWeek)
      })
    } else if (selectedPeriod === "1M") {
      const lastMonth = subMonths(today, 1)
      assetHistoricToShow = assetHistoricToShow.filter((entry) => {
        return isAfter(entry.date, lastMonth)
      })
    } else if (selectedPeriod === "1Y") {
      const lastYear = subYears(today, 1)
      assetHistoricToShow = assetHistoricToShow.filter((entry) => {
        return isAfter(entry.date, lastYear)
      })
    } else if (selectedPeriod === "YTD") {
      const soy = startOfYear(today)
      assetHistoricToShow = assetHistoricToShow.filter((entry) => {
        return isAfter(entry.date, soy)
      })
    } else if (selectedPeriod === "MAX") {
      assetHistoricToShow = assetHistoricToShow.filter((entry) => {
        return isAfter(entry.date, new Date("1900-01-01"))
      })
    }
    assetHistoricToShow = assetHistoricToShow.concat({
      date: new Date(),
      value: assetAmount,
      buyValue: investmentAmount,
      currency: mainCurrency,
      rate: 0,
    })

    // adjust rate relative to the first entry
    const firstEntry = assetHistoricToShow[0]
    const rateRelativeToFirstEntry = assetHistoricToShow.map((entry) => {
      return {
        ...entry,
        rate: ((entry.value - firstEntry.value) / firstEntry.value) * 100,
      }
    })

    setShownAssetHistoric(rateRelativeToFirstEntry)
  }, [assetsHistoric, selectedPeriod])

  const chartData = useMemo(() => {
    return shownAssetHistoric.map((entry) => {
      return {
        date: format(entry.date, "yyyy-MM-dd"),
        Value: entry.value,
        Rate: entry.rate,
      }
    })
  }, [shownAssetHistoric])

  return (
    <Card>
      <div className="flex flex-col items-start gap-4">
        <div className="flex flex-col">
          <h1 className="mb-2 max-w-2xl text-4xl tracking-tight text-slate-900 dark:text-neutral-300">
            {currencyFormatter(assetAmount, mainCurrency, privateMode)}
          </h1>
          <div>
            <div
              onClick={() => setShowAbsolute(!showAbsolute)}
              className={` ${
                changeType === "positive"
                  ? "bg-emerald-100 text-emerald-800 ring-emerald-600/10 dark:bg-emerald-400/10 dark:text-emerald-500 dark:ring-emerald-400/20"
                  : "bg-red-100 text-red-800 ring-red-600/10 dark:bg-red-400/10 dark:text-red-500 dark:ring-red-400/20"
              } inline-flex items-center rounded-tremor-small px-2 py-1 text-center text-tremor-label font-medium ring-1 ring-inset`}
            >
              {showAbsolute
                ? currencyFormatter(absolute, mainCurrency, privateMode)
                : `${rateRelativeToFirstEntry.toFixed(2)} %`}
            </div>
          </div>
        </div>
        <ul className="m-auto flex w-full max-w-md flex-row items-center justify-between gap-x-2">
          {["1W", "1M", "1Y", "YTD", "MAX"].map((period) => (
            <li key={period}>
              <Button
                variant="light"
                size="xs"
                onClick={() => setSelectedPeriod(period as "1W" | "1M" | "1Y" | "YTD" | "MAX")}
                className={`rounded-lg p-1 px-4 ${selectedPeriod === period ? "font-extrabold" : "font-light"}`}
              >
                {period}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {assetsHistoricLoading ? (
        <div className="flex items-center justify-center">
          <Icon icon={RiTimeLine} />
          <p className="text-tremor-content dark:text-dark-tremor-content">Loading...</p>
        </div>
      ) : null}
      <div className="mt-2 flex items-baseline space-x-2.5">
        <AreaChart
          className="h-80"
          colors={[changeType === "positive" ? "emerald" : "red"]}
          data={chartData}
          index="date"
          categories={["Rate"]}
          valueFormatter={(number: number) =>
            `${number.toFixed(2)}% (${currencyFormatter((number / 100) * investmentAmount + investmentAmount, mainCurrency, privateMode)})`
          }
        />
      </div>
    </Card>
  )
}
