import Modal from "@/components/Modal"
import { COUNTRY_EMOJI } from "@/constants"
import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { Country, type CurrencyType, type Dividend } from "@/types.d"
import { RiFileChart2Line, RiSaveLine } from "@remixicon/react"
import { Button, Select, SelectItem } from "@tremor/react"
import { useMemo, useState } from "react"
import { usePDF } from "react-to-pdf"

function calculateReport(year: number, dividends: Dividend[], currency: CurrencyType) {
  const currentDividends = dividends
    .filter(({ date }) => new Date(date).getFullYear() === year)
    .filter((d) => d.currency === currency)
  const dividendsPerCountry = Object.groupBy(currentDividends, (div) => div.country)
  const grossPerCountry = Object.fromEntries(
    Object.entries(dividendsPerCountry).map(([country, dividends]) => {
      const gross = dividends.reduce((acc, div) => acc + div.amount, 0)
      return [country, gross]
    }),
  )
  const totalGross = Object.values(grossPerCountry).reduce((acc, gross) => acc + gross, 0)

  const spanishTaxesPerCountry = Object.fromEntries(
    Object.entries(dividendsPerCountry).map(([country, dividends]) => {
      if (country === Country.ES)
        return [
          country,
          dividends.reduce((acc, { amount, doubleTaxationOrigin }) => acc + (amount * doubleTaxationOrigin) / 100, 0),
        ]

      return [
        country,
        dividends.reduce(
          (acc, { amount, doubleTaxationDestination }) => acc + (amount * doubleTaxationDestination) / 100,
          0,
        ),
      ]
    }),
  )

  const spanishTaxes = Object.values(spanishTaxesPerCountry).reduce((acc, tax) => acc + tax, 0)

  const abrodTaxesPerCountry = Object.fromEntries(
    Object.entries(dividendsPerCountry).map(([country, dividends]) => {
      if (country === Country.ES) return [country, 0]

      return [
        country,
        dividends.reduce(
          (acc, { amount, doubleTaxationOrigin }) => acc + (amount * Math.min(doubleTaxationOrigin, 15)) / 100,
          0,
        ),
      ]
    }),
  )

  const abroadTaxesRemaining = Object.fromEntries(
    Object.entries(dividendsPerCountry).map(([country, dividends]) => {
      if (country === Country.ES) return [country, 0]

      return [
        country,
        dividends.reduce((acc, { amount, doubleTaxationOrigin }) => {
          if (doubleTaxationOrigin <= 15) return acc
          const taxRate = doubleTaxationOrigin - 15
          return acc + (amount * taxRate) / 100
        }, 0),
      ]
    }),
  )

  return {
    grossPerCountry,
    totalGross,
    spanishTaxesPerCountry,
    spanishTaxes,
    abrodTaxesPerCountry,
    abroadTaxesRemaining,
  }
}

export default function DividendsTaxReport() {
  const { toPDF, targetRef } = usePDF({ filename: "dividends-tax-report.pdf" })
  const [showModal, setShowModal] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())
  const [dividends, mainCurrency] = useBoundStore((state) => [state.dividends, state.mainCurrency])
  const availableYears = useMemo(() => {
    if (dividends.length === 0) return []
    return [...new Set(dividends.map((div) => new Date(div.date).getFullYear()))]
  }, [dividends])
  const report = useMemo(() => calculateReport(year, dividends, mainCurrency), [year, dividends, mainCurrency])
  console.log(report)
  const toggleModal = () => {
    setShowModal(!showModal)
  }

  return (
    <>
      <Button size="md" variant="light" className="hover:cursor-pointer" icon={RiFileChart2Line} onClick={toggleModal}>
        Tax Report
      </Button>
      <div className="fixed top-[10000000px]">
        <div className="p-8" ref={targetRef}>
          <h1 className="mb-8 text-6xl font-light">Dividends Tax Report</h1>

          <table className="table-auto rounded-md">
            <thead className="bg-slate-100 font-bold">
              <tr>
                <th className="p-2">Country</th>
                <th className="p-2">Gross</th>
                <th className="p-2">Spanish Taxes</th>
                <th className="p-2">Abroad Taxes</th>
                <th className="p-2">Abroad non-covered Taxes</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(report.grossPerCountry).map(([country, gross]) => (
                <tr key={country}>
                  <td className="p-2">{COUNTRY_EMOJI[country as Country]}</td>
                  <td className="p-2 text-right">{currencyFormatter(gross, mainCurrency, false)}</td>
                  <td className="p-2 text-right">
                    {currencyFormatter(report.spanishTaxesPerCountry[country], mainCurrency, false)}
                  </td>
                  <td className="p-2 text-right">
                    {currencyFormatter(report.abrodTaxesPerCountry[country], mainCurrency, false)}
                  </td>
                  <td className="p-2 text-right">
                    {currencyFormatter(report.abroadTaxesRemaining[country], mainCurrency, false)}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="p-2 font-bold">Total</td>
                <td className="p-2">{currencyFormatter(report.totalGross, mainCurrency, false)}</td>
                <td className="p-2">{currencyFormatter(report.spanishTaxes, mainCurrency, false)}</td>
                <td className="p-2"></td>
                <td className="p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <Modal show={showModal} handleClose={toggleModal}>
        <h2 className="mb-4 text-2xl text-slate-900 dark:text-neutral-300">Dividends Tax Report</h2>
        <p className="mb-4 text-tremor-content dark:text-dark-tremor-content">
          Select the year of the report you want to generate.
        </p>
        <div className="flex flex-row gap-2">
          <Select name="year" value={year.toString()} onValueChange={(val) => setYear(+val)}>
            {availableYears.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </Select>
          <Button icon={RiSaveLine} onClick={() => toPDF()}>
            Generate Report
          </Button>
        </div>
      </Modal>
    </>
  )
}
