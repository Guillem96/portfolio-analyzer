import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BuyForm from "./BuyForm"
import BuyTable from "./BuyTable"

export default function BuysCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-normal tracking-tight">Buys</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <BuyTable />
        <BuyForm />
      </CardContent>
    </Card>
  )
}
