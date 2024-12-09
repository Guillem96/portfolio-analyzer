import { useEffect, useMemo, useState } from "react"
import { useBoundStore } from "../../store"
import { Button, Icon, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tremor/react"
import { RiDeleteBin2Line } from "@remixicon/react"
import { RiTimeLine } from "@remixicon/react"
import PaginationNav from "@components/PaginationNav"
import { currencyFormatter } from "@/services/utils"
import { COUNTRY_EMOJI } from "@/constants"
import { Checkbox } from "@/components/ui/Checkbox"

const MAX_ITEMS_PER_PAGE = 10

export default function DividendTable() {
  const [dividends, loading, deleteDividend, markDividendAsReinvested, privateMode] = useBoundStore((state) => [
    state.dividends,
    state.dividendLoading,
    state.deleteDividend,
    state.markDividendAsReinvested,
    state.privateMode,
  ])

  const [currentPage, setCurrentPage] = useState(-1)
  const [nPages, setNPages] = useState(Math.ceil(dividends.length / MAX_ITEMS_PER_PAGE))
  const [markReinvested, setMarkReinvested] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setNPages(Math.ceil(dividends.length / MAX_ITEMS_PER_PAGE))
  }, [dividends])

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

  const dividendsToRender = useMemo(() => {
    let cp = currentPage
    if (currentPage === -1) {
      cp = Math.ceil(dividends.length / MAX_ITEMS_PER_PAGE)
    }
    const start = (cp - 1) * MAX_ITEMS_PER_PAGE
    return dividends.slice(start, start + MAX_ITEMS_PER_PAGE)
  }, [dividends, currentPage])

  return (
    <>
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
          <div className="mb-4 lg:max-h-[30em] lg:overflow-y-scroll">
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
                {dividendsToRender.map(
                  ({
                    id,
                    company,
                    amount,
                    doubleTaxationOrigin,
                    doubleTaxationDestination,
                    country,
                    currency,
                    date,
                    preview,
                    isReinvested,
                  }) => (
                    <TableRow className={preview ? "opacity-60 hover:cursor-not-allowed" : ""} key={id}>
                      <TableCell>{company}</TableCell>
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
