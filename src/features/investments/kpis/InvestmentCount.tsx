import { Card } from "@tremor/react"
import { useBoundStore } from "@/store"

export default function InvestmentCount() {
  const investments = useBoundStore((state) => state.investments)
  return (
    <Card decoration="top">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content"># Investments</p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {investments.length}
        </p>
      </div>
    </Card>
  )
}
