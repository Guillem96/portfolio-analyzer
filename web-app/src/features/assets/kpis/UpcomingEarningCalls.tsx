import { useBoundStore } from "@/store"
import { Callout, Card } from "@tremor/react"

export default function UpcommingEarningCalls() {
  const [tickerToInfo] = useBoundStore((state) => [state.tickerToInfo])
  const nextEarningCalls = Object.values(tickerToInfo)
    .flatMap(({ ticker, name, earningDates }) => {
      return earningDates.map((date) => ({ ticker, date, name }))
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
  return (
    <Card>
      <h1 className="mb-4 max-w-2xl text-3xl tracking-tight text-slate-900 dark:text-neutral-300">
        Upcoming Earning Calls
      </h1>
      <div className="flex flex-col gap-2 overflow-scroll md:grid md:grid-cols-3">
        {nextEarningCalls.map(({ ticker, date }, index) => (
          <Callout key={`ec-${ticker}-${index}`} title={ticker} color={date >= new Date() ? "teal" : "red"}>
            {date.toLocaleDateString("es")}
          </Callout>
        ))}
      </div>
    </Card>
  )
}
