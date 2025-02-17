import { Card, Icon, Select, SelectItem } from "@tremor/react"
import { useBoundStore } from "@/store"
import { useEffect, useMemo, useState } from "react"
import { RiTimeLine } from "@remixicon/react"
import { format, isFirstDayOfMonth } from "date-fns"
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
  const [aggregation, setAggregation] = useState<"daily" | "monthly">("daily")
  const [shownAssetHistoric, setShownAssetHistoric] = useState<PortfolioHistoricEntry[]>([])

  const investmentAmount = useMemo(
    () => assets.map(({ buyValue }) => buyValue).reduce((a, b) => a + b, 0),
    [assets, mainCurrency],
  )

  const assetAmount = useMemo(() => assets.map(({ value }) => value).reduce((a, b) => a + b, 0), [assets, mainCurrency])
  const rate = (assetAmount / investmentAmount - 1) * 100
  const absolute = assetAmount - investmentAmount
  const changeType = rate > 0 ? "positive" : "negative"

  useEffect(() => {
    fetchHistoric()
  }, [])

  useEffect(() => {
    if (aggregation === "daily") {
      setShownAssetHistoric(
        assetsHistoric.concat({
          date: new Date(),
          value: assetAmount,
          buyValue: investmentAmount,
          currency: mainCurrency,
          rate,
        }),
      )
    } else {
      console.log(
        assetsHistoric.filter((entry) => {
          return isFirstDayOfMonth(entry.date)
        }),
      )
      setShownAssetHistoric(
        assetsHistoric
          .filter((entry) => {
            return isFirstDayOfMonth(entry.date)
          })
          .concat({ date: new Date(), value: assetAmount, buyValue: investmentAmount, currency: mainCurrency, rate }),
      )
    }
  }, [assetsHistoric, aggregation])

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
      <div className="flex flex-row items-center justify-between">
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
              {showAbsolute ? currencyFormatter(absolute, mainCurrency, privateMode) : `${rate.toFixed(2)} %`}
            </div>
          </div>
        </div>
        <aside className="flex flex-col gap-y-2">
          <label
            htmlFor="aggregation"
            className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
          >
            Time Aggregation
          </label>
          <Select
            disabled={assetsHistoricLoading}
            onChange={(event) => setAggregation(event as unknown as "daily" | "monthly")}
            name="aggregation"
            defaultValue="daily"
            value={aggregation}
          >
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </Select>
        </aside>
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
