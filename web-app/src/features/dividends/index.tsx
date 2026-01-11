import { Card } from "@tremor/react"
import DividendForm from "./DividendForm"
import DividendsTable from "./DividendsTable"
import DividendsTaxReport from "./exporter/DividendsTaxReport"

export default function DividendCard() {
  return (
    <Card>
      <header className="flex justify-end py-4">
        <DividendsTaxReport />
      </header>
      <div className="mb-8">
        <DividendsTable />
      </div>
      <DividendForm />
    </Card>
  )
}
