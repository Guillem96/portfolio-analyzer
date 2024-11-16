import { useBoundStore } from "@/store"
import { RiLineChartLine, RiTimeLine } from "@remixicon/react"
import { BarList, Card, Icon } from "@tremor/react"
import { useMemo } from "react"

interface Props {
  className?: string
}

export default function AssetBarList({ className = "" }: Props) {
  const [assets, assetsLoading] = useBoundStore((state) => [state.assets, state.assetsLoading])

  const data = useMemo(() => {
    if (assetsLoading || assets.length === 0) return []
    const totalAmount = assets.map(({ value }) => value).reduce((a, b) => a + b, 0)
    return assets.map(({ name, ticker, value }) => ({
      name: `${name} (${ticker.ticker})`,
      value: value / totalAmount,
      icon: () => <Icon className="mr-2" icon={RiLineChartLine} />,
    }))
  }, [assets, assetsLoading])

  if (assetsLoading)
    return (
      <div className="flex flex-row justify-center align-middle">
        <Icon icon={RiTimeLine} />
        <p className="text-tremor-content dark:text-dark-tremor-content">Loading...</p>
      </div>
    )

  if (assets.length === 0)
    return (
      <div className="flex flex-row justify-center align-middle">
        <p className="text-tremor-content dark:text-dark-tremor-content">No assets registered</p>
      </div>
    )

  return (
    <Card className={className}>
      <h3 className="text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
        Assets list
      </h3>
      <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        <span>Source</span>
        <span>% (approx.)</span>
      </p>
      <BarList valueFormatter={(val: number) => `${(val * 100).toFixed()}%`} data={data} className="mt-2" />
    </Card>
  )
}
