import { Button, DatePicker, DatePickerValue, NumberInput, Select, SelectItem } from "@tremor/react"
import { RiMoneyEuroBoxFill } from "@remixicon/react"
import { useState } from "react"
import { useBoundStore } from "@/store"

export default function InvestmentForm() {
  const [loading, addInvestment] = useBoundStore((state) => [state.investmentLoading, state.addInvestment])
  const [selectedDate, setSelectedDate] = useState<number>(Date.now())

  const handleInvestmentCreation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return

    const data = new FormData(event.currentTarget)
    if (selectedDate == null) return

    const currency = data.get("currency")?.toString() ?? ""
    if (currency !== "€" && currency !== "$") return

    const amount = Number(data.get("amount")?.toString() ?? "")
    if (isNaN(amount)) return

    addInvestment({
      amount,
      currency,
      date: selectedDate,
    })
  }

  const handleDateChange = (value: DatePickerValue) => {
    setSelectedDate(value?.getTime() ?? Date.now())
  }

  return (
    <>
      <form onSubmit={handleInvestmentCreation}>
        <div className="flex flex-col md:flex-row justify-center gap-2">
          <NumberInput
            name="amount"
            disabled={loading}
            icon={RiMoneyEuroBoxFill}
            min={20}
            defaultValue={400}
            placeholder="Amount..."
          />
          <Select name="currency" disabled={loading} defaultValue="$">
            <SelectItem value="€">€</SelectItem>
            <SelectItem value="$">$</SelectItem>
          </Select>

          <DatePicker onValueChange={handleDateChange} disabled={loading} defaultValue={new Date(Date.now())} />
          <Button type="submit" loading={loading}>
            Add Investment
          </Button>
        </div>
      </form>
    </>
  )
}
