import { StateCreator } from "zustand"
import type { Asset } from "@/types.d"

import { SettingSlice } from "./settings"
import { BuySlice } from "./buys"
import { TickerSlice } from "./tickers"

interface State {
  assets: Asset[]
  assetsLoading: boolean
  assetsError: string | null
}

interface Actions {
  fetchAssets: () => void
}

export type AssetSlice = State & Actions
type RequestedSlices = BuySlice & SettingSlice & TickerSlice

export const createAssetsSlice: StateCreator<State & RequestedSlices, [], [], AssetSlice> = (set, get) => ({
  assets: [],
  assetsLoading: false,
  assetsError: null,
  fetchAssets: () => {
    const { buys, mainCurrency, tickerToInfo, exchangeRates } = get()
    set({ assetsLoading: true })
    const groupedBuys = Object.groupBy(buys, ({ ticker }) => ticker)
    const assets = Object.entries(groupedBuys).map(([ticker, buys]) => {
      const units = buys.map(({ units }) => units).reduce((a, b) => a + b, 0)
      const buyValue = buys
        .filter(({ isDividendReinvestment }) => !isDividendReinvestment)
        .map(({ amount, currency: buyCurr }) => amount * exchangeRates[buyCurr][mainCurrency])
        .reduce((a, b) => a + b, 0)
      const { price, currency: fromCurrency, country, sector } = tickerToInfo[ticker]
      const value = units * price

      return {
        name: tickerToInfo[ticker].name,
        ticker,
        units,
        value: value * exchangeRates[fromCurrency][mainCurrency],
        currency: mainCurrency,
        country,
        sector,
        buyValue,
      } as Asset
    })
    set({ assets, assetsLoading: false })
  },
})
