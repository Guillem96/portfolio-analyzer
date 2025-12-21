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

  const nextGoal = INVESTMENT_GOALS.find((goal) => goal >= investmentAmount)

  return (
    <GoalsCard
      title="Purchase Goals"
      goals={[
        {
          name: "Total Invested",
          amount: investmentAmount,
          targetAmount: nextGoal || 0,
          currency: mainCurrency,
          completed: nextGoal === undefined,
        },
      ]}
    />
  )
}
