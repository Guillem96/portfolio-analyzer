import GoalsCard from "@/components/GoalsCard"
import { Skeleton } from "@/components/ui/Skeleton"
import { INVESTMENT_GOALS } from "@/constants"
import { useBoundStore } from "@/store"
import { Card } from "@tremor/react"
import { useMemo } from "react"

export default function BuyGoals() {
  const [assets, assetsLoading, mainCurrency] = useBoundStore((state) => [
    state.assets,
    state.assetsLoading,
    state.mainCurrency,
  ])

  const investmentAmount = useMemo(
    () => assets.map(({ buyValue }) => buyValue).reduce((a, b) => a + b, 0),
    [assets, mainCurrency],
  )

  const nextGoalIndex = INVESTMENT_GOALS.findIndex((goal) => goal >= investmentAmount)
  const nextTargets = INVESTMENT_GOALS.slice(0, nextGoalIndex + 1)

  const goals = nextTargets.map((goal) => ({
    name: "Total Invested",
    amount: investmentAmount,
    targetAmount: goal,
    currency: mainCurrency,
    completed: goal <= investmentAmount,
  }))

  if (assetsLoading)
    return (
      <Card decoration="top" decorationColor="violet">
        <h3 className="mb-2 text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Purchase Goals
        </h3>
        <Skeleton height={96} />
      </Card>
    )

  return <GoalsCard title="Purchase Goals" goals={goals} />
}
