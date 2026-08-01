import { useBoundStore } from "@/store"
import { CurrencyType } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { RiDashboard3Line } from "@remixicon/react"

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
    <Card className="mx-auto flex max-w-md flex-col items-center gap-8 text-center">
      <CardHeader className="items-center">
        <RiDashboard3Line className="mb-2 size-12 text-primary" />
        <CardTitle className="text-4xl font-normal tracking-tight">Portfolio Analyzer</CardTitle>
      </CardHeader>

      <CardContent className="flex max-w-xs flex-col gap-4 text-muted-foreground">
        <p>
          Portfolio Analyzer supports adding buys using different currencies, but assets are all displayed with the{" "}
          <b className="text-foreground">same currency</b>. Select the main currency here:
        </p>
        <div className="flex flex-row items-center justify-center gap-4">
          {(["€", "$"] as const).map((curr) => (
            <Badge
              key={curr}
              variant={mainCurrency === curr ? "default" : "outline"}
              className={cn(
                "cursor-pointer px-8 py-2 text-base font-bold transition-all",
                mainCurrency === curr && "scale-110 ring-2 ring-ring",
              )}
              onClick={() => handleUpdateCurrency(curr)}
            >
              {curr}
            </Badge>
          ))}
        </div>
        <Button onClick={() => setInSettingsScreen(false)}>Go to Dashboard</Button>
      </CardContent>
    </Card>
  )
}
