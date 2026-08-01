import { useEffect, useId, useMemo, useState } from "react"
import { useBoundStore } from "../../store"
import {
  Button,
  DatePicker,
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
import { currencyFormatter, getWebsiteLogo, showErrorToast } from "@/services/utils"
import { COUNTRY_EMOJI } from "@/constants"
import { Checkbox } from "@/components/ui/Checkbox"
import { Skeleton } from "@/components/ui/Skeleton"
import { DividendWithId } from "@/types"

const MAX_ITEMS_PER_PAGE = 10

export default function DividendTable() {
  const [dividends, selectedDividend, loading, deleteDividend, markDividendAsReinvested, privateMode] = useBoundStore(
    (state) => [
      state.dividends,
      state.selectedDividend,
      state.dividendLoading,
      state.deleteDividend,
      state.markDividendAsReinvested,
      state.privateMode,
    ],
  )
  const tableId = useId()
  const [currentPage, setCurrentPage] = useState(-1)
  const [nPages, setNPages] = useState(Math.ceil(dividends.length / MAX_ITEMS_PER_PAGE))
  const [markReinvested, setMarkReinvested] = useState<Record<string, boolean>>({})
  const [filteredDividends, setFilteredDividends] = useState<DividendWithId[]>([])
  const [startDateRange, setStartDateRange] = useState<Date | null>(null)
  const [endDateRange, setEndDateRange] = useState<Date | null>(null)

  useEffect(() => {
    const nPages = Math.max(1, Math.ceil(filteredDividends.length / MAX_ITEMS_PER_PAGE))
    setNPages(nPages)
    if (currentPage > nPages) {
      setCurrentPage(nPages)
    }
  }, [filteredDividends])

  useEffect(() => {
    setFilteredDividends(dividends)
  }, [dividends])

  useEffect(() => {
    if (selectedDividend) {
      const table = document.getElementById(tableId)
      if (table) {
        table.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [selectedDividend])

  const handleDeleteDividend = (dividendId: string) => () => {
    deleteDividend(dividendId)
  }

  const handleCheckboxChange = (dividendId: string) => () => {
    if (Object.keys(markReinvested).includes(dividendId)) {
      setMarkReinvested((prev) => ({ ...prev, [dividendId]: !markReinvested[dividendId] }))
      return
    }

    const currentDividend = dividends.find((dividend) => dividend.id === dividendId)
    setMarkReinvested((prev) => ({ ...prev, [dividendId]: !currentDividend?.isReinvested }))
  }

  useEffect(() => {
    if (Object.keys(markReinvested).length === 0) return

    const timeout = setTimeout(() => {
      markDividendAsReinvested(markReinvested)
    }, 1500)

    return () => {
      clearTimeout(timeout)
    }
  }, [markReinvested])

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    const search = formData.get("search")

    if (startDateRange !== null && endDateRange !== null && startDateRange >= endDateRange) {
      showErrorToast("Invalid date range. End date is earlier than start date", () => {})
      return
    }

    let filtered = [...dividends]

    if (search !== "") {
      filtered = filtered.filter((dividend) => {
        const companyText = dividend.company.toLowerCase()
        const nameText = (dividend.tickerData?.name || "").toLowerCase()
        return (
          companyText.includes((search as string).toLowerCase()) || nameText.includes((search as string).toLowerCase())
        )
      })
    }

    if (startDateRange !== null) {
      filtered = filtered.filter((dividend) => new Date(dividend.date) >= startDateRange)
    }

    if (endDateRange !== null) {
      filtered = filtered.filter((dividend) => new Date(dividend.date) <= endDateRange)
    }

    setFilteredDividends(filtered)
  }

  const dividendsToRender = useMemo(() => {
    let cp = currentPage
    if (currentPage === -1) {
      cp = Math.ceil(filteredDividends.length / MAX_ITEMS_PER_PAGE)
    }
    const start = (cp - 1) * MAX_ITEMS_PER_PAGE
    return filteredDividends.slice(start, start + MAX_ITEMS_PER_PAGE)
  }, [filteredDividends, currentPage])

  return (
    <>
      {dividends.length > 0 ? (
        <form onSubmit={handleSearch} className="mb-4 flex flex-row justify-between gap-2">
          <TextInput placeholder="Search company or name" name="search" />
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
          <Button type="button" variant="secondary" onClick={() => setFilteredDividends(dividends)}>
            Reset
          </Button>
        </form>
      ) : null}

      {dividendsToRender.length === 0 && loading ? (
        <div className="flex flex-row justify-center align-middle">
          <Icon icon={RiTimeLine} />
          <p className="text-tremor-content dark:text-dark-tremor-content">Loading...</p>
        </div>
      ) : null}

      {dividendsToRender.length === 0 && !loading ? (
        <p className="text-tremor-content dark:text-dark-tremor-content">No dividends yet available</p>
      ) : null}

      {dividendsToRender.length > 0 ? (
        <>
          <div id={tableId} className="mb-4 lg:max-h-[30em] lg:overflow-y-scroll">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Company</TableHeaderCell>
                  <TableHeaderCell>Country</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Taxes (Orig. - Dest)</TableHeaderCell>
                  <TableHeaderCell>Net</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Reinvested</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading
                  ? Array.from({ length: 10 }, (_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 8 }, (_, j) => (
                          <TableCell key={`loading-j${j}`}>
                            <Skeleton height={28} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : dividendsToRender.map(
                      ({
                        id,
                        company,
                        amount,
                        tickerData,
                        doubleTaxationOrigin,
                        doubleTaxationDestination,
                        country,
                        currency,
                        date,
                        preview,
                        isReinvested,
                      }) => (
                        <TableRow className={preview ? "opacity-60 hover:cursor-not-allowed" : ""} key={id}>
                          <div className="flex flex-row items-center gap-x-2 align-middle">
                            <img
                              className="d-block h-8 w-8 rounded-full bg-transparent bg-white"
                              src={getWebsiteLogo(tickerData?.website ?? null)}
                              alt={`${company} company logo`}
                            />
                            <p>{company}</p>
                          </div>
                          <TableCell className="text-center">{COUNTRY_EMOJI[country]}</TableCell>
                          <TableCell>{currencyFormatter(amount, currency, privateMode)}</TableCell>
                          <TableCell>
                            {doubleTaxationOrigin} % - {doubleTaxationDestination} %
                          </TableCell>
                          <TableCell>
                            {currencyFormatter(
                              amount * (1 - doubleTaxationOrigin / 100) * (1 - doubleTaxationDestination / 100),
                              currency,
                              privateMode,
                            )}
                          </TableCell>
                          <TableCell>{new Date(date).toLocaleDateString("es")}</TableCell>
                          <TableCell>
                            <Checkbox
                              checked={markReinvested[id] === undefined ? isReinvested : markReinvested[id]}
                              onClick={handleCheckboxChange(id)}
                            />
                          </TableCell>
                          <TableCell className="flex flex-row justify-end gap-x-4">
                            <Button
                              size="xs"
                              disabled={preview}
                              color="red"
                              className="hover:cursor-pointer"
                              icon={RiDeleteBin2Line}
                              onClick={handleDeleteDividend(id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
              </TableBody>
            </Table>
          </div>

          <PaginationNav
            currentPage={currentPage}
            nPages={nPages}
            maxPagesToShow={4}
            onPageNavigation={setCurrentPage}
          ></PaginationNav>
        </>
      ) : null}
    </>
  )
}
