import { useEffect, useMemo, useState } from "react"
import { useBoundStore } from "../../store"
import { Button, Icon, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tremor/react"
import { RiDeleteBin2Line } from "@remixicon/react"
import { RiTimeLine } from "@remixicon/react"
import PaginationNav from "@components/PaginationNav"
import { currencyFormatter } from "@/services/utils"

const MAX_ITEMS_PER_PAGE = 5

export default function InvestmentTable() {
  const [investments, loading, fetchInvestments, deleteInvestment] = useBoundStore((state) => [
    state.investments,
    state.investmentLoading,
    state.fetchInvestments,
    state.deleteInvestment,
  ])

  const [currentPage, setCurrentPage] = useState(1)
  const [nPages, setNPages] = useState(Math.ceil(investments.length / MAX_ITEMS_PER_PAGE))

  useEffect(() => {
    fetchInvestments()
  }, [fetchInvestments])

  useEffect(() => {
    setNPages(Math.ceil(investments.length / MAX_ITEMS_PER_PAGE))
  }, [investments])

  const handleDeleteInvestment = (invId: string) => () => {
    deleteInvestment(invId)
  }

  const investmentsToRender = useMemo(() => {
    const start = (currentPage - 1) * MAX_ITEMS_PER_PAGE
    return investments.slice(start, start + MAX_ITEMS_PER_PAGE)
  }, [investments, currentPage])

  return (
    <>
      {investmentsToRender.length === 0 && loading ? (
        <div className="flex flex-row justify-center align-middle">
          <Icon icon={RiTimeLine} />
          <p className="text-tremor-content dark:text-dark-tremor-content">Loading...</p>
        </div>
      ) : null}

      {investmentsToRender.length === 0 && !loading ? (
        <p className="text-tremor-content dark:text-dark-tremor-content">No investments yet available</p>
      ) : null}

      {investmentsToRender.length > 0 ? (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {investmentsToRender.map(({ id, amount, currency, date, preview }) => (
                <TableRow className={preview ? "opacity-60 hover:cursor-not-allowed" : ""} key={id}>
                  <TableCell>{currencyFormatter(amount, currency)}</TableCell>
                  <TableCell>{new Date(date).toLocaleDateString("es")}</TableCell>
                  <TableCell className="flex flex-row gap-x-4 justify-end">
                    <Button
                      size="xs"
                      disabled={preview}
                      color="red"
                      className="hover:cursor-pointer"
                      icon={RiDeleteBin2Line}
                      onClick={handleDeleteInvestment(id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
