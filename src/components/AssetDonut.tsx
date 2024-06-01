import { currencyFormatter } from "@/services/utils"
import { useBoundStore } from "@/store"
import { Asset } from "@/types.d"
import { DonutChart, List, ListItem } from "@tremor/react"
import randomColor from "randomcolor"
import { useMemo } from "react"

interface Props {
  by: keyof Asset
  currency: "$" | "€"
  colorMapping?: Record<string, string> | null
}

const currFmt = (currency: "$" | "€", privateMode: boolean) => (num: number) =>
  currencyFormatter(num, currency, privateMode)

export default function AssetDonut({ by, currency, colorMapping = null }: Props) {
  const [assets, privateMode] = useBoundStore((state) => [state.assets, state.privateMode])
  const currencyAssets = useMemo(() => assets.filter((asset) => asset.currency === currency), [assets, currency])
  const uniqueBys = useMemo(() => [...new Set(currencyAssets.map((asset) => asset[by]))], [currencyAssets, by])

  const data = useMemo(() => {
    const totalValue = currencyAssets.map(({ value }) => value).reduce((a, b) => a + b, 0)

    return uniqueBys.map((v, index) => {
      const totalByTag = currencyAssets
        .filter((asset) => asset[by] === v)
        .map(({ value }) => value)
        .reduce((a, b) => a + b, 0)

      let name = v
      if (by === "isFixIncome" && v) name = "Fixed"
      else if (by === "isFixIncome" && !v) name = "Variable"
      else if (name === "") name = "<none>"

      return {
        name: name,
        amount: totalByTag,
        share: ((totalByTag / totalValue) * 100).toFixed(2) + "%",
        color: colorMapping?.[name as string] ?? `bg-[${randomColor({ seed: index })}]`,
      }
    })
  }, [by, colorMapping, currencyAssets, uniqueBys])

  return (
    <>
      <DonutChart
        className="mt-8"
        data={data}
        category="amount"
        index="name"
        valueFormatter={currFmt(currency, privateMode)}
        showTooltip={false}
        colors={data.map(({ color }) => color.replace(/^bg-\[?/, "").replace(/\]$/, ""))}
      />
      <p className="mt-8 flex items-center justify-between text-tremor-label text-tremor-content dark:text-dark-tremor-content">
        <span>Category</span>
        <span>Amount / Share</span>
      </p>
      <List className="mt-2">
        {data.map((item) => (
          <ListItem key={`${item.name}-${currency}`} className="space-x-6">
            <div className="flex items-center space-x-2.5 truncate">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${item.color}`} aria-hidden={true} />
              <span className="truncate dark:text-dark-tremor-content-emphasis">{item.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium tabular-nums text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {currencyFormatter(item.amount, currency, privateMode)}
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
