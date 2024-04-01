import { Card } from "@tremor/react"
import InvestmentForm from "./InvestmentForm"
import InvestmentTable from "./InvestmentTable"

export default function InvestmentsCard() {
  return (
    <Card>
      <h1 className="mb-4 max-w-2xl text-3xl tracking-tight text-slate-900 dark:text-neutral-300">Investments</h1>
      <article className="mb-8">
        <InvestmentTable />
      </article>
      <InvestmentForm />
    </Card>
  )
}
