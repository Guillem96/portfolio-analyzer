import { useMemo } from "react"
import { BarList, Card, Icon } from "@tremor/react"
import { Skeleton } from "@/components/ui/Skeleton"
import { useBoundStore } from "@/store"
import { currencyFormatter } from "@/services/utils"
import { RiLineChartLine, RiTimeLine } from "@remixicon/react"

interface Props {
  className?: string
}

export default function DividendsPerShare({ className = "" }: Props) {
  const [dividends, dividendsLoading, assets, assetsLoading, mainCurrency, privateMode] = useBoundStore((state) => [
    state.dividendsPreferredCurrency,
    state.dividendsPreferredCurrencyLoading,
    state.assets,
    state.assetsLoading,
    state.mainCurrency,
    state.privateMode,
  ])

  const data = useMemo(() => {
    if (dividends.length === 0 || assets.length === 0) return []

    const assetByTicker = Object.fromEntries(
      assets.filter((asset) => asset.ticker?.ticker && asset.units > 0).map((asset) => [asset.ticker.ticker, asset]),
    )

    const grouped = Object.groupBy(dividends, (dividend) => dividend.company)

    return Object.entries(grouped)
      .map(([company, companyDividends]) => {
        const asset = assetByTicker[company]
        if (!asset) return null

        const totalGross = companyDividends.reduce((sum, dividend) => sum + dividend.amount, 0)
        const perShare = totalGross / asset.units
        const avgPrice = asset.avgPriceWithoutReinvest
        const pct = avgPrice > 0 ? (perShare / avgPrice) * 100 : 0
        const name = companyDividends[0].tickerData?.name || company

        return {
          name: `${name} (${company}) - ${currencyFormatter(perShare, mainCurrency, privateMode)}/share`,
          value: pct,
          icon: () => <Icon className="mr-2" icon={RiLineChartLine} />,
        }
      })
      .filter(
        (entry): entry is { name: string; value: number; icon: () => JSX.Element } => entry !== null && entry.value > 0,
      )
      .sort((a, b) => b.value - a.value)
  }, [dividends, assets])

  const loading = dividendsLoading || assetsLoading

  if (loading)
    return (
      <Card className={className}>
        <h3 className="text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Dividends per share
        </h3>
        <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          <span>Ticker</span>
          <span>Per share</span>
        </p>
        <div className="flex w-full flex-col gap-y-2 pt-1">
          <Skeleton height={28} width="90%" />
          <Skeleton height={28} width="80%" />
          <Skeleton height={28} width="70%" />
          <Skeleton height={28} width="60%" />
          <Skeleton height={28} width="50%" />
        </div>
      </Card>
    )

  if (data.length === 0)
    return (
      <Card className={className}>
        <h3 className="text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Dividends per share
        </h3>
        <div className="flex h-48 flex-row items-center justify-center">
          <Icon icon={RiTimeLine} />
          <p className="text-tremor-content dark:text-dark-tremor-content">No dividends registered</p>
        </div>
      </Card>
    )

  return (
    <Card className={className}>
      <h3 className="text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
        Dividends per share
      </h3>
      <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        <span>Ticker</span>
        <span>% wrt avg price</span>
      </p>
      <BarList className="mt-2" data={data} valueFormatter={(value: number) => `${value.toFixed(2)}%`} />
    </Card>
  )
}
