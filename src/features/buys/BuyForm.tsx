import { Button, DatePicker, DatePickerValue, Select, SelectItem, TextInput } from "@tremor/react"
import { RiMoneyEuroBoxFill } from "@remixicon/react"
import { useState } from "react"
import { useBoundStore } from "@/store"
import { fetchTicker } from "@/services/ticker"
import { format } from "date-fns"

export default function BuyForm() {
  const [loading, addBuy, forceLoadingBuys] = useBoundStore((state) => [
    state.buysLoading,
    state.addBuy,
    state.forceLoadingBuys,
  ])
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))

  const [amountErrorMessage, setAmountErrorMessage] = useState<string | null>(null)
  const [unitsErrorMessage, setUnitsErrorMessage] = useState<string | null>(null)

  const [tickerError, setTickerError] = useState<string | null>(null)

  const handleBuyCreation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return
    const data = new FormData(event.currentTarget)

    forceLoadingBuys(true)
    const ticker = data.get("ticker")?.toString() ?? ""
    if (ticker === "" || (await fetchTicker(ticker)) == null) {
      setTickerError(`${ticker} not found in Yahoo Finance`)
      forceLoadingBuys(false)
      return
    }

    if (selectedDate == null) {
      forceLoadingBuys(false)
      return
    }

    const currency = data.get("currency")?.toString() ?? ""
    if (currency !== "€" && currency !== "$") {
      forceLoadingBuys(false)
      return
    }
    const isDividendReinvestment = (data.get("is-dividend-reinvestment")?.toString() ?? "") == "yes"

    const amount = Number(data.get("amount")?.toString() ?? "")
    if (isNaN(amount)) {
      setAmountErrorMessage("Invalid number")
      forceLoadingBuys(false)
      return
    }

    const units = Number(data.get("units")?.toString() ?? "")
    if (isNaN(units)) {
      forceLoadingBuys(false)
      setUnitsErrorMessage("Invalid number")
      return
    }

    setAmountErrorMessage(null)
    setTickerError(null)
    setUnitsErrorMessage(null)

    addBuy({
      units,
      ticker,
      amount,
      currency,
      isDividendReinvestment,
      date: selectedDate,
    })
  }

  const handleDateChange = (value: DatePickerValue) => {
    setSelectedDate(format(value ?? new Date(), "yyyy-MM-dd"))
  }

  return (
    <>
      <form onSubmit={handleBuyCreation}>
        <div className="mx-auto flex flex-col justify-center gap-x-2 gap-y-4 md:grid md:grid-cols-3">
          <div className="max-w-xs">
            <label htmlFor="ticker" className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              Ticker
            </label>
            <TextInput
              id="ticker"
              name="ticker"
              disabled={loading}
              placeholder="TEF.MC"
              error={tickerError != null}
              errorMessage={tickerError ?? ""}
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
          <div className="relative min-h-[2em] max-w-xs">
            <Select name="currency" className="absolute bottom-0 max-w-8" disabled={loading} defaultValue="€">
              <SelectItem value="€">€</SelectItem>
              <SelectItem value="$">$</SelectItem>
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
              placeholder="# Shares"
              error={unitsErrorMessage != null}
              errorMessage={unitsErrorMessage ?? ""}
            />
          </div>
          <div className="max-w-xs">
            <label htmlFor="amount" className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              Is Re-investment?
            </label>
            <Select name="is-dividend-reinvestment" disabled={loading} defaultValue="no">
              <SelectItem value="no">❌ No</SelectItem>
              <SelectItem value="yes">✅ Yes</SelectItem>
            </Select>
          </div>
          <div className="max-w-xs">
            <label className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              Transaction date
            </label>
            <DatePicker onValueChange={handleDateChange} disabled={loading} defaultValue={new Date(Date.now())} />
          </div>
        </div>
        <Button type="submit" className="m-auto mt-4 w-full" loading={loading}>
          Add Investment
        </Button>
      </form>
    </>
  )
}
