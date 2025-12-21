import { Card } from "@tremor/react"
import { useBoundStore } from "@/store"

export default function BuysCount() {
  const buys = useBoundStore((state) => state.buys)
  return (
    <Card decoration="top" className="flex flex-col justify-between">
      <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content"># Buys</p>
      <div className="mt-2 flex items-baseline space-x-2.5">
        <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {buys.length}
        </p>
      </div>
    </Card>
  )
}
