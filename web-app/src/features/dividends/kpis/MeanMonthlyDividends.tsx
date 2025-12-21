import { useDividedsStats } from "@/hooks/dividends"
import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { Card } from "@tremor/react"

export default function MeanMonthlyDividends() {
  const [mainCurrency, privateMode] = useBoundStore((state) => [state.mainCurrency, state.privateMode])

  const { meanMonthlyAverage } = useDividedsStats()
  return (
    <Card decoration="top" className="flex flex-col justify-between">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
        Mean monthly dividends
      </p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {currencyFormatter(meanMonthlyAverage, mainCurrency, privateMode)}
        </p>
      </div>
    </Card>
  )
}
