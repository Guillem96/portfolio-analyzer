import { BarChart, Card, Icon, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react"
import { useBoundStore } from "@/store"
import { useMemo } from "react"
import { RiTimeLine } from "@remixicon/react"
import { currencyFormatter } from "@/services/utils"

interface BarChartProps {
  currency: "€" | "$"
}

const BarChartDividends = ({ currency }: BarChartProps) => {
  const [dividends, dividendsLoading, privateMode] = useBoundStore((state) => [
    state.dividends,
    state.dividendLoading,
    state.privateMode,
  ])

  const data = useMemo(() => {
    if (dividendsLoading || dividends.length === 0) return []

    const invWithDate = dividends.map((div) => {
      return { ...div, date: new Date(div.date) }
    })

    const currDiv = invWithDate.filter((inv) => inv.currency === currency)
    const startingYear = new Date().getFullYear() - 4
    const data = new Array(5).fill(undefined).map((_, i) => {
      return {
        date: startingYear + i + 1,
        "Dividend Earnings": 0,
      }
    })

    currDiv.forEach(({ date, amount }) => {
      data[date.getFullYear() - startingYear]["Dividend Earnings"] += amount
    })

    return data
  }, [dividends, currency, dividendsLoading])

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
      valueFormatter={(val) => currencyFormatter(val, currency, privateMode)}
    />
  )
}

export default function DividendsPerYear() {
  return (
    <Card decoration="top">
      <h3 className="text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
        Investments per month
      </h3>
      <TabGroup>
        <TabList variant="line" defaultValue="1">
          <Tab value="1">EUR €</Tab>
          <Tab value="2">USD $</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <BarChartDividends currency="€" />
          </TabPanel>
          <TabPanel>
            <BarChartDividends currency="$" />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </Card>
  )
}
