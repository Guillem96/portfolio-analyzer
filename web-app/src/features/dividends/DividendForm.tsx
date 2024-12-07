import { Button, DatePicker, DatePickerValue, NumberInput, Select, SelectItem, TextInput } from "@tremor/react"
import { RiMoneyEuroBoxFill, RiPercentLine } from "@remixicon/react"
import { useBoundStore } from "@/store"
import { useEffect, useState } from "react"
import { Country } from "@/types.d"
import { COUNTRY_EMOJI } from "@/constants"
import { format } from "date-fns"

export default function DividendForm() {
  const [loading, selectedDividend, addDividend] = useBoundStore((state) => [
    state.dividendLoading,
    state.selectedDividend,
    state.addDividend,
  ])
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [amountErrorMessage, setAmountErrorMessage] = useState<string | null>()
  const [country, setCountry] = useState<Country>(Country.ES)

  const handleDividendCreation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (loading) return
    if (selectedDate == null) return

    const data = new FormData(event.currentTarget)

    const company = data.get("dividend-from")?.toString() ?? ""
    if (company.length < 1) return

    const currency = data.get("dividend-currency")?.toString() ?? ""
    if (currency !== "€" && currency !== "$") return

    const amount = Number(data.get("dividend-value")?.toString() ?? "")
    if (isNaN(amount)) {
      setAmountErrorMessage("Invalid number")
      return
    }

    const doubleTaxationOrigin = Number(data.get("dividend-tax-origin")?.toString() ?? "")
    const doubleTaxationDestination = Number(data.get("dividend-tax-dest")?.toString() ?? "")

    if (isNaN(amount)) {
      setAmountErrorMessage("Invalid number")
      return
    }

    setAmountErrorMessage(null)
    addDividend({
      company,
      amount,
      currency,
      country,
      doubleTaxationOrigin,
      doubleTaxationDestination,
      date: selectedDate,
      isReinvested: false,
    })
  }

  const handleDateChange = (value: DatePickerValue) => {
    setSelectedDate(format(value ?? new Date(), "yyyy-MM-dd"))
  }

  useEffect(() => {
    if (selectedDividend === null) return
    const $ = (sel: string) => document.querySelector(sel)

    const $companyInp = $("#dividend-from") as HTMLInputElement
    $companyInp.value = selectedDividend.company

    const $valueInp = $("#dividend-value") as HTMLInputElement
    $valueInp.value = selectedDividend.amount.toFixed(2)

    const $taxOriginInp = $("#dividend-tax-origin") as HTMLInputElement
    $taxOriginInp.value = selectedDividend.doubleTaxationOrigin.toString()

    const $taxDestInp = $("#dividend-tax-dest") as HTMLInputElement
    $taxDestInp.value = selectedDividend.doubleTaxationDestination.toString()

    const $currencySel = $("#dividend-currency") as HTMLSelectElement
    $currencySel.value = selectedDividend.currency

    setCountry(selectedDividend.country)
  }, [selectedDividend])

  return (
    <>
      <form onSubmit={handleDividendCreation}>
        <div className="flex flex-col justify-center gap-x-2 gap-y-4 md:grid md:grid-cols-3">
          <div className="max-w-xs">
            <label
              htmlFor="dividend-from"
              className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
            >
              Company
            </label>
            <TextInput
              minLength={2}
              disabled={loading}
              id="dividend-from"
              name="dividend-from"
              placeholder="Who pays the dividend?"
            />
          </div>
          <div className="max-w-xs">
            <label
              htmlFor="dividend-value"
              className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
            >
              Value
            </label>
            <TextInput
              id="dividend-value"
              name="dividend-value"
              disabled={loading}
              icon={RiMoneyEuroBoxFill}
              defaultValue={"400"}
              placeholder="Amount..."
              error={amountErrorMessage != null}
              errorMessage={amountErrorMessage ?? ""}
            />
          </div>

          <div className="max-w-xs">
            <label
              htmlFor="dividend-tax-origin"
              className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
            >
              Tax Origin (%)
            </label>
            <NumberInput
              id="dividend-tax-origin"
              name="dividend-tax-origin"
              disabled={loading}
              icon={RiPercentLine}
              defaultValue={15}
              min={0}
              max={100}
              placeholder="%"
            />
          </div>
          <div className="max-w-xs">
            <label
              htmlFor="dividend-tax-dest"
              className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
            >
              Tax Dest (%)
            </label>
            <NumberInput
              id="dividend-tax-dest"
              name="dividend-tax-dest"
              disabled={loading}
              icon={RiPercentLine}
              defaultValue={15}
              min={0}
              max={100}
              placeholder="%"
            />
          </div>
          <div className="max-w-xs">
            <label
              htmlFor="dividend-currency"
              className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
            >
              Currency
            </label>
            <Select id="dividend-currency" name="dividend-currency" disabled={loading} defaultValue="€">
              <SelectItem value="€">€</SelectItem>
              <SelectItem value="$">$</SelectItem>
            </Select>
          </div>

          <div className="max-w-xs">
            <label htmlFor="country" className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              Country
            </label>
            <Select
              id="country"
              value={country}
              onValueChange={(c) => setCountry(c as Country)}
              name="country"
              defaultValue={Country.ES}
              disabled={loading}
            >
              {Object.entries(COUNTRY_EMOJI).map(([country, emoji]) => (
                <SelectItem key={country} value={country}>
                  {emoji} {country}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="max-w-xs">
            <label
              htmlFor="dividend-date"
              className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
            >
              Payment date
            </label>
            <DatePicker
              className="mt-2"
              id="dividend-date"
              onValueChange={handleDateChange}
              disabled={loading}
              defaultValue={new Date(Date.now())}
            />
          </div>
          <div className="w-full text-center md:col-span-3">
            <Button type="submit" className="mx-auto w-full max-w-96" loading={loading}>
              {loading ? "Adding dividend..." : "Add Dividend"}
            </Button>
          </div>
        </div>
      </form>
    </>
  )
}
