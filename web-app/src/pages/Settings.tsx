import { useBoundStore } from "@/store"
import { CurrencyType } from "@/types"
import { RiDashboard3Line } from "@remixicon/react"
import { Badge, Button, Card, Icon } from "@tremor/react"

export default function Settings() {
  const [mainCurrency, setInSettingsScreen, updatePreferences] = useBoundStore((state) => [
    state.mainCurrency,
    state.setInSettingsScreen,
    state.updatePreferences,
  ])

  const handleUpdateCurrency = (currency: CurrencyType) => {
    updatePreferences(currency)
  }

  return (
    <>
      <Card className="mx-auto flex max-w-md flex-col items-center justify-center gap-y-8 text-center">
        <div>
          <Icon size="xl" icon={RiDashboard3Line} className="mb-2 scale-150" />
          <h1 className="text-4xl tracking-tight text-slate-900 dark:text-neutral-300">Portfolio Analyzer</h1>
        </div>

        <div className="max-w-xs text-tremor-content dark:text-dark-tremor-content">
          <div className="flex flex-col">
            <p>
              Portfolio Analyzer supports adding buys using different currencies, but assets are all displayed with the{" "}
              <b>same currency</b>. Select the main currency here:
            </p>
            <div className="flex flex-row items-center justify-center gap-x-4">
              {["€", "$"].map((curr) => (
                <Badge
                  key={curr}
                  className={`${mainCurrency == curr ? "scale-125 ring-4" : ""} my-4 px-8 py-2 text-center font-bold transition-all hover:cursor-pointer`}
                  color={curr}
                  onClick={() => handleUpdateCurrency(curr as CurrencyType)}
                >
                  {curr}
                </Badge>
              ))}
            </div>
            <Button variant="primary" onClick={() => setInSettingsScreen(false)}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </>
  )
}
