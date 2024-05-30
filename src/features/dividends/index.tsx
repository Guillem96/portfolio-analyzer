import { Card } from "@tremor/react"
import DividendForm from "./DividendForm"
import DividendsTable from "./DividendsTable"

export default function DividendCard() {
  return (
    <Card>
      <h1 className="mb-4 max-w-2xl text-3xl tracking-tight text-slate-900 dark:text-neutral-300">Dividends</h1>
      <div className="mb-8">
        <DividendsTable />
      </div>
      <DividendForm />
    </Card>
  )
}
