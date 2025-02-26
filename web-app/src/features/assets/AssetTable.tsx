import { useEffect, useMemo, useState } from "react"
import {
  Button,
  Icon,
  Select,
  SelectItem,
  SparkAreaChart,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput,
} from "@tremor/react"
import { RiTimeLine } from "@remixicon/react"
import PaginationNav from "@components/PaginationNav"
import { useBoundStore } from "@/store"
import { Asset } from "@/types.d"
import { currencyFormatter, getWebsiteLogo } from "@/services/utils"
import { COUNTRY_EMOJI } from "@/constants"
import { format, startOfMonth } from "date-fns"

interface RowProps {
  asset: Asset
  totalAssetValue: number
}
type SortKeys =
  | "gain"
  | "name"
  | "country"
  | "num-shares"
  | "sector"
  | "amount"
  | "last-buy"
  | "weight"
  | "ywrb"
  | "ywrv"

const MAX_ITEMS_PER_PAGE = 12

const AssetTableRow = ({ asset, totalAssetValue }: RowProps) => {
  const privateMode = useBoundStore((state) => state.privateMode)
  const mainCurrency = useBoundStore((state) => state.mainCurrency)

  const [showAbsolute, setShowAbsolute] = useState(false)

  const {
    name,
    ticker,
    value,
    buyValue,
    units,
    sector,
    country,
    currency,
    avgPrice,
    lastBuyDate,
    yieldWithRespectBuy,
    yieldWithRespectValue,
  } = asset

  const rate = (value / buyValue - 1) * 100
  const absolute = value - buyValue
  const changeType = rate > 0 ? "positive" : "negative"

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-2.5">
          <img
            className="d-block h-8 w-8 rounded-full bg-transparent bg-white"
            src={getWebsiteLogo(ticker.website)}
            alt={`${ticker.ticker} company logo`}
          />
          <p className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">{ticker.ticker}</p>
          <span className="hidden text-tremor-default text-tremor-content dark:text-dark-tremor-content md:block">
            {name}
          </span>
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
      <TableCell>
        <SparkAreaChart
          data={ticker.historicalData
            .map(({ date, price }) => ({ date: startOfMonth(date), price }))
            .concat([{ date: new Date(), price: ticker.price }])}
          categories={["price"]}
          index="date"
          colors={[ticker.historicalData[0].price > ticker.price ? "red" : "emerald"]}
          autoMinValue={true}
        />
      </TableCell>
      <TableCell>{`${ticker.price.toFixed(2)}${currency}`}</TableCell>
      <TableCell>{currencyFormatter(avgPrice, currency, privateMode)}</TableCell>
      <TableCell>{units.toFixed(3)}</TableCell>
      <TableCell>{format(lastBuyDate, "yyyy-MM-dd")}</TableCell>
      <TableCell>{`${(yieldWithRespectBuy * 100).toFixed(2)}%`}</TableCell>
      <TableCell>{`${(yieldWithRespectValue * 100).toFixed(2)}%`}</TableCell>
      <TableCell>{`${((value / totalAssetValue) * 100).toFixed(2)}%`}</TableCell>
      <TableCell>{currencyFormatter(value, currency, privateMode)}</TableCell>
    </TableRow>
  )
}

const Filters = ({
  availableSectors,
  onFilter,
}: {
  availableSectors: string[]
  onFilter: (country: string | null, sector: string | null, name: string) => void
}) => {
  const handleFilter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    const country = formData.get("country") as string
    const sector = formData.get("sector") as string
    const name = formData.get("ticker") as string
    onFilter(country, sector, name)
  }

  const clearFilters = () => {
    onFilter(null, null, "")
  }

  return (
    <form className="flex flex-col items-start gap-2 md:flex-row md:items-end md:gap-x-2" onSubmit={handleFilter}>
      <div className="w-full">
        <label htmlFor="amount" className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Name/Ticker
        </label>
        <TextInput name="ticker" id="asset-filter-ticker" />
      </div>
      <div className="flex w-full flex-row justify-between gap-x-2">
        <div className="w-full">
          <label htmlFor="country" className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            Country
          </label>
          <Select id="asset-filter-country" name="country">
            {Object.entries(COUNTRY_EMOJI).map(([country, emoji]) => (
              <SelectItem key={country} value={country}>
                {emoji} {country}
              </SelectItem>
            ))}
          </Select>
        </div>
        <div className="w-full">
          <label htmlFor="sector" className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            Sector
          </label>
          <Select id="asset-filter-sector" name="sector">
            {availableSectors.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
      <div className="flex w-full flex-row gap-x-2">
        <div className="w-full">
          <Button type="submit" className="m-auto mt-1 w-full md:mt-0 md:max-w-xs">
            Filter
          </Button>
        </div>
        <div className="w-full">
          <Button type="button" color="gray" onClick={clearFilters} className="m-auto mt-1 w-full md:mt-0 md:max-w-xs">
            Reset
          </Button>
        </div>
      </div>
    </form>
  )
}

export default function AssetTable() {
  const [assets, loading] = useBoundStore((state) => [state.assets, state.assetsLoading])

  const [currentPage, setCurrentPage] = useState(1)
  const [nPages, setNPages] = useState(Math.ceil(assets.length / MAX_ITEMS_PER_PAGE))
  const [sortBy, setSortBy] = useState<SortKeys>("name")
  const [sortAsc, setSortAsc] = useState(false)
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])

  const totalAssetValue = useMemo(() => assets.map(({ value }) => value).reduce((a, b) => a + b, 0), [assets])

  const sortFunction = (a: Asset, b: Asset) => {
    if (sortAsc) {
      const tmp = b
      b = a
      a = tmp
    }

    if (sortBy === "gain") return b.value / b.buyValue - a.value / a.buyValue
    if (sortBy === "amount") return b.value - a.value
    if (sortBy === "num-shares") return b.units - a.units
    if (sortBy === "last-buy") return b.lastBuyDate.getTime() - a.lastBuyDate.getTime()
    if (sortBy === "weight") return b.value / totalAssetValue - a.value / totalAssetValue
    if (sortBy === "country" || sortBy === "name" || sortBy === "sector") return a[sortBy].localeCompare(b[sortBy])
    if (sortBy === "ywrv") return b.yieldWithRespectValue - a.yieldWithRespectValue
    if (sortBy === "ywrb") return b.yieldWithRespectBuy - a.yieldWithRespectBuy

    return a.ticker.ticker.localeCompare(b.ticker.ticker)
  }

  const onClickSortHandler = (sb: SortKeys) => () => {
    setSortBy(sb)
    setSortAsc(!sortAsc)
  }

  const handleFilter = (country: string | null, sector: string | null, name: string) => {
    let filteredAssets = [...assets]

    console.log({ country, sector, name })
    if (name !== "") {
      filteredAssets = filteredAssets.filter(
        ({ ticker, name: assetName }) => ticker.ticker.includes(name) || assetName.includes(name),
      )
    }

    if (country !== null) {
      filteredAssets = filteredAssets.filter(({ country: assetCountry }) => assetCountry === country)
    }

    if (sector !== null) {
      filteredAssets = filteredAssets.filter(({ sector: assetSector }) => assetSector === sector)
    }

    setFilteredAssets(filteredAssets)
  }

  useEffect(() => {
    setFilteredAssets(assets)
  }, [assets])

  useEffect(() => {
    const nPages = Math.ceil(filteredAssets.length / MAX_ITEMS_PER_PAGE)
    setNPages(nPages)
    if (currentPage > nPages) {
      setCurrentPage(nPages)
    }
  }, [filteredAssets, currentPage, nPages])

  const availableSectors = useMemo(
    () => [...new Set(assets.map(({ sector }) => sector).filter((s) => s !== null))],
    [assets],
  )

  const assetsToRender = useMemo(() => {
    const start = (currentPage - 1) * MAX_ITEMS_PER_PAGE
    return filteredAssets.sort(sortFunction).slice(start, start + MAX_ITEMS_PER_PAGE)
  }, [sortBy, sortAsc, currentPage, filteredAssets])

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
          <div className="mb-4 flex flex-col gap-4">
            <Filters availableSectors={availableSectors} onFilter={handleFilter} />
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell onClick={onClickSortHandler("name")}>Name</TableHeaderCell>
                  <TableHeaderCell onClick={onClickSortHandler("gain")}>Gain</TableHeaderCell>
                  <TableHeaderCell onClick={onClickSortHandler("sector")}>Sector</TableHeaderCell>
                  <TableHeaderCell onClick={onClickSortHandler("country")}>Country</TableHeaderCell>
                  <TableHeaderCell>Price Evolution</TableHeaderCell>
                  <TableHeaderCell onClick={onClickSortHandler("num-shares")}>Unit Value</TableHeaderCell>
                  <TableHeaderCell>Avg. Price</TableHeaderCell>
                  <TableHeaderCell onClick={onClickSortHandler("num-shares")}># Shares</TableHeaderCell>
                  <TableHeaderCell onClick={onClickSortHandler("last-buy")}>Last buy</TableHeaderCell>
                  <TableHeaderCell onClick={onClickSortHandler("ywrb")}>Yield w.r.t buy</TableHeaderCell>
                  <TableHeaderCell onClick={onClickSortHandler("ywrv")}>Yield w.r.t value</TableHeaderCell>
                  <TableHeaderCell onClick={onClickSortHandler("weight")}>Weight</TableHeaderCell>
                  <TableHeaderCell onClick={onClickSortHandler("amount")}>Amount</TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {assetsToRender.map((asset) => (
                  <AssetTableRow
                    key={`${asset.ticker.ticker}-${asset.currency}`}
                    asset={asset}
                    totalAssetValue={totalAssetValue}
                  />
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
