import GoalsCard from "@/components/GoalsCard"
import { useDividedsStats } from "@/hooks/dividends"
import { MONTHLY_DIVIDEND_GOALS, YEARLY_DIVIDEND_GOALS } from "@/constants"
import { useBoundStore } from "@/store"
export default function DividendGoals() {
  const { meanMonthlyAverage, nextYearDividends } = useDividedsStats()
  const mainCurrency = useBoundStore((state) => state.mainCurrency)

  const nextMonthlyGoal = MONTHLY_DIVIDEND_GOALS.find((goal) => goal >= meanMonthlyAverage)
  const nextYearlyGoal = YEARLY_DIVIDEND_GOALS.find((goal) => goal >= nextYearDividends)

  return (
    <GoalsCard
      title="Dividend Goals"
      goals={[
        {
          name: "Monthly dividend",
          amount: meanMonthlyAverage,
          targetAmount: nextMonthlyGoal || 0,
          currency: mainCurrency,
          completed: nextMonthlyGoal === undefined,
        },
        {
          name: "Yearly dividend",
          amount: nextYearDividends,
          targetAmount: nextYearlyGoal || 0,
          currency: mainCurrency,
          completed: nextYearlyGoal === undefined,
        },
      ]}
    />
  )
}
