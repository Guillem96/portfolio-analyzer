import { StateCreator } from "zustand"
import type { Asset, PortfolioHistoricEntry } from "@/types.d"

import { fetchAssets, fetchHistoricalData } from "@/services/assets"
import { getErrorMessage, showErrorToast } from "@/services/utils"

interface State {
  assets: Asset[]
  assetsHistoric: PortfolioHistoricEntry[]
  assetsLoading: boolean
  assetsHistoricLoading: boolean
  assetsError: string | null
}

interface Actions {
  fetchAssets: () => Promise<void>
  fetchHistoric: () => Promise<void>
}

export type AssetSlice = State & Actions

export const createAssetsSlice: StateCreator<AssetSlice, [], [], AssetSlice> = (set) => ({
  assets: [],
  assetsLoading: false,
  assetsHistoricLoading: false,
  assetsError: null,
  assetsHistoric: [],
  fetchAssets: async () => {
    set({ assetsLoading: true })
    try {
      const assets = await fetchAssets()
      set({ assets, assetsLoading: false })
    } catch (error) {
      console.error(error)
      showErrorToast("Error fetching the assets...", () => set({ assetsError: null }))
      set({ assetsError: getErrorMessage(error), assetsLoading: false })
    }
  },
  fetchHistoric: async () => {
    try {
      set({ assetsHistoricLoading: true })
      const assetsHistoric = await fetchHistoricalData()
      set({ assetsHistoric, assetsHistoricLoading: false })
    } catch (error) {
      console.error(error)
      showErrorToast("Error fetching the assets...", () => set({ assetsError: null }))
      set({ assetsError: getErrorMessage(error), assetsHistoricLoading: false })
    }
  },
})
