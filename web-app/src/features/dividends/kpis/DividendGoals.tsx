import GoalsCard from "@/components/GoalsCard"
import { useDividedsStats } from "@/hooks/dividends"
import { MONTHLY_DIVIDEND_GOALS, YEARLY_DIVIDEND_GOALS } from "@/constants"
import { useBoundStore } from "@/store"
import { Card } from "@tremor/react"
import { Skeleton } from "@/components/ui/Skeleton"

export default function DividendGoals() {
  const { meanMonthlyAverage, nextYearDividends, loading } = useDividedsStats()
  const mainCurrency = useBoundStore((state) => state.mainCurrency)

  const nextMonthlyGoalIndex = MONTHLY_DIVIDEND_GOALS.findIndex((goal) => goal >= meanMonthlyAverage)
  const nextYearlyGoalIndex = YEARLY_DIVIDEND_GOALS.findIndex((goal) => goal >= nextYearDividends)

  const monthlyTargets = MONTHLY_DIVIDEND_GOALS.slice(0, nextMonthlyGoalIndex + 1)
  const yearlyTargets = YEARLY_DIVIDEND_GOALS.slice(0, nextYearlyGoalIndex + 1)

  const monthlyGoals = monthlyTargets.map((goal) => ({
    name: "Monthly dividend",
    amount: meanMonthlyAverage,
    targetAmount: goal,
    currency: mainCurrency,
    completed: goal <= meanMonthlyAverage,
  }))

  const yearlyGoals = yearlyTargets.map((goal) => ({
    name: "Yearly dividend",
    amount: nextYearDividends,
    targetAmount: goal,
    currency: mainCurrency,
    completed: goal <= nextYearDividends,
  }))

  const allGoals = [...monthlyGoals, ...yearlyGoals]

  if (loading)
    return (
      <Card decoration="top" decorationColor="violet">
        <h3 className="mb-2 text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Dividend Goals
        </h3>
        <Skeleton height={96} />
      </Card>
    )

  return <GoalsCard title="Dividend Goals" goals={allGoals} />
}
