import { useBoundStore } from "@/store"
import { TickerInfo } from "@/types"

type TickersInfoHook =
  | {
      tickerToInfo: Record<string, TickerInfo>
      loading: false
    }
  | {
      tickerToInfo: null
      loading: true
    }

export const useTickersInfo = (): TickersInfoHook => {
  const assets = useBoundStore((state) => state.assets)
  const assetsLoading = useBoundStore((state) => state.assetsLoading)
  if (assetsLoading) {
    return {
      tickerToInfo: null,
      loading: true,
    }
  }

  return {
    tickerToInfo: Object.fromEntries(assets.map(({ ticker }) => [ticker.ticker, ticker])),
    loading: false,
  }
}
