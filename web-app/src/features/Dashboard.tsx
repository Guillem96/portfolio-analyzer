import AssetsCard from "@features/assets"
import DividendCard from "@features/dividends"
import { InvestmentEurTotalAmount, InvestmentUsdTotalAmount, BuysCount, InvestedPerMonth } from "@/features/buys/kpis"
import { TotalAssetValue, AssetBarList, CountryDonut, SectorDonut, AssetsCount } from "@features/assets/kpis"
import {
  DividendsPerYear,
  ExpectedDividendsEarningsNextYear,
  PctDividendsOverAssetValue,
  PctDividendsOverBuys,
  RemainingDividendsYear,
  TotalDividendEarnings,
  UpcomingDividends,
} from "@features/dividends/kpis"
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react"
import { RiDashboard3Line } from "@remixicon/react"
import BuysCard from "@/features/buys"
import EventCalendar from "@/components/EventCalendar"

const DividendsTab = () => (
  <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
    <DividendCard />
    <div className="flex flex-col gap-2">
      <DividendsPerYear />
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <TotalDividendEarnings />
        <RemainingDividendsYear />
        <ExpectedDividendsEarningsNextYear />
        <PctDividendsOverAssetValue />
        <PctDividendsOverBuys />
      </div>
    </div>
    <div className="lg:col-span-2">
      <UpcomingDividends />
    </div>
  </div>
)

const AssetsTab = () => (
  <>
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      <AssetsCard />
      <div className="flex flex-col gap-2">
        <AssetBarList />
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          <TotalAssetValue />
          <AssetsCount />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-2 pt-2 lg:grid-cols-3">
      <CountryDonut />
      <SectorDonut />
    </div>
  </>
)

const BuysTab = () => (
  <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
    <BuysCard />
    <div className="flex flex-col gap-2">
      <InvestedPerMonth />
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
        <BuysCount />
        <InvestmentEurTotalAmount />
        <InvestmentUsdTotalAmount />
      </div>
    </div>
  </div>
)

export default function Dashboard() {
  return (
    <div className="mx-auto w-full p-4">
      <div className="flex flex-col items-center justify-center gap-2 py-2 text-slate-900 dark:text-neutral-300 md:flex-row">
        <RiDashboard3Line className="hidden md:block" size={64} />
        <RiDashboard3Line className="inline md:hidden" size={40} />
        <h1 className="text-4xl font-extralight md:text-6xl">Portfolio Analyzer</h1>
      </div>
      <TabGroup className="mt-2 text-center">
        <TabList className="my-4" variant="solid" defaultValue="1">
          <Tab value="1">Investements</Tab>
          <Tab value="2">Assets</Tab>
          <Tab value="3">Dividends</Tab>
          <Tab value="4">Events</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <BuysTab />
          </TabPanel>
          <TabPanel>
            <AssetsTab />
          </TabPanel>
          <TabPanel>
            <DividendsTab />
          </TabPanel>
          <TabPanel>
            <EventCalendar />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  )
}
