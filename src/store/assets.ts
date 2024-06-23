import { StateCreator } from "zustand"
import type { Asset, TickerInfo } from "@/types.d"

import { getErrorMessage, showErrorToast } from "@services/utils"
import { SettingSlice } from "./settings"
import { BuySlice } from "./buys"
import { fetchTicker } from "@/services/ticker"
import { EXCHANGE_RATES } from "@/constants"

interface State {
  assets: Asset[]
  assetsLoading: boolean
  assetsError: string | null
}

interface Actions {
  fetchAssets: () => Promise<void>
}

export type AssetSlice = State & Actions

export const createAssetsSlice: StateCreator<State & BuySlice & SettingSlice, [], [], AssetSlice> = (set, get) => ({
  assets: [],
  assetsLoading: false,
  assetsError: null,
  fetchAssets: async () => {
    const { buys, mainCurrency } = get()
    set({ assetsLoading: true })

    let tickerToInfo: Record<string, TickerInfo>
    const uniqueTickers = new Set(buys.map(({ ticker }) => ticker))
    try {
      const tikckers = await Promise.all([...uniqueTickers].map(fetchTicker))
      tickerToInfo = Object.fromEntries(
        tikckers.filter((ticker) => ticker !== null).map((ticker) => [ticker.ticker, ticker]),
      )
    } catch (error) {
      showErrorToast("Error fetching assets tickers...", () => set({ assetsError: null }))
      set({ assetsError: getErrorMessage("Error fetching assets tickers..."), assetsLoading: false })
      return
    }
    const groupedBuys = Object.groupBy(buys, ({ ticker }) => ticker)
    const assets = Object.entries(groupedBuys).map(([key, buys]) => {
      const [ticker] = key.split("_")
      const units = buys.map(({ units }) => units).reduce((a, b) => a + b)
      const { price, currency: fromCurrency, country, sector } = tickerToInfo[ticker]
      const value = units * price

      return {
        ticker,
        units,
        value: value * EXCHANGE_RATES[fromCurrency][mainCurrency],
        currency: mainCurrency,
        country,
        sector,
      } as Asset
    })
    set({ assets, assetsLoading: false })
  },
})
