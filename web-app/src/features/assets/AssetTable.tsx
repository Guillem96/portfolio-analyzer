import { useEffect, useMemo, useState } from "react"
import { Icon, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tremor/react"
import { RiTimeLine } from "@remixicon/react"
import PaginationNav from "@components/PaginationNav"
import { useBoundStore } from "@/store"
import type { Asset } from "@/types.d"
import { currencyFormatter, getWebsiteLogo } from "@/services/utils"
import { COUNTRY_EMOJI } from "@/constants"

interface RowProps {
  asset: Asset
}
type SortKeys = "gain" | "name" | "country" | "num-shares" | "sector" | "amount"

const MAX_ITEMS_PER_PAGE = 15

const AssetTableRow = ({ asset }: RowProps) => {
  const privateMode = useBoundStore((state) => state.privateMode)
  const mainCurrency = useBoundStore((state) => state.mainCurrency)
  const tickerToInfo = useBoundStore((state) => state.tickerToInfo)

  const [showAbsolute, setShowAbsolute] = useState(false)

  const { name, ticker, value, buyValue, units, sector, country, currency, avgPrice } = asset
  const rate = (value / buyValue - 1) * 100
  const absolute = value - buyValue
  const changeType = rate > 0 ? "positive" : "negative"

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-2.5">
          {Object.keys(tickerToInfo).length > 0 && (
            <img
              className="d-block h-8 w-8 rounded-full bg-transparent bg-white"
              src={getWebsiteLogo(tickerToInfo[ticker].website)}
              alt={`${ticker} company logo`}
            />
          )}
          <p>{ticker}</p>
          <p className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">{ticker}</p>
          <span className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">{name}</span>
        </div>
      </TableCell>
      <TableCell onClick={() => setShowAbsolute(!showAbsolute)}>
        <span
          className={` ${
            changeType === "positive"
              ? "bg-emerald-100 text-emerald-800 ring-emerald-600/10 dark:bg-emerald-400/10 dark:text-emerald-500 dark:ring-emerald-400/20"
              : "bg-red-100 text-red-800 ring-red-600/10 dark:bg-red-400/10 dark:text-red-500 dark:ring-red-400/20"
          } inline-flex items-center rounded-tremor-small px-2 py-1 text-tremor-label font-medium ring-1 ring-inset`}
        >
          {showAbsolute ? currencyFormatter(absolute, mainCurrency, privateMode) : `${rate.toFixed(2)} %`}
        </span>
      </TableCell>
      <TableCell>{sector}</TableCell>
      <TableCell className="text-center">{COUNTRY_EMOJI[country]}</TableCell>
      <TableCell>{units.toFixed(3)}</TableCell>
      <TableCell>{currencyFormatter(avgPrice, currency, privateMode)}</TableCell>

      <TableCell>{currencyFormatter(value, currency, privateMode)}</TableCell>
    </TableRow>
  )
}

export default function AssetTable() {
  const [assets, loading] = useBoundStore((state) => [state.assets, state.assetsLoading])

  const [currentPage, setCurrentPage] = useState(1)
  const [nPages, setNPages] = useState(Math.ceil(assets.length / MAX_ITEMS_PER_PAGE))
  const [sortBy, setSortBy] = useState<SortKeys>("name")
  const [sortAsc, setSortAsc] = useState(false)

  const sortFunction = (a: Asset, b: Asset) => {
    if (sortAsc) {
      const tmp = b
      b = a
      a = tmp
    }

    if (sortBy === "gain") return b.value / b.buyValue - a.value / a.buyValue
    if (sortBy === "amount") return b.value - a.value
    if (sortBy === "num-shares") return b.units - a.units
    if (sortBy === "country" || sortBy === "name" || sortBy === "sector") return a[sortBy].localeCompare(b[sortBy])
    return a.ticker.localeCompare(b.ticker)
  }

  const onClickSortHandler = (sb: SortKeys) => () => {
    setSortBy(sb)
    setSortAsc(!sortAsc)
  }

  useEffect(() => {
    setNPages(Math.ceil(assets.length / MAX_ITEMS_PER_PAGE))
  }, [assets])

  const assetsToRender = useMemo(() => {
    const start = (currentPage - 1) * MAX_ITEMS_PER_PAGE
    return assets.sort(sortFunction).slice(start, start + MAX_ITEMS_PER_PAGE)
  }, [assets, sortBy, sortAsc, currentPage])

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
                  <TableHeaderCell onClick={onClickSortHandler("name")}>Name</TableHeaderCell>
                  <TableHeaderCell onClick={onClickSortHandler("gain")}>Gain</TableHeaderCell>
                  <TableHeaderCell onClick={onClickSortHandler("sector")}>Sector</TableHeaderCell>
                  <TableHeaderCell onClick={onClickSortHandler("country")}>Country</TableHeaderCell>
                  <TableHeaderCell onClick={onClickSortHandler("num-shares")}># Shares</TableHeaderCell>
                  <TableHeaderCell>Avg. Price</TableHeaderCell>
                  <TableHeaderCell onClick={onClickSortHandler("amount")}>Amount</TableHeaderCell>
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
