import AssetDonut from "@/components/AssetDonut"
import { RISK_COLOR } from "@/constants"
import { Card, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react"

interface RiskDonutProps {
  className?: string
}

export default function RiskDonut({ className = "" }: RiskDonutProps) {
  return (
    <Card className={className}>
      <h1 className="mb-4 max-w-2xl text-3xl tracking-tight text-slate-900 dark:text-neutral-300">
        Total asset value by risk
      </h1>
      <div className="max-w-lg"></div>
      <TabGroup>
        <TabList variant="line" defaultValue="1">
          <Tab value="1">USD $</Tab>
          <Tab value="2">EUR €</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <AssetDonut by="risk" colorMapping={RISK_COLOR} currency="$" />
          </TabPanel>
          <TabPanel>
            <AssetDonut by="risk" colorMapping={RISK_COLOR} currency="€" />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </Card>
  )
}
