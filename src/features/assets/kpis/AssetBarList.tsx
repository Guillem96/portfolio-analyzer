import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { RiBarChartHorizontalLine, RiLineChartLine } from "@remixicon/react"
import { BarList, Card, Icon } from "@tremor/react"
import { useMemo } from "react"

interface Props {
  className?: string
}

export default function AssetBarList({ className = "" }: Props) {
  const assets = useBoundStore((state) => state.assets)
  const data = useMemo(
    () =>
      assets.map(({ name, value, currency, isFixIncome }) => ({
        name: `${name} (${currencyFormatter(value, currency)})`,
        value: value,
        icon: () => <Icon className="mr-2" icon={isFixIncome ? RiBarChartHorizontalLine : RiLineChartLine} />,
      })),
    [assets],
  )
  return (
    <Card className={className}>
      <h3 className="text-tremor-title text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">
        Assets list
      </h3>
      <p className="mt-4 text-tremor-default flex items-center justify-between text-tremor-content dark:text-dark-tremor-content">
        <span>Source</span>
        <span>Value</span>
      </p>
      <BarList data={data} className="mt-2" />
    </Card>
  )
}
