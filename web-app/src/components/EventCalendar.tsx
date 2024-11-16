import { useEffect, useState } from "react"
import { format, subDays, getDay, lastDayOfMonth, differenceInDays, subMonths, addMonths } from "date-fns"
import { Button, Card, Divider, Icon } from "@tremor/react"
import { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/Drawer"
import { currencyFormatter, getWebsiteLogo, showErrorToast } from "@/services/utils"
import { RiArrowLeftSLine, RiArrowRightSLine, RiInformation2Line, RiTimeLine } from "@remixicon/react"
import { fetchEvents } from "@/services/assets"
import { Event } from "@/types.d"

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

interface Props {
  currentMonth: Date
  events: Record<string, Event[]>
}

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
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<Record<string, Event[]>>({})

  useEffect(() => {
    setLoading(true)
    fetchEvents().then((events) => {
      setEvents(events)
      setLoading(false)
    }).catch((error) => {
      console.error(error)
      showErrorToast("Error fetching events...", () => setLoading(false))
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="grid min-h-dvh content-center text-center text-xl">
        <Icon size="xl" icon={RiTimeLine} />
        <p className="text-tremor-content dark:text-dark-tremor-content">Loading...</p>
      </div>
    )
  }

  return (
    <article>
      <header className="flex flex-row items-center justify-between gap-4">
        <Button variant="light" icon={RiArrowLeftSLine} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
        </Button>
        <h2 className="text-center text-3xl text-slate-900 dark:text-neutral-300">
          {format(currentMonth, "LLLL, yyyy")}
        </h2>
        <Button variant="light" icon={RiArrowRightSLine} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
        </Button>
      </header>
      <span className="hidden lg:d-block">
        <DesktopEventCalendar currentMonth={currentMonth} events={events} />
      </span>
      <span className="lg:hidden">
        <MobileEventCalendar currentMonth={currentMonth} events={events} />
      </span>
    </article>
  )

}

const MobileEventCalendar = ({ currentMonth, events }: Props) => {
  const monthEvents = Object.entries(events).filter(([date]) => date.startsWith(format(currentMonth, "yyyy-MM")))

  if (monthEvents.length === 0) {
    return (
      <ul className="flex flex-col items-center justify-center">
        <li className="text-center text-lg text-tremor-content dark:text-dark-tremor-content">
          No events for this month
        </li>
      </ul>
    )
  }

  const lastDay = lastDayOfMonth(currentMonth).getDate()
  return (
    <ul className="p-4 flex flex-col gap-y-4 pb-12" >
      {
        range(lastDay).map((day) => {
          return (
            <MobileDay key={day} events={events} date={new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day + 1)} />
          )
        })
      }
    </ul >)
}

const MobileDay = ({ date, events }: { date: Date, events: Record<string, Event[]> }) => {
  const dayEvents = events[format(date, "yyyy-MM-dd")] || []
  if (dayEvents.length === 0) {
    return null
  }

  return (
    <article>
      <div className="flex flex-row justify-between items-center">
        <h3 className="text-tremor-content dark:text-white font-bold underline text-left py-2">{format(date, "EEEE, dd")}</h3>
        <InfoDrawer date={date} events={dayEvents} >
          <Button variant="light" size="sm" icon={RiInformation2Line} />
        </InfoDrawer>
      </div>
      <ul>
        {dayEvents.map((event) => (
          <li key={event.ticker.ticker}>
            <div
              className={`mb-2 rounded-sm border-l-4 border-solid ${COLORS_MAPPING[event.eventType]} ${BG_COLORS_MAPPING[event.eventType]} flex items-center flex-row gap-x-2 p-1 pl-2`}
            >
              <img
                className="d-block h-6 w-6 rounded-full bg-transparent bg-white"
                src={getWebsiteLogo(event.ticker.website)}
                alt={`${event.ticker.ticker} company logo`}
              />
              <p className="text-tremor-content-emphasis dark:text-white">{event.ticker.ticker}</p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}

const DesktopEventCalendar = ({ currentMonth, events }: Props) => {
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDay = lastDayOfMonth(currentMonth)

  let firstDayWeekday = getDay(firstDay) - 1
  firstDayWeekday = firstDayWeekday === -1 ? 6 : firstDayWeekday

  const prevMonthFirstDate = subDays(firstDay, firstDayWeekday)
  const prevMonthDaysToRender = differenceInDays(firstDay, prevMonthFirstDate)

  const nextMonth = addMonths(currentMonth, 1)
  const nextMonthDaysToRender = 7 - lastDay.getDay()

  return (
    <main className="grid grid-cols-7 gap-2 m-auto">
      {weekdays.map((weekday) => (
        <div key={weekday} className="p-2">
          <p className="text-center text-sm">{weekday}</p>
        </div>
      ))}
      {/* Previous month days */}
      {range(prevMonthDaysToRender).map((day) => (
        <Day
          key={`prev-${day}`}
          events={events}
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
        <Day key={day} events={events} date={new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day + 1)} isCurrentMonth />
      ))}

      {/* Next month days */}
      {range(nextMonthDaysToRender).map((day) => (
        <Day key={`next-${day}`} events={events} date={new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day + 1)} />
      ))}
    </main>
  )
}

const range = (length: number) => Array.from({ length }, (_, i) => i)

const Day = ({ date, events, isCurrentMonth }: { date: Date; events: Record<string, Event[]>, isCurrentMonth?: boolean }) => {
  const dayEvents = events[format(date, "yyyy-MM-dd")] || []
  const eventsToShow = dayEvents.length > MAX_EVENTS_TO_SHOW ? dayEvents.slice(0, MAX_EVENTS_TO_SHOW - 1) : dayEvents
  const nMore = dayEvents.length - eventsToShow.length

  const dayContent = (
    <article className={`${!isCurrentMonth ? "opacity-60" : ""} ${dayEvents.length > 0 ? "hover:cursor-pointer" : ""}`}>
      <Card className={`flex aspect-square flex-col gap-y-2 p-1 overflow-hidden ${dayEvents.length > 0 ? "" : ""} `}>
        <h3 className="text-lg text-tremor-content dark:text-dark-tremor-content">{date.getDate()}</h3>
        <ul>
          {eventsToShow.map((event) => (
            <li key={event.ticker.ticker}>
              <div
                className={`mb-2 rounded-sm border-l-4 border-solid ${COLORS_MAPPING[event.eventType]} ${BG_COLORS_MAPPING[event.eventType]} flex items-center flex-row gap-x-2 p-1 pl-2`}
              >
                <img
                  className="d-block h-6 w-6 rounded-full bg-transparent bg-white"
                  src={getWebsiteLogo(event.ticker.website)}
                  alt={`${event.ticker.ticker} company logo`}
                />
                <p className="text-tremor-content-emphasis dark:text-white">{event.ticker.ticker}</p>
              </div>
            </li>
          ))}
          {nMore > 0 && (
            <div className="mb-2 rounded-sm border-l-4 border-solid border-white bg-white/60 p-1">
              <p className="pl-2 text-tremor-content-strong">+{nMore} more</p>
            </div>
          )}
        </ul>

      </Card>
    </article>
  )

  if (dayEvents.length === 0) {
    return dayContent
  }

  return (
    <InfoDrawer date={date} events={dayEvents} >
      {dayContent}
    </InfoDrawer>
  );
}


const InfoDrawer = ({ events, date, children }: { date: Date, events: Event[], children: any }) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-lg">
        <DrawerHeader>
          <DrawerTitle className="pt-2">Financial events for {format(date, "dd-MM-yyyy")}</DrawerTitle>
          <DrawerDescription className="mt-1 text-sm">
            Upcoming financial reports and ex-dividends events for {format(date, "dd-MM-yyyy")}.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <ul className="max-h-[96em] overflow-y-scroll">
            {events.map((event) => (
              <li key={`drawer-${event.ticker.ticker}`} className="pb-8">
                <header
                  className="flex flex-row items-center gap-x-4"
                >
                  <img
                    className="d-block h-12 w-12 rounded-full bg-transparent bg-white"
                    src={getWebsiteLogo(event.ticker.website)}
                    alt={`${event.ticker.ticker} company logo`}
                  />
                  <h3 className="text-tremor-content-strong dark:text-dark-tremor-brand-emphasis font-bold text-lg">{event.ticker.name}</h3>
                </header>
                {event.eventType === "Ex-Dividend" ? (
                  <main className="flex flex-row gap-y-2 items-center justify-center gap-x-8 mt-2 text-tremor-content dark:text-dark-tremor-content">
                    <div className="flex flex-col items-center justify-center">
                      <h4 className="text-tremor-content-subtle dark:text-dark-tremor-brand-subtle">Dividend value</h4>
                      <p className="text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">{currencyFormatter(event.extraData.dividendValue, event.ticker.currency, false)}</p>
                    </div>
                    <div className="flex flex-col gap-y-2 items-center justify-center">
                      <h4 className="text-tremor-content-subtle dark:text-dark-tremor-brand-subtle">Dividend yield</h4>
                      <p className="text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">{(event.extraData.dividendYield * 100).toFixed(2)}%</p>
                    </div>
                    <div className="flex flex-col gap-y-2 items-center justify-center">
                      <h4 className="text-tremor-content-subtle dark:text-dark-tremor-brand-subtle">Expected amount</h4>
                      <p className="text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">{currencyFormatter(event.extraData.expectedAmount, event.ticker.currency, false)}</p>
                    </div>
                  </main>
                ) : <main className="p-4">
                  <p className="text-tremor-content dark:text-dark-tremor-content">Earnings report</p>

                </main>}

                <footer>
                  <Divider />
                </footer>
              </li>
            ))
            }
          </ul>
        </DrawerBody>
        <DrawerFooter className="mt-6">
          <DrawerClose asChild>
            <Button
              className="mt-2 w-full sm:mt-0 sm:w-fit"
              variant="secondary"
            >
              Go back
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button className="w-full sm:w-fit">Ok, got it!</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer >
  )
}