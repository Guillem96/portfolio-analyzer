import AssetsCard from "@features/assets"
import InvestmentsCard from "@features/investments"

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

export default function Dashboard() {
  return (
    <div className="mx-auto p-4 antialiased flex flex-col gap-y-2">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <VariableFixDonut />
        <RiskDonut />
        <TagDonut />
      </div>
    </div>
  )
}
