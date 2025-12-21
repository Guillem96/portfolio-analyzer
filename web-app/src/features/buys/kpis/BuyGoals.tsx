import GoalsCard from "@/components/GoalsCard"
import { INVESTMENT_GOALS } from "@/constants"
import { useBoundStore } from "@/store"
import { useMemo } from "react"

export default function BuyGoals() {
  const [assets, mainCurrency] = useBoundStore((state) => [state.assets, state.mainCurrency])

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

  return <GoalsCard title="Purchase Goals" goals={goals} />
}
