import AssetsCard from "@features/assets"
import InvestmentsCard from "@features/investments"
import InvestmentCount from "@features/investments/kpis/InvestmentCount"
import { InvestmentEurTotalAmount, InvestmentUsdTotalAmount } from "@features/investments/kpis/InvestmentTotalAmount"
import { TotalAssetEUR, TotalAssetUSD } from "@features/assets/kpis/TotalAssetValue"
import { VariableFixDonut } from "@features/assets/kpis/VariableFixDonut"
import AssetBarList from "@features/assets/kpis/AssetBarList"
import RiskDonut from "@features/assets/kpis/RiskDonut"
import TagDonut from "@features/assets/kpis/TagDonut"

export default function Dashboard() {
  return (
    <div className="mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-2 antialiased">
      <InvestmentsCard />
      <AssetsCard />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <InvestmentCount />
        <InvestmentEurTotalAmount />
        <InvestmentUsdTotalAmount />
        <VariableFixDonut className="lg:col-span-3" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <TotalAssetEUR />
        <TotalAssetUSD />
        <AssetBarList className="col-span-2" />
      </div>
      <RiskDonut />
      <TagDonut />
    </div>
  )
}
