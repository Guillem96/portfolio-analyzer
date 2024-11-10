import { useState } from "react"
import untypedEvents from "../assets/events.json"
import { format, subDays, getDay, lastDayOfMonth, differenceInDays, subMonths, addMonths } from "date-fns"
import { Button, Card } from "@tremor/react"
import { TickerInfo } from "@/types"
// import { currencyFormatter } from "@/services/utils"

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

type Event = {
  eventType: "Ex-Dividend"
  ticker: TickerInfo
  extraData: {
    dividendValue: number
    dividendYield: number
    expectedAmount: number
  }
}

const EVENTS: Record<string, Event[]> = untypedEvents as never
const BG_COLORS_MAPPING = {
  "Ex-Dividend": "bg-purple-200/20",
  Earning: "bg-green-300/20",
}

const COLORS_MAPPING = {
  "Ex-Dividend": "border-purple-200",
  Earning: "border-green-300",
}

const MAX_EVENTS_TO_SHOW = 3

export default function EventCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDay = lastDayOfMonth(currentMonth)

  let firstDayWeekday = getDay(firstDay) - 1
  firstDayWeekday = firstDayWeekday === -1 ? 6 : firstDayWeekday

  const prevMonthFirstDate = subDays(firstDay, firstDayWeekday)
  const prevMonthDaysToRender = differenceInDays(firstDay, prevMonthFirstDate)

  const nextMonth = addMonths(currentMonth, 1)
  const nextMonthDaysToRender = 7 - lastDay.getDay()

  return (
    <article className="p-4">
      <header className="flex flex-row items-center justify-between gap-4">
        <Button variant="primary" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          Previous month
        </Button>
        <h2 className="text-center text-4xl text-slate-900 dark:text-neutral-300">
          {format(currentMonth, "LLLL, yyyy")}
        </h2>
        <Button variant="primary" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          Next month
        </Button>
      </header>
      <main className="grid grid-cols-7 gap-2">
        {weekdays.map((weekday) => (
          <div key={weekday} className="p-2">
            <p className="text-center text-sm">{weekday}</p>
          </div>
        ))}
        {/* Previous month days */}
        {range(prevMonthDaysToRender).map((day) => (
          <Day
            key={`prev-${day}`}
            date={
              new Date(
                prevMonthFirstDate.getFullYear(),
                prevMonthFirstDate.getMonth(),
                day + prevMonthFirstDate.getDate(),
              )
            }
          />
        ))}

        {/* Current month days */}
        {range(lastDay.getDate()).map((day) => (
          <Day key={day} date={new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day + 1)} isCurrentMonth />
        ))}

        {/* Next month days */}
        {range(nextMonthDaysToRender).map((day) => (
          <Day key={`next-${day}`} date={new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day + 1)} />
        ))}
      </main>
    </article>
  )
}

const range = (length: number) => Array.from({ length }, (_, i) => i)

const Day = ({ date, isCurrentMonth }: { date: Date; isCurrentMonth?: boolean }) => {
  const events = EVENTS[format(date, "yyyy-MM-dd")] || []
  const eventsToShow = events.length > MAX_EVENTS_TO_SHOW ? events.slice(0, MAX_EVENTS_TO_SHOW - 1) : events
  const nMore = events.length - eventsToShow.length

  return (
    <article className={`${!isCurrentMonth ? "opacity-60" : ""}`}>
      <Card className="flex h-48 flex-col gap-y-2 p-2">
        <h3 className="text-tremor-title text-tremor-content dark:text-dark-tremor-content">{date.getDate()}</h3>
        <ul>
          {eventsToShow.map((event) => (
            <li key={event.ticker.ticker}>
              <div
                className={`mb-2 rounded-sm border-l-4 border-solid ${COLORS_MAPPING[event.eventType]} ${BG_COLORS_MAPPING[event.eventType]}`}
              >
                <p className="pl-2 text-white">{event.ticker.ticker}</p>
              </div>
            </li>
          ))}
          {nMore > 0 && (
            <div className="mb-2 rounded-sm border-l-4 border-solid border-white bg-white/60">
              <p className="pl-2 text-tremor-content-strong">+{nMore} more</p>
            </div>
          )}
        </ul>
      </Card>
    </article>
  )
}
