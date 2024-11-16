import { StateCreator } from "zustand"
import type { TickerInfo } from "@/types.d"

import { getErrorMessage, showErrorToast } from "@services/utils"
import { SettingSlice } from "./settings"
import { AssetSlice } from "./assets"

interface State {
  tickerToInfo: Record<string, TickerInfo>
  tickersLoading: boolean
  tickerError: string | null
}

interface Actions {
  fetchTickers: () => Promise<void>
}

export type TickerSlice = State & Actions

export const createTickerSlice: StateCreator<State & AssetSlice & SettingSlice, [], [], TickerSlice> = (set, get) => ({
  tickerToInfo: {},
  tickersLoading: false,
  tickerError: null,
  fetchTickers: async () => {
    const { assets } = get()
    set({ tickersLoading: true })

    try {
      const tickerToInfo = Object.fromEntries(assets.map(({ ticker }) => [ticker.ticker, ticker]))
      set({ tickerToInfo, tickersLoading: false })
    } catch (error) {
      console.error(error)
      showErrorToast("Error fetching tickers...", () => set({ tickerError: null }))
      set({ tickerError: getErrorMessage("Error fetching  tickers..."), tickersLoading: false })
      return
    }
  },
})
