import { BarChart, Card, Icon, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react"
import { useBoundStore } from "@/store"
import { useMemo } from "react"
import { RiTimeLine } from "@remixicon/react"
import { currencyFormatter } from "@/services/utils"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
interface BarChartProps {
  currency: "€" | "$"
}

const BarChartBuys = ({ currency }: BarChartProps) => {
  const [buys, loading, privateMode] = useBoundStore((state) => [state.buys, state.buysLoading, state.privateMode])

  const year = new Date().getFullYear()
  const data = useMemo(() => {
    if (loading) return []

    const invWithDate = buys.map((inv) => {
      return { ...inv, date: new Date(inv.date) }
    })
    const currInv = invWithDate
      .filter((inv) => inv.currency === currency)
      .filter(({ isDividendReinvestment }) => !isDividendReinvestment)
      .filter(({ date }) => date.getFullYear() === year || date.getFullYear() - 1)

    const barData = MONTHS.map((month) => ({ date: month, [year]: 0, [year - 1]: 0 }))

    currInv.forEach(({ date, amount }) => {
      barData[date.getMonth()][date.getFullYear()] += amount
    })

    return barData
  }, [buys, currency, loading])

  if (loading)
    return (
      <div className="flex flex-row justify-center align-middle">
        <Icon icon={RiTimeLine} />
        <p className="text-tremor-content dark:text-dark-tremor-content">Loading...</p>
      </div>
    )

  if (buys.length === 0)
    return (
      <div className="flex flex-row justify-center align-middle">
        <p className="text-tremor-content dark:text-dark-tremor-content">No buys registered</p>
      </div>
    )

  return (
    <BarChart
      className="mt-6"
      data={data}
      index="date"
      categories={[(year - 1).toString(), year.toString()]}
      colors={["gray", "blue"]}
      yAxisWidth={30}
      valueFormatter={(val) => currencyFormatter(val, currency, privateMode)}
    />
  )
}

export default function InvestedPerMonth() {
  return (
    <Card decoration="top">
      <h3 className="text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
        Investment per month
      </h3>
      <TabGroup>
        <TabList variant="line" defaultValue="1">
          <Tab value="1">EUR €</Tab>
          <Tab value="2">USD $</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <BarChartBuys currency="€" />
          </TabPanel>
          <TabPanel>
            <BarChartBuys currency="$" />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </Card>
  )
}
