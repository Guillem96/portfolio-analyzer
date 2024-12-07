import { useDividedsStats } from "@/hooks/dividends"
import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { Card } from "@tremor/react"

export default function RemainingDividendsYear() {
  const [mainCurrency, privateMode] = useBoundStore((state) => [state.mainCurrency, state.privateMode])

  const { leftDividendsYear } = useDividedsStats()
  return (
    <Card decoration="top">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
        Expected earnings this year
      </p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {currencyFormatter(leftDividendsYear, mainCurrency, privateMode)}
        </p>
      </div>
    </Card>
  )
}
