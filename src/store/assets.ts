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
      const buysInMainCurrency = buys
        .filter(({ isDividendReinvestment }) => !isDividendReinvestment)
        .map(({ amount, currency: buyCurr, units }) => ({
          units,
          amount: amount * exchangeRates[buyCurr][mainCurrency],
        }))

      const buyValue = buysInMainCurrency.reduce((a, b) => a + b.amount, 0)
      const avgPrice = buyValue / units
      const { price, currency: fromCurrency, country, sector } = tickerToInfo[ticker]
      const value = units * price * exchangeRates[fromCurrency][mainCurrency]

      return {
        name: tickerToInfo[ticker].name,
        ticker,
        units,
        value,
        currency: mainCurrency,
        avgPrice,
        country,
        sector,
        buyValue,
      } as Asset
    })
    set({ assets, assetsLoading: false })
  },
})
