import { BarChart, Card, Icon, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react"
import { useBoundStore } from "@/store"
import { RiTimeLine } from "@remixicon/react"
import { currencyFormatter } from "@/services/utils"
import { useDividedsStats } from "@/hooks/dividends"

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
