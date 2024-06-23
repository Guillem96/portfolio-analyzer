import { Card } from "@tremor/react"
import BuyForm from "./BuyForm"
import BuyTable from "./BuyTable"

export default function BuysCard() {
  return (
    <Card>
      <h1 className="mb-4 max-w-2xl text-3xl tracking-tight text-slate-900 dark:text-neutral-300">Buys</h1>
      <article className="mb-8">
        <BuyTable />
      </article>
      <BuyForm />
    </Card>
  )
}
