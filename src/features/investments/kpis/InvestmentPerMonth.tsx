import { BarChart, Card, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react"
import { useBoundStore } from "@/store"
import { useMemo } from "react"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
interface BarChartProps {
  currency: "€" | "$"
}

const BarChartInvestments = ({ currency }: BarChartProps) => {
  const investments = useBoundStore((state) => state.investments)
  const year = new Date().getFullYear()

  const data = useMemo(() => {
    const invWithDate = investments.map((inv) => {
      return { ...inv, date: new Date(inv.date) }
    })
    const currInv = invWithDate
      .filter((inv) => inv.currency === currency)
      .filter(({ date }) => date.getFullYear() === year || date.getFullYear() - 1)

    const barData = MONTHS.map((month) => ({ date: month, [year]: 0, [year - 1]: 0 }))

    currInv.forEach(({ date, amount }) => {
      barData[date.getMonth()][date.getFullYear()] += amount
    })

    return barData
  }, [investments, currency])

  return (
    <BarChart
      className="mt-6"
      data={data}
      index="date"
      categories={[(year - 1).toString(), year.toString()]}
      colors={["gray", "blue"]}
      yAxisWidth={30}
    />
  )
}

export default function InvestmentPerMonth() {
  return (
    <Card decoration="top">
      <h3 className="text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
        Investments per month
      </h3>
      <TabGroup>
        <TabList variant="line" defaultValue="1">
          <Tab value="1">USD $</Tab>
          <Tab value="2">EUR €</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <BarChartInvestments currency="$" />
          </TabPanel>
          <TabPanel>
            <BarChartInvestments currency="€" />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </Card>
  )
}
