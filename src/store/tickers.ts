import { StateCreator } from "zustand"
import type { TickerInfo } from "@/types.d"

import { getErrorMessage, showErrorToast } from "@services/utils"
import { SettingSlice } from "./settings"
import { BuySlice } from "./buys"
import { fetchTicker } from "@/services/ticker"

interface State {
  tickerToInfo: Record<string, TickerInfo>
  tickersLoading: boolean
  tickerError: string | null
}

interface Actions {
  fetchTickers: () => Promise<void>
}

export type TickerSlice = State & Actions

export const createTickerSlice: StateCreator<State & BuySlice & SettingSlice, [], [], TickerSlice> = (set, get) => ({
  tickerToInfo: {},
  tickersLoading: false,
  tickerError: null,
  fetchTickers: async () => {
    const { buys } = get()
    set({ tickersLoading: true })

    let tickerToInfo: Record<string, TickerInfo>
    const uniqueTickers = new Set(buys.map(({ ticker }) => ticker))
    try {
      const tikckers = await Promise.all([...uniqueTickers].map(fetchTicker))
      tickerToInfo = Object.fromEntries(
        tikckers.filter((ticker) => ticker !== null).map((ticker) => [ticker.ticker, ticker]),
      )
    } catch (error) {
      showErrorToast("Error fetching tickers...", () => set({ tickerError: null }))
      set({ tickerError: getErrorMessage("Error fetching  tickers..."), tickersLoading: false })
      return
    }

    set({ tickerToInfo, tickersLoading: false })
  },
})
