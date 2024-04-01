import { Button, NumberInput, Select, SelectItem, Switch, TextInput } from "@tremor/react"
import { RiMoneyEuroBoxFill } from "@remixicon/react"
import { useBoundStore } from "@/store"
import { useState } from "react"
import { Risk } from "@/types.d"
import RiskBadge from "@/components/Risk"

interface ErrorMessages {
  name?: string | null
  amount?: string | null
}

export default function AssetForm() {
  const [loading, addAsset] = useBoundStore((state) => [state.assetsLoading, state.addAsset])
  const [isFixIncome, setIsFixIncome] = useState(false)
  const [risk, setRisk] = useState(Risk.LOW_RISK)
  const [errorMessages, setErrorMessages] = useState<ErrorMessages>({
    name: null,
  })

  const handleAssetCreation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (loading) return
    const errors: ErrorMessages = {}
    const data = new FormData(event.currentTarget)

    const name = data.get("asset-name")?.toString() ?? ""
    if (name === "") errors.name = "Name is required"

    const currency = data.get("asset-currency")?.toString() ?? ""
    if (currency !== "€" && currency !== "$") return

    const value = Number(data.get("asset-value")?.toString() ?? "")
    if (isNaN(value)) errors.amount = "Invalid number"
    if (value < 0) errors.amount = "Negative number not accepted"

    const tag = data.get("asset-tag")?.toString() ?? ""

    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors)
      return
    }

    setErrorMessages({})
    addAsset({
      name,
      value,
      currency,
      tag,
      risk,
      isFixIncome,
    }).then(() => {
      const $assetName = document.getElementById("asset-name") as HTMLInputElement
      $assetName.value = ""

      const $assetValue = document.getElementById("asset-value") as HTMLInputElement
      $assetValue.value = "400"
    })
  }

  return (
    <>
      <form onSubmit={handleAssetCreation}>
        <div className="flex flex-col md:grid md:grid-cols-3 gap-x-2 gap-y-4 justify-center">
          <div className="max-w-xs">
            <label
              htmlFor="asset-name"
              className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
            >
              Name
            </label>
            <TextInput
              error={errorMessages.name != null}
              errorMessage={errorMessages.name ?? ""}
              disabled={loading}
              id="asset-name"
              name="asset-name"
              placeholder="Asset Name..."
            />
          </div>
          <div className="max-w-xs">
            <label
              htmlFor="asset-value"
              className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
            >
              Value
            </label>
            <NumberInput
              id="asset-value"
              name="asset-value"
              disabled={loading}
              icon={RiMoneyEuroBoxFill}
              defaultValue={400}
              placeholder="Amount..."
              error={errorMessages.amount != null}
              errorMessage={errorMessages.amount ?? ""}
            />
          </div>
          <div className="max-w-xs">
            <label
              htmlFor="asset-currency"
              className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
            >
              Currency
            </label>
            <Select id="asset-currency" name="asset-currency" disabled={loading} defaultValue="$">
              <SelectItem value="€">€</SelectItem>
              <SelectItem value="$">$</SelectItem>
            </Select>
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="asset-is-fix"
              disabled={loading}
              name="asset-is-fix"
              checked={isFixIncome}
              onChange={setIsFixIncome}
            />
            <label
              htmlFor="asset-is-fix"
              className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
            >
              Is Fix income?
            </label>
          </div>

          <div className="max-w-xs">
            <label className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">Risk</label>
            <div className="uppercase flex flex-row gap-x-4">
              {[Risk.LOW_RISK, Risk.MEDIUM_RISK, Risk.HIGH_RISK].map((r) => (
                <RiskBadge
                  key={r}
                  risk={r}
                  className={(r == risk ? "scale-125 ring-4" : "") + " hover:cursor-pointer transition-all"}
                  onClick={setRisk}
                />
              ))}
            </div>
          </div>
          <div className="max-w-xs">
            <label
              htmlFor="asset-tag"
              className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
            >
              Tag (optional)
            </label>
            <TextInput id="asset-tag" disabled={loading} name="asset-tag" placeholder="crypto" />
          </div>
          <div className="w-full text-center md:col-span-3">
            <Button type="submit" className="mx-auto w-full max-w-96" loading={loading}>
              {loading ? "Creating asset..." : "Add Asset"}
            </Button>
          </div>
        </div>
      </form>
    </>
  )
}
