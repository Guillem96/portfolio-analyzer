import { useEffect, useMemo, useState } from "react"
import { useBoundStore } from "../../store"
import {
  Button,
  DatePicker,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput,
} from "@tremor/react"
import { RiDeleteBin2Line } from "@remixicon/react"
import PaginationNav from "@components/PaginationNav"
import { currencyFormatter, getWebsiteLogo, showErrorToast } from "@/services/utils"
import { BuyWithId } from "@/types"
import { Skeleton } from "@/components/ui/Skeleton"

const MAX_ITEMS_PER_PAGE = 10

export default function BuyTable() {
  const [buys, loading, deleteBuy, privateMode, fetchAssets] = useBoundStore((state) => [
    state.buys,
    state.buysLoading,
    state.deleteBuy,
    state.privateMode,
    state.fetchAssets,
  ])

  const [currentPage, setCurrentPage] = useState(-1)
  const [nPages, setNPages] = useState(Math.ceil(buys.length / MAX_ITEMS_PER_PAGE))
  const [filteredBuys, setFilteredBuys] = useState<BuyWithId[]>([])
  const [startDateRange, setStartDateRange] = useState<Date | null>(null)
  const [endDateRange, setEndDateRange] = useState<Date | null>(null)
  useEffect(() => {
    const nPages = Math.max(1, Math.ceil(filteredBuys.length / MAX_ITEMS_PER_PAGE))
    setNPages(nPages)
    if (currentPage > nPages) {
      setCurrentPage(nPages)
    }
  }, [filteredBuys])

  useEffect(() => {
    setFilteredBuys(buys)
  }, [buys])

  const handleDeleteBuy = (buyId: string) => () => {
    deleteBuy(buyId).then(() => fetchAssets())
  }

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    const search = formData.get("search")

    if (startDateRange !== null && endDateRange !== null && startDateRange >= endDateRange) {
      showErrorToast("Invalid date range. End date, is earlier then start date", () => {})
      return
    }

    let filteredBuys = [...buys]
    if (search !== "") {
      filteredBuys = filteredBuys.filter((buy) => {
        const tickerText = buy.ticker.toLowerCase()
        const nameText = (buy.tickerData?.name || "").toLowerCase()
        return (
          tickerText.includes((search as string).toLowerCase()) || nameText.includes((search as string).toLowerCase())
        )
      })
    }

    if (startDateRange !== null) {
      filteredBuys = filteredBuys.filter((buy) => new Date(buy.date) >= startDateRange)
    }

    if (endDateRange !== null) {
      filteredBuys = filteredBuys.filter((buy) => new Date(buy.date) <= endDateRange)
    }

    setFilteredBuys(filteredBuys)
  }

  const buysToRender = useMemo(() => {
    let cp = currentPage
    if (currentPage === -1) {
      cp = Math.ceil(filteredBuys.length / MAX_ITEMS_PER_PAGE)
    }
    const start = (cp - 1) * MAX_ITEMS_PER_PAGE
    return filteredBuys.slice(start, start + MAX_ITEMS_PER_PAGE)
  }, [filteredBuys, currentPage, nPages])

  return (
    <>
      <div className="flex flex-col gap-4">
        <form onSubmit={handleSearch} className="flex flex-row justify-between gap-2">
          <TextInput placeholder="Search ticker or name" name="search" />
          <DatePicker
            className="hidden md:block"
            placeholder="Start Date"
            disabled={loading}
            onValueChange={(d) => setStartDateRange(d ?? null)}
          />
          <DatePicker
            className="hidden md:block"
            placeholder="End Date"
            disabled={loading}
            onValueChange={(d) => setEndDateRange(d ?? null)}
          />
          <Button type="submit">Search</Button>
          <Button type="button" variant="secondary" onClick={() => setFilteredBuys(buys)}>
            Reset
          </Button>
        </form>
        <div className="mb-4 min-h-[30em] lg:max-h-[30em] lg:overflow-y-scroll">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Ticker</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Fee</TableHeaderCell>
                <TableHeaderCell>Taxes</TableHeaderCell>
                <TableHeaderCell>Total Amount</TableHeaderCell>
                <TableHeaderCell># Shares</TableHeaderCell>
                <TableHeaderCell>Share price</TableHeaderCell>
                <TableHeaderCell># Is Reinvestment?</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading
                ? Array.from({ length: 10 }, (_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 10 }, (_, j) => (
                        <TableCell key={`loading-j${j}`}>
                          <Skeleton height={28} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : buysToRender.map(
                    ({
                      id,
                      ticker,
                      tickerData,
                      amount,
                      taxes,
                      fee,
                      units,
                      currency,
                      date,
                      isDividendReinvestment,
                      preview,
                    }) => (
                      <TableRow className={preview ? "opacity-60 hover:cursor-not-allowed" : ""} key={id}>
                        <TableCell>
                          <div className="flex flex-row items-center gap-x-2 align-middle">
                            <img
                              className="d-block h-8 w-8 rounded-full bg-transparent bg-white"
                              src={getWebsiteLogo(tickerData?.website ?? null)}
                              alt={`${ticker} company logo`}
                            />
                            <p>{ticker}</p>
                          </div>
                        </TableCell>
                        <TableCell>{currencyFormatter(amount, currency, privateMode)}</TableCell>
                        <TableCell>{currencyFormatter(fee, currency, privateMode)}</TableCell>
                        <TableCell>{currencyFormatter(taxes, currency, privateMode)}</TableCell>
                        <TableCell>{currencyFormatter(fee + amount + taxes, currency, privateMode)}</TableCell>
                        <TableCell>{units.toFixed(3)}</TableCell>
                        <TableCell>{currencyFormatter(amount / units, currency, privateMode)}</TableCell>
                        <TableCell>{isDividendReinvestment ? "✅" : "❌"}</TableCell>
                        <TableCell>{new Date(date).toLocaleDateString("es")}</TableCell>
                        <TableCell className="flex flex-row justify-end gap-x-4">
                          <Button
                            size="xs"
                            disabled={preview}
                            color="red"
                            className="hover:cursor-pointer"
                            icon={RiDeleteBin2Line}
                            onClick={handleDeleteBuy(id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
              {buysToRender.length === 0 && !loading ? (
                <p className="text-tremor-content dark:text-dark-tremor-content">No buys yet available</p>
              ) : null}
            </TableBody>
          </Table>
        </div>
        <PaginationNav
          currentPage={currentPage}
          nPages={nPages}
          maxPagesToShow={4}
          onPageNavigation={setCurrentPage}
        ></PaginationNav>
      </div>
    </>
  )
}
