import { Card } from "@tremor/react"
import AssetTable from "./AssetTable"

export default function AssetsCard() {
  return (
    <Card>
      <h1 className="mb-4 max-w-2xl text-3xl tracking-tight text-slate-900 dark:text-neutral-300">Assets</h1>
      <div className="mb-8">
        <AssetTable />
      </div>
    </Card>
  )
}
