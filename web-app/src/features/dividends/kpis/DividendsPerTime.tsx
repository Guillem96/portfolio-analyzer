import { BarChart, Card, Icon, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react"
import { useBoundStore } from "@/store"
import { useMemo } from "react"
import { RiTimeLine } from "@remixicon/react"
import { currencyFormatter } from "@/services/utils"
import { MONTHS } from "@/constants"

const BarChartDividendsPerYear = () => {
  const [dividends, mainCurrency, dividendsLoading, privateMode] = useBoundStore((state) => [
    state.dividendsPreferredCurrency,
    state.mainCurrency,
    state.dividendLoading,
    state.privateMode,
  ])

  const data = useMemo(() => {
    if (dividendsLoading || dividends.length === 0) return []

    const invWithDate = dividends.map((div) => {
      return { ...div, date: new Date(div.date) }
    })

    const startingYear = new Date().getFullYear() - 4
    const data = new Array(5).fill(undefined).map((_, i) => {
      return {
        date: startingYear + i + 1,
        "Dividend Earnings": 0,
      }
    })

    invWithDate.forEach(({ date, amount }) => {
      data[date.getFullYear() - startingYear]["Dividend Earnings"] += amount
    })

    return data
  }, [dividends, mainCurrency, dividendsLoading])

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
      data={data}
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
  const year = new Date().getFullYear()
  const data = useMemo(() => {
    if (dividendsLoading || dividends.length === 0) return []

    const invWithDate = dividends.map((div) => {
      return { ...div, date: new Date(div.date) }
    })

    const currInv = invWithDate.filter(({ date }) => date.getFullYear() === year || date.getFullYear() - 1)

    const barData = MONTHS.map((month) => ({ date: month, [year]: 0, [year - 1]: 0 }))

    currInv.forEach(({ date, amount }) => {
      barData[date.getMonth()][date.getFullYear()] += amount
    })

    return barData
  }, [dividends, mainCurrency, dividendsLoading])

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
      data={data}
      index="date"
      categories={[(year - 1).toString(), year.toString()]}
      colors={["gray", "emerald"]}
      yAxisWidth={30}
      valueFormatter={(val) => currencyFormatter(val, mainCurrency, privateMode)}
    />
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
        </TabList>

        <TabPanels>
          <TabPanel>
            <BarChartDividendsPerYear />
          </TabPanel>
          <TabPanel>
            <BarChartDividendsPerMonth />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </Card>
  )
}
