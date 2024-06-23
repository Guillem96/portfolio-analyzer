import { useEffect, useMemo, useState } from "react"
import { useBoundStore } from "../../store"
import { Button, Icon, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tremor/react"
import { RiDeleteBin2Line } from "@remixicon/react"
import { RiTimeLine } from "@remixicon/react"
import PaginationNav from "@components/PaginationNav"
import { currencyFormatter } from "@/services/utils"

const MAX_ITEMS_PER_PAGE = 10

export default function BuyTable() {
  const [buys, loading, fetchBuys, deleteBuy, privateMode] = useBoundStore((state) => [
    state.buys,
    state.buysLoading,
    state.fetchBuys,
    state.deleteBuy,
    state.privateMode,
  ])

  const [currentPage, setCurrentPage] = useState(1)
  const [nPages, setNPages] = useState(Math.ceil(buys.length / MAX_ITEMS_PER_PAGE))

  useEffect(() => {
    fetchBuys()
  }, [fetchBuys])

  useEffect(() => {
    setNPages(Math.ceil(buys.length / MAX_ITEMS_PER_PAGE))
  }, [buys])

  const handleDeleteBuy = (buyId: string) => () => {
    deleteBuy(buyId)
  }

  const buysToRender = useMemo(() => {
    const start = (currentPage - 1) * MAX_ITEMS_PER_PAGE
    return buys.slice(start, start + MAX_ITEMS_PER_PAGE)
  }, [buys, currentPage])

  return (
    <>
      {buysToRender.length === 0 && loading ? (
        <div className="flex flex-row justify-center align-middle">
          <Icon icon={RiTimeLine} />
          <p className="text-tremor-content dark:text-dark-tremor-content">Loading...</p>
        </div>
      ) : null}

      {buysToRender.length === 0 && !loading ? (
        <p className="text-tremor-content dark:text-dark-tremor-content">No buys yet available</p>
      ) : null}

      {buysToRender.length > 0 ? (
        <>
          <div className="mb-4 min-h-[30em] lg:max-h-[30em] lg:overflow-y-scroll">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Ticker</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell># Shares</TableHeaderCell>
                  <TableHeaderCell># Is Reinvestment?</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {buysToRender.map(({ id, ticker, amount, units, currency, date, isDividendReinvestment, preview }) => (
                  <TableRow className={preview ? "opacity-60 hover:cursor-not-allowed" : ""} key={id}>
                    <TableCell>{ticker}</TableCell>
                    <TableCell>{currencyFormatter(amount, currency, privateMode)}</TableCell>
                    <TableCell>{units}</TableCell>
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
                ))}
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
