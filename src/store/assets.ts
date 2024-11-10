import { StateCreator } from "zustand"
import type { Asset } from "@/types.d"

import { fetchAssets } from "@/services/assets"
import { getErrorMessage, showErrorToast } from "@/services/utils"

interface State {
  assets: Asset[]
  assetsLoading: boolean
  assetsError: string | null
}

interface Actions {
  fetchAssets: () => Promise<void>
}

export type AssetSlice = State & Actions

export const createAssetsSlice: StateCreator<AssetSlice, [], [], AssetSlice> = (set) => ({
  assets: [],
  assetsLoading: false,
  assetsError: null,
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
})
