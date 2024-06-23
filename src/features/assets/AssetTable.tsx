import { useEffect, useMemo, useState } from "react"
import { Icon, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tremor/react"
import { RiTimeLine } from "@remixicon/react"
import PaginationNav from "@components/PaginationNav"
import { useBoundStore } from "@/store"
import type { Asset } from "@/types.d"
import { currencyFormatter } from "@/services/utils"
import { COUNTRY_EMOJI } from "@/constants"

interface RowProps {
  asset: Asset
}

const MAX_ITEMS_PER_PAGE = 10

const AssetTableRow = ({ asset }: RowProps) => {
  const privateMode = useBoundStore((state) => state.privateMode)

  const { ticker, value, units, sector, country, currency } = asset

  return (
    <TableRow>
      <TableCell>{ticker}</TableCell>
      <TableCell>{sector}</TableCell>
      <TableCell className="text-center">{COUNTRY_EMOJI[country]}</TableCell>
      <TableCell>{units.toFixed(3)}</TableCell>
      <TableCell>{currencyFormatter(value, currency, privateMode)}</TableCell>
    </TableRow>
  )
}

export default function AssetTable() {
  const [assets, buys, loading, fetchAssets] = useBoundStore((state) => [
    state.assets,
    state.buys,
    state.assetsLoading,
    state.fetchAssets,
  ])

  const [currentPage, setCurrentPage] = useState(1)
  const [nPages, setNPages] = useState(Math.ceil(assets.length / MAX_ITEMS_PER_PAGE))

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets, buys])

  useEffect(() => {
    setNPages(Math.ceil(assets.length / MAX_ITEMS_PER_PAGE))
  }, [assets])

  const assetsToRender = useMemo(() => {
    const start = (currentPage - 1) * MAX_ITEMS_PER_PAGE
    return assets.slice(start, start + MAX_ITEMS_PER_PAGE)
  }, [assets, currentPage])

  return (
    <>
      {assetsToRender.length === 0 && loading ? (
        <div className="flex flex-row justify-center align-middle">
          <Icon icon={RiTimeLine} />
          <p className="text-tremor-content dark:text-dark-tremor-content">Loading...</p>
        </div>
      ) : null}

      {assetsToRender.length === 0 && !loading ? (
        <p className="py-4 text-center text-tremor-content dark:text-dark-tremor-content">No assets yet available</p>
      ) : null}

      {assetsToRender.length > 0 ? (
        <>
          <div className="mb-4">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Ticker</TableHeaderCell>
                  <TableHeaderCell>Sector</TableHeaderCell>
                  <TableHeaderCell>Country</TableHeaderCell>
                  <TableHeaderCell># Shares</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {assetsToRender.map((asset) => (
                  <AssetTableRow key={`${asset.ticker}-${asset.currency}`} asset={asset} />
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
