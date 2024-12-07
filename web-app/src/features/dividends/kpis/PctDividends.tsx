import { useDividedsStats } from "@/hooks/dividends"
import { Card } from "@tremor/react"

const PctDividends = (withRespectBuys: boolean) => {
  const { yieldWithRespectToAssetValue, yieldWithRespectToInvested } = useDividedsStats()
  return (
    <Card decoration="top">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
        Dividend yield with respect to total {withRespectBuys ? "invested" : "asset value"}
      </p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {`${withRespectBuys ? yieldWithRespectToInvested : yieldWithRespectToAssetValue}%`}
        </p>
      </div>
    </Card>
  )
}

export const PctDividendsOverBuys = () => PctDividends(true)
export const PctDividendsOverAssetValue = () => PctDividends(false)
