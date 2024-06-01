import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { RiBarChartHorizontalLine, RiLineChartLine } from "@remixicon/react"
import { BarList, Card, Icon } from "@tremor/react"
import { useMemo } from "react"

interface Props {
  className?: string
}

export default function AssetBarList({ className = "" }: Props) {
  const [assets, privateMode] = useBoundStore((state) => [state.assets, state.privateMode])
  const data = useMemo(
    () =>
      assets.map(({ name, value, currency, isFixIncome }) => ({
        name: `${name} (${currencyFormatter(value, currency, privateMode)})`,
        value: value,
        icon: () => <Icon className="mr-2" icon={isFixIncome ? RiBarChartHorizontalLine : RiLineChartLine} />,
      })),
    [assets],
  )
  return (
    <Card className={className}>
      <h3 className="text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
        Assets list
      </h3>
      <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        <span>Source</span>
        <span>Value</span>
      </p>
      <BarList valueFormatter={(val: number) => (privateMode ? "***" : val)} data={data} className="mt-2" />
    </Card>
  )
}
