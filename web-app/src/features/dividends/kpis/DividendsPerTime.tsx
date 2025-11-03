import {
  BarChart,
  Card,
  DonutChart,
  Icon,
  Select,
  SelectItem,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@tremor/react"
import { useBoundStore } from "@/store"
import { RiTimeLine } from "@remixicon/react"
import { currencyFormatter } from "@/services/utils"
import { useDividedsStats } from "@/hooks/dividends"
import { format, parse, subMonths } from "date-fns"
import { MONTHS_NAMES, PASTEL_VIVID_COLORS } from "@/constants"
import { useState } from "react"

const BarChartDividendsPerYear = () => {
  const [dividends, mainCurrency, dividendsLoading, privateMode] = useBoundStore((state) => [
    state.dividendsPreferredCurrency,
    state.mainCurrency,
    state.dividendLoading,
    state.privateMode,
  ])

  const { dividendsPerYear } = useDividedsStats()

  if (dividendsLoading)
    return (
      <div className="flex flex-row justify-center align-middle">
        <Icon icon={RiTimeLine} />
        <p className="text-tremor-content dark:text-dark-tremor-content">Loading...</p>
      </div>
    )

  if (dividends.length === 0)
    return (
      <div className="flex flex-row justify-center align-middle">
        <p className="text-tremor-content dark:text-dark-tremor-content">No dividends registered</p>
      </div>
    )

  return (
    <BarChart
      colors={["emerald"]}
      categories={["Dividend Earnings"]}
      className="mt-6"
      data={dividendsPerYear}
      index="date"
      yAxisWidth={30}
      valueFormatter={(val) => currencyFormatter(val, mainCurrency, privateMode)}
    />
  )
}

const BarChartDividendsPerMonth = () => {
  const [dividends, mainCurrency, dividendsLoading, privateMode] = useBoundStore((state) => [
    state.dividendsPreferredCurrency,
    state.mainCurrency,
    state.dividendLoading,
    state.privateMode,
  ])

  const { dividendsPerMonth } = useDividedsStats()
  if (dividendsLoading)
    return (
      <div className="flex flex-row justify-center align-middle">
        <Icon icon={RiTimeLine} />
        <p className="text-tremor-content dark:text-dark-tremor-content">Loading...</p>
      </div>
    )

  if (dividends.length === 0)
    return (
      <div className="flex flex-row justify-center align-middle">
        <p className="text-tremor-content dark:text-dark-tremor-content">No devidends registered</p>
      </div>
    )

  return (
    <BarChart
      className="mt-6"
      data={dividendsPerMonth}
      index="date"
      categories={Object.keys(dividendsPerMonth[0]).filter((key) => key !== "date")}
      // colors={["gray", "emerald"]}
      yAxisWidth={30}
      valueFormatter={(val) => currencyFormatter(val, mainCurrency, privateMode)}
    />
  )
}

const PieChartDividends = ({ date, tickersToColor }: { date: string; tickersToColor: Record<string, string> }) => {
  const [dividends, mainCurrency, dividendsLoading, privateMode] = useBoundStore((state) => [
    state.dividendsPreferredCurrency,
    state.mainCurrency,
    state.dividendLoading,
    state.privateMode,
  ])

  if (dividendsLoading)
    return (
      <div className="flex flex-row justify-center align-middle">
        <Icon icon={RiTimeLine} />
        <p className="text-tremor-content dark:text-dark-tremor-content">Loading...</p>
      </div>
    )

  const dividendsWithDate = dividends.map((dividend) => ({
    ...dividend,
    date: parse(dividend.date, "yyyy-MM-dd", new Date()),
  }))
  const filteredDividends = dividendsWithDate.filter((dividend) => format(dividend.date, "MM-yyyy") === date)
  const groupedDividends = Object.groupBy(filteredDividends, (dividend) => dividend.company)
  const reducedDividends = Object.entries(groupedDividends).map(([company, dividends]) => ({
    ticker: company,
    value: dividends.reduce((acc, dividend) => acc + dividend.amount, 0),
  }))

  return (
    <DonutChart
      data={reducedDividends}
      category="value"
      index="ticker"
      valueFormatter={(number) => currencyFormatter(number, mainCurrency, privateMode)}
      colors={reducedDividends.map(({ ticker }) => tickersToColor[ticker])}
    />
  )
}

const CompareMontlyDividendsIncome = () => {
  const [dividends] = useBoundStore((state) => [state.dividends])

  const today = new Date()
  const currentMonth = format(today, "MM-yyyy")
  const lastMonth = format(subMonths(today, 1), "MM-yyyy")
  const [firstMonth, setFirstMonth] = useState<string>(lastMonth)
  const [secondMonth, setSecondMonth] = useState<string>(currentMonth)
  const tickers = [
    ...new Set(
      dividends
        .map((dividend) => ({
          ...dividend,
          date: format(parse(dividend.date, "yyyy-MM-dd", new Date()), "MM-yyyy"),
        }))
        .filter(({ date }) => date === firstMonth || date === secondMonth)
        .map(({ company }) => company),
    ),
  ]

  const tickersToColor = Object.fromEntries(
    tickers.map((ticker, index) => [ticker, PASTEL_VIVID_COLORS[index % PASTEL_VIVID_COLORS.length]]),
  )

  const allYears = [
    ...new Set(dividends.map((dividend) => parse(dividend.date, "yyyy-MM-dd", new Date()).getFullYear())),
  ]

  const selectItems = allYears.flatMap((year) => {
    return MONTHS_NAMES.map((name, idx) => {
      return {
        key: `${name}-${year}`,
        year,
        month: idx,
        value: `${(idx + 1).toString().padStart(2, "0")}-${year.toString()}`,
      }
    })
  })

  selectItems.sort((a, b) => {
    const ay = a.year
    const am = a.month
    const by = b.year
    const bm = b.month

    if (ay > by) return -1

    if (ay < by) return 1

    if (am > bm) return -1

    if (am < bm) return 1

    return 1
  })

  return (
    <>
      <header className="flex flex-col items-end justify-end gap-4 pt-4">
        <div className="flex w-full flex-row items-center justify-center gap-8">
          <div className="flex w-full flex-col gap-2">
            <h3 className="text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
              First month
            </h3>
            <div className="flex flex-row gap-x-2">
              <Select
                id="dividends-month-1"
                name="dividends-month-1"
                value={firstMonth}
                defaultValue={firstMonth}
                onValueChange={(value) => setFirstMonth(value)}
              >
                {selectItems.map(({ key, year, month, value }) => (
                  <SelectItem key={key} value={value}>
                    {MONTHS_NAMES[month]} {year}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2">
            <h3 className="text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
              Second month
            </h3>
            <div className="flex flex-row gap-x-2">
              <Select
                id="dividends-month-2"
                name="dividends-month-2"
                value={secondMonth}
                defaultValue={secondMonth}
                onValueChange={(value) => setSecondMonth(value)}
              >
                {selectItems.map(({ key, year, month, value }) => (
                  <SelectItem key={key} value={value}>
                    {MONTHS_NAMES[month]} {year}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </header>
      <main className="flex flex-row gap-x-4 pt-8">
        <PieChartDividends date={firstMonth} tickersToColor={tickersToColor} />
        <PieChartDividends date={secondMonth} tickersToColor={tickersToColor} />
      </main>
      <footer className="grid grid-cols-4 items-center gap-4 pt-8 md:grid-cols-6">
        {Object.entries(tickersToColor).map(([ticker, color]) => (
          <div className="flex flex-row items-center justify-center gap-1" key={ticker}>
            <div className={`bg-[${color}] h-4 w-4 rounded-full`}></div>
            <p className="text-sm font-semibold text-tremor-content dark:text-white">{ticker}</p>
          </div>
        ))}
      </footer>
    </>
  )
}

export default function DividendsPerTime() {
  return (
    <Card decoration="top">
      <h3 className="text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
        Investments per month
      </h3>
      <TabGroup>
        <TabList variant="line" defaultValue="1">
          <Tab value="1">Yearly</Tab>
          <Tab value="2">Monthly</Tab>
          <Tab value="3">Compare monthly</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <BarChartDividendsPerYear />
          </TabPanel>
          <TabPanel>
            <BarChartDividendsPerMonth />
          </TabPanel>
          <TabPanel>
            <CompareMontlyDividendsIncome />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </Card>
  )
}
