import AssetsCard from "@features/assets"
import InvestmentsCard from "@features/investments"
import DividendCard from "@features/dividends"
import {
  InvestmentEurTotalAmount,
  InvestmentUsdTotalAmount,
  InvestmentCount,
  InvestmentPerMonth,
} from "@features/investments/kpis"
import {
  TotalAssetEUR,
  TotalAssetUSD,
  VariableFixDonut,
  AssetBarList,
  RiskDonut,
  TagDonut,
} from "@features/assets/kpis"
import { TotalDividendEarningsEUR, TotalDividendEarningsUSD } from "@features/dividends/kpis"
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react"
import { RiDashboard3Line } from "@remixicon/react"

export default function Dashboard() {
  return (
    <div className="mx-auto w-full p-4">
      <div className="flex flex-row items-center justify-center py-8 gap-x-4 text-slate-900 dark:text-neutral-300">
        <RiDashboard3Line size={64} />
        <h1 className="text-center text-6xl font-extralight">Portfolio Analyzer</h1>
      </div>
      <TabGroup className="text-center">
        <TabList className="my-4" variant="solid" defaultValue="1">
          <Tab value="1">Investements</Tab>
          <Tab value="2">Assets</Tab>
          <Tab value="3">Dividends</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <InvestmentsCard />
              <div className="flex flex-col gap-2">
                <InvestmentPerMonth />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                  <InvestmentCount />
                  <InvestmentEurTotalAmount />
                  <InvestmentUsdTotalAmount />
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <AssetsCard />
              <div className="flex flex-col gap-2">
                <AssetBarList />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <TotalAssetEUR />
                  <TotalAssetUSD />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 pt-2 gap-2">
              <VariableFixDonut />
              <RiskDonut />
              <TagDonut />
            </div>
          </TabPanel>
          <TabPanel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <DividendCard />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <TotalDividendEarningsEUR />
                <TotalDividendEarningsUSD />
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  )
}
