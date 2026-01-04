import { BarChart, Card, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react"
import { useBoundStore } from "@/store"
import { useMemo } from "react"
import { currencyFormatter } from "@/services/utils"
import { Skeleton } from "@/components/ui/Skeleton"

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

    const recentBuys = invWithDate
      .filter(({ date }) => date.getFullYear() === year || date.getFullYear() - 1)
      .filter((inv) => inv.currency === currency)

    const currInv = recentBuys.filter(({ isDividendReinvestment }) => !isDividendReinvestment)
    const currReInv = recentBuys.filter(({ isDividendReinvestment }) => isDividendReinvestment)

    // @ts-expect-error: Don't know how to type it
    const barData = []
    for (let i = 0; i < MONTHS.length; i++) {
      barData.push({
        date: MONTHS[i],
        [`${year} invested`]: 0,
        [`${year - 1} invested`]: 0,
        [`${year} reinvested`]: 0,
        [`${year - 1} reinvested`]: 0,
      })
    }
    currInv.forEach(({ date, amount }) => {
      // @ts-expect-error: Don't know how to type it
      barData[date.getMonth()][`${date.getFullYear()} invested`] += amount
    })

    currReInv.forEach(({ date, amount }) => {
      // @ts-expect-error: Don't know how to type it
      barData[date.getMonth()][`${date.getFullYear()} reinvested`] += amount
    })

    return barData
  }, [buys, currency, loading])

  if (!loading && buys.length === 0)
    return (
      <div className="flex flex-row justify-center align-middle">
        <p className="text-tremor-content dark:text-dark-tremor-content">No buys registered</p>
      </div>
    )

  if (loading)
    return (
      <div className="flex grid h-96 w-full grid-cols-12">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={`invested-per-month-loading-${i}`} className="mx-1 flex h-full flex-row items-end gap-1 py-4">
            <Skeleton width={10} height={"100%"} />
            <Skeleton width={10} height={"80%"} />
            <Skeleton width={10} height={"60%"} />
            <Skeleton width={10} height={"40%"} />
          </div>
        ))}
      </div>
    )

  return (
    <BarChart
      className="mt-6"
      data={data}
      index="date"
      categories={[`${year - 1} invested`, `${year} invested`, `${year - 1} reinvested`, `${year} reinvested`]}
      colors={["gray", "blue", "teal", "green"]}
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
