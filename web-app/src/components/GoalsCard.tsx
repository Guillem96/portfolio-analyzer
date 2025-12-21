import { Card, ProgressBar } from "@tremor/react"
import { currencyFormatter } from "@/services/utils"
import { Icon } from "@tremor/react"
import { RiFocus2Line } from "@remixicon/react"
import { CurrencyType } from "@/types"

interface GoalsCardProps {
  title: string
  goals: {
    name: string
    amount: number
    targetAmount: number
    currency: CurrencyType
    completed: boolean
  }[]
}

export default function GoalsCard({ title, goals }: GoalsCardProps) {
  return (
    <Card decoration="top" decorationColor="violet">
      <h3 className="text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
        {title}
      </h3>
      <div className="flex flex-col gap-y-6 pt-2">
        {goals.map((goal) => (
          <div key={goal.name} className="flex flex-col gap-y-1">
            <div className="flex flex-row items-center justify-start">
              <Icon color="violet" icon={RiFocus2Line} className="pl-0" />
              <p className="text-sm text-tremor-content dark:text-dark-tremor-content">
                {goal.name} ({currencyFormatter(goal.targetAmount, goal.currency, false)})
              </p>
            </div>
            <div className="flex flex-row items-center">
              <ProgressBar
                label={`${goal.completed ? "100%" : ((goal.amount / goal.targetAmount) * 100).toFixed(0)}%`}
                value={goal.completed ? 100 : (goal.amount / goal.targetAmount) * 100}
                color={goal.completed ? "emerald" : "violet"}
                className="w-full"
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
