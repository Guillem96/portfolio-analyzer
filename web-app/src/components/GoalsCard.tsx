import { Card, ProgressBar } from "@tremor/react"
import { currencyFormatter } from "@/services/utils"
import { Icon } from "@tremor/react"
import { RiFocus2Line, RiTrophyLine } from "@remixicon/react"
import { CurrencyType } from "@/types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/Accordion"

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

const Goal = ({ goal }: { goal: GoalsCardProps["goals"][number] }) => {
  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex flex-row items-center justify-start">
        <Icon
          color={goal.completed ? "amber" : "violet"}
          icon={goal.completed ? RiTrophyLine : RiFocus2Line}
          className="pl-0"
        />
        <p className="text-sm text-tremor-content dark:text-dark-tremor-content">
          {goal.name} ({currencyFormatter(goal.targetAmount, goal.currency, false)})
        </p>
      </div>
      <div className="flex flex-row items-center">
        {goal.completed ? null : (
          <ProgressBar
            label={`${goal.completed ? "100" : ((goal.amount / goal.targetAmount) * 100).toFixed(0)}%`}
            value={goal.completed ? 100 : (goal.amount / goal.targetAmount) * 100}
            color={goal.completed ? "amber" : "violet"}
            className="w-full"
          />
        )}
      </div>
    </div>
  )
}

export default function GoalsCard({ title, goals }: GoalsCardProps) {
  const completedGoals = goals.filter((goal) => goal.completed)
  const incompleteGoals = goals.filter((goal) => !goal.completed)

  return (
    <Card decoration="top" decorationColor="violet">
      <h3 className="text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
        {title}
      </h3>
      <Accordion type="single" collapsible>
        <AccordionItem value="completed">
          <AccordionTrigger>
            {" "}
            <span className="flex items-center gap-2">
              {" "}
              <Icon icon={RiTrophyLine} color="amber" />
              <p className="text-sm text-tremor-content dark:text-dark-tremor-content">Show Completed Goals</p>
            </span>{" "}
          </AccordionTrigger>
          <AccordionContent>
            {completedGoals.map((goal) => (
              <Goal key={goal.name} goal={goal} />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex flex-col gap-y-6 pt-2">
        {incompleteGoals.map((goal) => (
          <Goal key={goal.name} goal={goal} />
        ))}
      </div>
    </Card>
  )
}
