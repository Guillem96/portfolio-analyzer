import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { Asset, CurrencyType } from "@/types.d"
import { DonutChart, List, ListItem } from "@tremor/react"
import { useMemo } from "react"
import { PASTEL_VIVID_COLORS } from "@/constants"

interface Props {
  by: keyof Asset
  colorMapping?: Record<string, string> | null
}

const currFmt = (currency: CurrencyType, privateMode: boolean) => (num: number) =>
  currencyFormatter(num, currency, privateMode)

export default function AssetDonut({ by, colorMapping = null }: Props) {
  const [assets, privateMode, mainCurrency] = useBoundStore((state) => [
    state.assets,
    state.privateMode,
    state.mainCurrency,
  ])
  const uniqueBys = useMemo(() => [...new Set(assets.map((asset) => asset[by]))], [assets, by])

  const data = useMemo(() => {
    const totalValue = assets.map(({ value }) => value).reduce((a, b) => a + b, 0)

    return uniqueBys.map((v, index) => {
      const totalByTag = assets
        .filter((asset) => asset[by] === v)
        .map(({ value }) => value)
        .reduce((a, b) => a + b, 0)

      let name = v
      if (name === "") name = "<none>"

      return {
        name: name,
        amount: totalByTag,
        share: ((totalByTag / totalValue) * 100).toFixed(2) + "%",
        color: colorMapping?.[name as string] ?? `bg-[${PASTEL_VIVID_COLORS[index]}]`,
      }
    })
  }, [assets, by, colorMapping, uniqueBys])

  return (
    <>
      <DonutChart
        className="mt-8"
        data={data}
        category="amount"
        index="name"
        valueFormatter={currFmt(mainCurrency, privateMode)}
        showTooltip={false}
        colors={data.map(({ color }) => color.replace(/^bg-\[?/, "").replace(/\]$/, ""))}
      />
      <p className="mt-8 flex items-center justify-between text-tremor-label text-tremor-content dark:text-dark-tremor-content">
        <span>Category</span>
        <span>Amount / Share</span>
      </p>
      <List className="mt-2">
        {data.map((item) => (
          <ListItem key={`${item.name}-${mainCurrency}`} className="space-x-6">
            <div className="flex items-center space-x-2.5 truncate">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${item.color}`} aria-hidden={true} />
              <span className="truncate dark:text-dark-tremor-content-emphasis">{item.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium tabular-nums text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {currencyFormatter(item.amount, mainCurrency, privateMode)}
              </span>
              <span className="rounded-tremor-small bg-tremor-background-subtle px-1.5 py-0.5 text-tremor-label font-medium tabular-nums text-tremor-content-emphasis dark:bg-dark-tremor-background-subtle dark:text-dark-tremor-content-emphasis">
                {item.share}
              </span>
            </div>
          </ListItem>
        ))}
      </List>
    </>
  )
}
