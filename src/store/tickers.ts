import { StateCreator } from "zustand"
import type { TickerInfo } from "@/types.d"

import { getErrorMessage, showErrorToast } from "@services/utils"
import { SettingSlice } from "./settings"
import { BuySlice } from "./buys"
import { fetchMultipleTickers } from "@/services/ticker"

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

    const uniqueTickers = new Set(buys.map(({ ticker }) => ticker))
    if (uniqueTickers.size === 0) {
      set({ tickersLoading: false })
      return
    }

    try {
      const tickerToInfo = await fetchMultipleTickers(...uniqueTickers)
      if (tickerToInfo === null) {
        showErrorToast("Error fetching tickers...", () => set({ tickerError: null }))
        return
      }
      set({ tickerToInfo, tickersLoading: false })
    } catch (error) {
      showErrorToast("Error fetching tickers...", () => set({ tickerError: null }))
      set({ tickerError: getErrorMessage("Error fetching  tickers..."), tickersLoading: false })
      return
    }
  },
})
