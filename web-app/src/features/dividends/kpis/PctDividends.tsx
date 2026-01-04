import { Skeleton } from "@/components/ui/Skeleton"
import { useDividedsStats } from "@/hooks/dividends"
import { Card } from "@tremor/react"

const PctDividends = (withRespectBuys: boolean) => {
  const { yieldWithRespectToAssetValue, yieldWithRespectToInvested, loading } = useDividedsStats()
  return (
    <Card decoration="top" className="flex flex-col justify-between">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
        Dividend yield {withRespectBuys ? "on cost" : ""}
      </p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {loading ? (
            <Skeleton height={32} width={64} />
          ) : (
            `${withRespectBuys ? yieldWithRespectToInvested : yieldWithRespectToAssetValue}%`
          )}
        </p>
      </div>
    </Card>
  )
}

export const PctDividendsOverBuys = () => PctDividends(true)
export const PctDividendsOverAssetValue = () => PctDividends(false)
