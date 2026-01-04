import { Card, Icon, List, ListItem } from "@tremor/react"
import { useMemo } from "react"
import { getWebsiteLogo } from "@/services/utils"
import { RiTimeLine } from "@remixicon/react"
import { useTickersInfo } from "@/hooks/tickers"
import { Skeleton } from "@/components/ui/Skeleton"

const LoadingSkeleton = () => {
  return (
    <Card>
      <div className="flex flex-col gap-y-4">
        <article>
          <h1 className="mb-4 max-w-2xl text-3xl tracking-tight text-slate-900 dark:text-neutral-300">Top Gainers</h1>

          <List className="flex flex-col gap-2">
            <Skeleton height={30}></Skeleton>
            <Skeleton height={30}></Skeleton>
            <Skeleton height={30}></Skeleton>
            <Skeleton height={30}></Skeleton>
            <Skeleton height={30}></Skeleton>
          </List>
        </article>

        <article>
          <h1 className="mb-4 max-w-2xl text-3xl tracking-tight text-slate-900 dark:text-neutral-300">Top Losers</h1>

          <List className="flex flex-col gap-2">
            <Skeleton height={30}></Skeleton>
            <Skeleton height={30}></Skeleton>
            <Skeleton height={30}></Skeleton>
            <Skeleton height={30}></Skeleton>
            <Skeleton height={30}></Skeleton>
          </List>
        </article>
      </div>
    </Card>
  )
}

export default function TopMovers() {
  const { tickerToInfo, loading } = useTickersInfo()
  const topGainers = useMemo(() => {
    return Object.entries(tickerToInfo || {})
      .sort(([, a], [, b]) => b.changeRate - a.changeRate)
      .slice(0, 5)
      .map(([ticker, info]) => ({ ...info, ticker }))
  }, [tickerToInfo])

  const topLosers = useMemo(() => {
    return Object.entries(tickerToInfo || {})
      .sort(([, a], [, b]) => a.changeRate - b.changeRate)
      .slice(0, 5)
      .map(([ticker, info]) => ({ ...info, ticker }))
  }, [tickerToInfo])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (topGainers.length === 0 && topLosers.length === 0) {
    return (
      <Card>
        <div className="flex flex-row justify-center align-middle">
          <Icon icon={RiTimeLine} />
          <p className="text-tremor-content dark:text-dark-tremor-content">No assets yet available</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex flex-col gap-y-4">
        <article>
          <h1 className="mb-4 max-w-2xl text-3xl tracking-tight text-slate-900 dark:text-neutral-300">Top Gainers</h1>

          <List className="flex flex-col gap-2">
            {topGainers.map((ticker) => (
              <ListItem className="flex flex-row items-center justify-between gap-4" key={ticker.name}>
                <img
                  className="d-block h-8 w-8 rounded-full bg-transparent bg-white"
                  src={getWebsiteLogo(ticker.website)}
                  alt={`${ticker.ticker} company logo`}
                />
                <div className="flex flex-grow flex-row justify-start gap-2 truncate text-left">
                  <p className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                    {ticker.ticker}
                  </p>
                  <span className="hidden text-tremor-default text-tremor-content dark:text-dark-tremor-content md:block">
                    {ticker.name}
                  </span>
                </div>

                <span
                  className={` ${
                    Math.sign(ticker.changeRate) === 1
                      ? "bg-emerald-100 text-center text-emerald-800 ring-emerald-600/10 dark:bg-emerald-400/10 dark:text-emerald-500 dark:ring-emerald-400/20"
                      : "bg-red-100 text-center text-red-800 ring-red-600/10 dark:bg-red-400/10 dark:text-red-500 dark:ring-red-400/20"
                  } inline-flex items-center justify-center rounded-tremor-small px-2 py-1 text-tremor-label font-medium ring-1 ring-inset`}
                >
                  {`${ticker.changeRate.toFixed(2)} %`}
                </span>
              </ListItem>
            ))}
          </List>
        </article>

        <article>
          <h1 className="mb-4 max-w-2xl text-3xl tracking-tight text-slate-900 dark:text-neutral-300">Top Losers</h1>

          <List className="flex flex-col gap-2">
            {topLosers.map((ticker) => (
              <ListItem className="flex flex-row items-center justify-between gap-4" key={ticker.name}>
                <img
                  className="d-block h-8 w-8 rounded-full bg-transparent bg-white"
                  src={getWebsiteLogo(ticker.website)}
                  alt={`${ticker.ticker} company logo`}
                />
                <div className="flex flex-grow flex-row justify-start gap-2 truncate text-left">
                  <p className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                    {ticker.ticker}
                  </p>
                  <span className="hidden text-tremor-default text-tremor-content dark:text-dark-tremor-content md:block">
                    {ticker.name}
                  </span>
                </div>
                <div
                  className={` ${
                    Math.sign(ticker.changeRate) === 1
                      ? "bg-emerald-100 text-center text-emerald-800 ring-emerald-600/10 dark:bg-emerald-400/10 dark:text-emerald-500 dark:ring-emerald-400/20"
                      : "bg-red-100 text-center text-red-800 ring-red-600/10 dark:bg-red-400/10 dark:text-red-500 dark:ring-red-400/20"
                  } inline-flex items-center justify-center rounded-tremor-small px-2 py-1 text-tremor-label font-medium ring-1 ring-inset`}
                >
                  {`${ticker.changeRate.toFixed(2)} %`}
                </div>
              </ListItem>
            ))}
          </List>
        </article>
      </div>
    </Card>
  )
}
