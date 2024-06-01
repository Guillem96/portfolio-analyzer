import AssetDonut from "@/components/AssetDonut"
import { Card, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react"

interface VariableFixDonutProps {
  className?: string
}

export const VariableFixDonut = ({ className = "" }: VariableFixDonutProps) => {
  return (
    <Card className={className}>
      <h1 className="mb-4 max-w-2xl text-3xl tracking-tight text-slate-900 dark:text-neutral-300">
        Total asset value by income type
      </h1>
      <TabGroup>
        <TabList variant="line" defaultValue="1">
          <Tab value="1">EUR €</Tab>
          <Tab value="2">USD $</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <AssetDonut by="isFixIncome" currency="€" />
          </TabPanel>
          <TabPanel>
            <AssetDonut by="isFixIncome" currency="$" />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </Card>
  )
}
