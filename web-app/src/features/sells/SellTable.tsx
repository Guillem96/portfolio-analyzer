import { useEffect, useMemo, useState } from "react"
import { useBoundStore } from "../../store"
import {
  Button,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput,
} from "@tremor/react"
import { RiDeleteBin2Line } from "@remixicon/react"
import { RiTimeLine } from "@remixicon/react"
import PaginationNav from "@components/PaginationNav"
import { currencyFormatter, getWebsiteLogo } from "@/services/utils"
import { SellWithId } from "@/types"

const MAX_ITEMS_PER_PAGE = 10

export default function SellTable() {
  const [sells, loading, tickerToInfo, deleteSell, privateMode] = useBoundStore((state) => [
    state.sells,
    state.sellsLoading,
    state.tickerToInfo,
    state.deleteSell,
    state.privateMode,
  ])

  const [currentPage, setCurrentPage] = useState(-1)
  const [nPages, setNPages] = useState(Math.ceil(sells.length / MAX_ITEMS_PER_PAGE))
  const [filteredSells, setFilteredSells] = useState<SellWithId[]>([])

  useEffect(() => {
    const nPages = Math.max(1, Math.ceil(filteredSells.length / MAX_ITEMS_PER_PAGE))
    setNPages(nPages)
    if (currentPage > nPages) {
      setCurrentPage(nPages)
    }
  }, [filteredSells])

  useEffect(() => {
    setFilteredSells(sells)
  }, [sells])

  const handleDeleteSell = (sellId: string) => () => {
    deleteSell(sellId)
  }

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    const search = formData.get("search")
    let filteredSells = [...sells]
    if (search !== "") {
      filteredSells = filteredSells.filter(
        (sell) =>
          sell.ticker.toLowerCase().includes((search as string).toLowerCase()) ||
          tickerToInfo[sell.ticker].name.toLowerCase().includes((search as string).toLowerCase()),
      )
    }
    setFilteredSells(filteredSells)
  }

  const sellsToRender = useMemo(() => {
    let cp = currentPage
    if (currentPage === -1) {
      cp = Math.ceil(filteredSells.length / MAX_ITEMS_PER_PAGE)
    }
    const start = (cp - 1) * MAX_ITEMS_PER_PAGE
    return filteredSells.slice(start, start + MAX_ITEMS_PER_PAGE)
  }, [filteredSells, currentPage, nPages])

  return (
    <>
      {(sellsToRender.length === 0 && loading) || Object.keys(tickerToInfo).length === 0 ? (
        <div className="flex flex-row justify-center align-middle">
          <Icon icon={RiTimeLine} />
          <p className="text-tremor-content dark:text-dark-tremor-content">Loading...</p>
        </div>
      ) : null}

      {sellsToRender.length === 0 && !loading ? (
        <p className="text-tremor-content dark:text-dark-tremor-content">No sells yet available</p>
      ) : null}

      <div className="flex flex-col gap-4">
        <form onSubmit={handleSearch} className="flex flex-row justify-between gap-2">
          <TextInput placeholder="Search ticker or name" name="search" />
          <Button type="submit">Search</Button>
          <Button type="button" onClick={() => setFilteredSells(sells)}>
            Reset
          </Button>
        </form>
        {sellsToRender.length > 0 && Object.keys(tickerToInfo).length > 0 ? (
          <div className="mb-4 min-h-[30em] lg:max-h-[30em] lg:overflow-y-scroll">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Ticker</TableHeaderCell>
                  <TableHeaderCell># Shares</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Share Acquisition value</TableHeaderCell>
                  <TableHeaderCell>Purchases fees</TableHeaderCell>
                  <TableHeaderCell>Fees</TableHeaderCell>
                  <TableHeaderCell>Benefit</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sellsToRender.map(
                  ({ id, ticker, amount, acquisitionValue, fees, accumulatedFees, units, currency, date, preview }) => {
                    const benefit = amount - acquisitionValue * units - fees
                    return (
                      <TableRow className={preview ? "opacity-60 hover:cursor-not-allowed" : ""} key={id}>
                        <TableCell>
                          <div className="flex flex-row items-center gap-x-2 align-middle">
                            <img
                              className="d-block h-8 w-8 rounded-full bg-transparent bg-white"
                              src={getWebsiteLogo(tickerToInfo[ticker]?.website)}
                              alt={`${ticker} company logo`}
                            />
                            <p>{ticker}</p>
                          </div>
                        </TableCell>
                        <TableCell>{units.toFixed(3)}</TableCell>
                        <TableCell>{currencyFormatter(amount, currency, privateMode)}</TableCell>
                        <TableCell>{currencyFormatter(acquisitionValue, currency, privateMode)}</TableCell>
                        <TableCell>{currencyFormatter(accumulatedFees, currency, privateMode)}</TableCell>
                        <TableCell>{currencyFormatter(fees, currency, privateMode)}</TableCell>
                        <TableCell>
                          <span
                            className={` ${
                              benefit > 0
                                ? "bg-emerald-100 text-emerald-800 ring-emerald-600/10 dark:bg-emerald-400/10 dark:text-emerald-500 dark:ring-emerald-400/20"
                                : "bg-red-100 text-red-800 ring-red-600/10 dark:bg-red-400/10 dark:text-red-500 dark:ring-red-400/20"
                            } inline-flex items-center rounded-tremor-small px-2 py-1 text-tremor-label font-medium ring-1 ring-inset`}
                          >
                            {currencyFormatter(benefit, currency, privateMode)}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(date).toLocaleDateString("es")}</TableCell>
                        <TableCell className="flex flex-row justify-end gap-x-4">
                          <Button
                            size="xs"
                            disabled={preview}
                            color="red"
                            className="hover:cursor-pointer"
                            icon={RiDeleteBin2Line}
                            onClick={handleDeleteSell(id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  },
                )}
              </TableBody>
            </Table>
          </div>
        ) : null}
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
