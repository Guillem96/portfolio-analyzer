import { Button, DatePicker, DatePickerValue, Select, SelectItem, TextInput } from "@tremor/react"
import { RiMoneyEuroBoxFill } from "@remixicon/react"
import { useMemo, useState } from "react"
import { useBoundStore } from "@/store"
import { format } from "date-fns"

export default function SellForm() {
  const [loading, addSell, assets, forceLoadingSells] = useBoundStore((state) => [
    state.sellsLoading,
    state.addSell,
    state.assets,
    state.forceLoadingSells,
  ])
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [selectedTicker, setSelectedTicker] = useState<string>("")
  const [selectedUnits, setSelectedUnits] = useState<string>("")

  const assetsTickersToUnits = useMemo(
    () => Object.fromEntries(assets.map((asset) => [asset.ticker.ticker, asset.units])),
    [assets],
  )

  const [amountErrorMessage, setAmountErrorMessage] = useState<string | null>(null)
  const [unitsErrorMessage, setUnitsErrorMessage] = useState<string | null>(null)
  const [feesErrorMessage, setFeesErrorMessage] = useState<string | null>(null)
  const [tickerError, setTickerError] = useState<string | null>(null)

  const handleSellCreation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return
    const data = new FormData(event.currentTarget)

    forceLoadingSells(true)

    const units = Number(selectedUnits)
    if (isNaN(units)) {
      forceLoadingSells(false)
      setUnitsErrorMessage("Invalid number")
      return
    }

    const ticker = selectedTicker
    if (ticker === "" || assetsTickersToUnits[ticker] === null || assetsTickersToUnits[ticker] === undefined) {
      setTickerError(`${ticker} not available in your assets`)
      forceLoadingSells(false)
      return
    }

    if (assetsTickersToUnits[ticker] < units) {
      setUnitsErrorMessage(`You don't have ${units} units of ${ticker}`)
      forceLoadingSells(false)
      return
    }

    if (selectedDate == null) {
      forceLoadingSells(false)
      return
    }

    const currency = data.get("currency")?.toString() ?? ""
    if (currency !== "€" && currency !== "$") {
      forceLoadingSells(false)
      return
    }

    const amount = Number(data.get("amount")?.toString() ?? "")
    if (isNaN(amount)) {
      setAmountErrorMessage("Invalid number")
      forceLoadingSells(false)
      return
    }

    const fees = Number(data.get("fees")?.toString() ?? "")
    if (isNaN(fees)) {
      setFeesErrorMessage("Invalid number")
      forceLoadingSells(false)
      return
    }

    setAmountErrorMessage(null)
    setTickerError(null)
    setUnitsErrorMessage(null)

    addSell({
      units,
      ticker,
      amount,
      currency,
      date: selectedDate,
      fees,
    })
  }

  const handleDateChange = (value: DatePickerValue) => {
    setSelectedDate(format(value ?? new Date(), "yyyy-MM-dd"))
  }

  return (
    <>
      <form onSubmit={handleSellCreation}>
        <div className="mx-auto flex flex-col justify-center gap-x-2 gap-y-4 md:grid md:grid-cols-3">
          <div className="max-w-xs">
            <label htmlFor="ticker" className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              Ticker
            </label>
            <TextInput
              id="ticker"
              name="ticker"
              value={selectedTicker}
              disabled={loading}
              placeholder="TEF.MC"
              error={tickerError != null}
              errorMessage={tickerError ?? ""}
              onChange={(e) => setSelectedTicker(e.target.value)}
            />
          </div>
          <div className="max-w-xs">
            <label htmlFor="amount" className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              Amount
            </label>
            <TextInput
              id="amount"
              name="amount"
              disabled={loading}
              icon={RiMoneyEuroBoxFill}
              defaultValue={"400"}
              placeholder="Amount..."
              error={amountErrorMessage != null}
              errorMessage={amountErrorMessage ?? ""}
            />
          </div>
          <div className="max-w-xs">
            <label htmlFor="fees" className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              Fees
            </label>
            <TextInput
              id="fees"
              name="fees"
              disabled={loading}
              icon={RiMoneyEuroBoxFill}
              defaultValue={"0"}
              placeholder="Fees..."
              error={feesErrorMessage != null}
              errorMessage={feesErrorMessage ?? ""}
            />
          </div>
          <div className="relative min-h-[2em] max-w-xs">
            <Select name="currency" className="absolute bottom-0 max-w-8" disabled={loading} defaultValue="€">
              <SelectItem value="€">€</SelectItem>
              <SelectItem value="$">$</SelectItem>
              <SelectItem value="£">£</SelectItem>
            </Select>
          </div>
          <div className="max-w-xs">
            <label htmlFor="units" className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              Num. Shares
            </label>
            <TextInput
              id="units"
              name="units"
              disabled={loading}
              value={selectedUnits}
              onChange={(e) => setSelectedUnits(e.target.value)}
              placeholder="# Shares"
              error={unitsErrorMessage != null}
              errorMessage={unitsErrorMessage ?? ""}
            />
          </div>
          <div className="max-w-xs">
            <label className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              Transaction date
            </label>
            <DatePicker onValueChange={handleDateChange} disabled={loading} defaultValue={new Date(Date.now())} />
          </div>
        </div>

        <Button type="submit" className="m-auto mt-4 w-full" loading={loading}>
          Add Sell
        </Button>

        <Button
          type="button"
          variant="light"
          className="m-auto mt-4 w-full"
          disabled={loading}
          onClick={() => {
            const ticker = selectedTicker
            if (ticker && assetsTickersToUnits[ticker]) {
              setSelectedUnits(assetsTickersToUnits[ticker].toString())
            }
          }}
        >
          Sell all units
        </Button>
      </form>
    </>
  )
}
