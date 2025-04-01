import { Card } from "@tremor/react"
import SellTable from "./SellTable"
import SellForm from "./SellForm"

export default function SellsCard() {
  return (
    <Card>
      <h1 className="mb-4 max-w-2xl text-3xl tracking-tight text-slate-900 dark:text-neutral-300">Sells</h1>
      <article className="mb-8">
        <SellTable />
      </article>
      <SellForm />
    </Card>
  )
}
