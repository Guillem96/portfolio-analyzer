import { useEffect, useMemo, useRef, useState } from "react"
import {
  Badge,
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
import { RiTimeLine, RiLineChartLine, RiDeleteBin2Line, RiBarChartHorizontalLine } from "@remixicon/react"
import PaginationNav from "@components/PaginationNav"
import { useBoundStore } from "@/store"
import { AssetWithId } from "@/types"
import RiskBadge from "@/components/Risk"
import { currencyFormatter } from "@/services/utils"

interface RowProps {
  asset: AssetWithId
  onDelete: (id: string) => void
  onEdit: (asset: AssetWithId) => void
}

const MAX_ITEMS_PER_PAGE = 8

const extractValueAndCurrency: (text: string) => { value: number; currency: "$" | "€" } | null = (text) => {
  const pattern = /(\d+(?:\.\d+)?)([$€])/
  const match = text.match(pattern)

  if (match) {
    const value = match[1]
    const currency = match[2] as "$" | "€"
    return { value: Number(value), currency }
  }
  return null
}

const AssetTableRow = ({ asset, onDelete, onEdit }: RowProps) => {
  const [editMode, setEditMode] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement | null>(null)

  const { preview, name, id, value, currency, risk, isFixIncome, tag } = asset
  const handleDeleteAsset = (id: string) => () => onDelete(id)

  const stopEditing = () => {
    const newValue = inputRef.current?.value.toString()
    if (newValue === undefined || newValue === "") {
      setEditError("Value cannot be empty")
      return
    }

    const extractedValue = extractValueAndCurrency(newValue)
    if (extractedValue == null) {
      setEditError("Invalid value expression")
      return
    }

    setEditMode(false)
    if (asset.value !== extractedValue.value || asset.currency !== extractedValue.currency)
      onEdit({ ...asset, value: extractedValue.value, currency: extractedValue.currency })
  }

  useEffect(() => {
    if (inputRef == null) return
    inputRef.current?.focus()
  }, [inputRef, editMode])

  return (
    <TableRow className={preview ? "opacity-60 hover:cursor-not-allowed" : ""} key={id}>
      <TableCell>{name}</TableCell>
      <TableCell onDoubleClick={() => setEditMode(true)}>
        {editMode ? (
          <TextInput
            ref={inputRef}
            error={editError != null}
            errorMessage={editError ?? ""}
            onBlur={stopEditing}
            defaultValue={`${value}${currency}`}
          />
        ) : (
          currencyFormatter(value, currency)
        )}
      </TableCell>
      <TableCell>
        {isFixIncome ? (
          <Badge icon={RiBarChartHorizontalLine}>Fixed</Badge>
        ) : (
          <Badge icon={RiLineChartLine}>Variable</Badge>
        )}
      </TableCell>
      <TableCell>
        <RiskBadge risk={risk} />
      </TableCell>
      <TableCell>{tag ? <Badge size="sm">{tag}</Badge> : "-"}</TableCell>
      <TableCell className="flex flex-row gap-x-4 justify-end">
        <Button
          size="xs"
          disabled={preview}
          color="red"
          className="hover:cursor-pointer"
          icon={RiDeleteBin2Line}
          onClick={handleDeleteAsset(id)}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default function AssetTable() {
  const [assets, loading, fetchAssets, editAsset, deleteAsset] = useBoundStore((state) => [
    state.assets,
    state.assetsLoading,
    state.fetchAssets,
    state.editAsset,
    state.deleteAsset,
  ])

  const [currentPage, setCurrentPage] = useState(1)
  const [nPages, setNPages] = useState(Math.ceil(assets.length / MAX_ITEMS_PER_PAGE))

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

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
        <p className="text-center py-4 text-tremor-content dark:text-dark-tremor-content">No assets yet available</p>
      ) : null}

      {assetsToRender.length > 0 ? (
        <>
          <small className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            Double click the value to edit it
          </small>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>

                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Income Type</TableHeaderCell>
                <TableHeaderCell>Risk</TableHeaderCell>
                <TableHeaderCell>Tag</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {assetsToRender.map((asset) => (
                <AssetTableRow key={asset.id} asset={asset} onDelete={deleteAsset} onEdit={editAsset} />
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
