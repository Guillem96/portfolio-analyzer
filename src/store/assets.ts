import { StateCreator } from "zustand"
import type { Asset, AssetWithId } from "@/types.d"
import {
  deleteAssetById,
  fetchAssets as externalFetchAssets,
  postAsset,
  editAsset as externalEditAsset,
} from "@services/assets"
import { getErrorMessage, showErrorToast } from "@services/utils"
import { SettingSlice } from "./settings"

interface State {
  assets: AssetWithId[]
  assetsLoading: boolean
  assetsError: string | null
}

interface Actions {
  fetchAssets: () => Promise<void>
  addAsset: (asset: Asset) => Promise<void>
  editAsset: (asset: AssetWithId) => Promise<void>
  deleteAsset: (assetId: string) => Promise<void>
}

export type AssetSlice = State & Actions

export const createAssetsSlice: StateCreator<State & SettingSlice, [], [], AssetSlice> = (set, get) => ({
  assets: [],
  // [
  //   {
  //     name: "Siemens",
  //     value: 7900,
  //     currency: "€",
  //     tag: "",
  //     risk: "medium",
  //     isFixIncome: false,
  //     id: "66842f70-b391-4d74-a448-221dd5978dfa",
  //   },
  //   {
  //     name: "Crypto ETF",
  //     value: 500,
  //     currency: "$",
  //     tag: "crypto",
  //     risk: "high",
  //     isFixIncome: false,
  //     id: "82e0f16e-55ad-4aac-8da4-db747394c059",
  //   },
  //   {
  //     name: "BND",
  //     value: 400,
  //     currency: "$",
  //     tag: "",
  //     risk: "low",
  //     isFixIncome: true,
  //     id: "c0f788b0-8da0-4f70-972f-0711082a5dd5",
  //   },
  // ],
  assetsLoading: false,
  assetsError: null,
  fetchAssets: async () => {
    const { getJsonBinSettings } = get()
    const apiSettings = getJsonBinSettings()
    if (apiSettings == null) {
      showErrorToast("Invalid API settings...", () => set({ assetsError: null }))
      set({ assetsError: getErrorMessage("Invalid API settings..."), assetsLoading: false })
      return
    }
    set({ assetsLoading: true })
    try {
      const assets = await externalFetchAssets(apiSettings)
      set({ assets, assetsLoading: false })
    } catch (error) {
      console.error(error)
      showErrorToast("Error fetching the assets...", () => set({ assetsError: null }))
      set({ assetsError: getErrorMessage(error), assetsLoading: false })
    }
  },
  addAsset: async (asset: Asset) => {
    const { assets: prevAssets, getJsonBinSettings } = get()

    const apiSettings = getJsonBinSettings()
    if (apiSettings == null) {
      showErrorToast("Invalid API settings...", () => set({ assetsError: null }))
      set({ assetsError: getErrorMessage("Invalid API settings..."), assetsLoading: false })
      return
    }

    // Optimistic update in preview
    set({ assets: [...prevAssets, { ...asset, id: "tmp", preview: true }], assetsLoading: true })
    try {
      const newAsset = await postAsset(asset, apiSettings)
      // Finalize the optimistic update by dropping the preview field
      set({ assets: [...prevAssets, newAsset], assetsLoading: false })
    } catch (error) {
      // Rollback
      console.error(error)
      set({ assets: [...prevAssets], assetsLoading: false, assetsError: getErrorMessage(error) })
      showErrorToast("Error posting asset...", () => set({ assetsError: null }))
    }
  },
  editAsset: async (asset: AssetWithId) => {
    const { assets: prevAssets, getJsonBinSettings } = get()
    const apiSettings = getJsonBinSettings()
    if (apiSettings == null) {
      showErrorToast("Invalid API settings...", () => set({ assetsError: null }))
      set({ assetsError: getErrorMessage("Invalid API settings..."), assetsLoading: false })
      return
    }

    // Optimistic update in preview
    set({
      assets: prevAssets.map((prev) => {
        if (prev.id === asset.id) return { ...asset, preview: true }
        return prev
      }),
      assetsLoading: true,
    })

    try {
      await externalEditAsset(asset, apiSettings)
      // Finalize the optimistic update by dropping the preview field
      set({
        assets: prevAssets.map((prev) => {
          if (prev.id === asset.id) return { ...asset, preview: false }
          return prev
        }),
        assetsLoading: false,
      })
    } catch (error) {
      // Rollback
      console.error(error)
      set({ assets: [...prevAssets], assetsLoading: false, assetsError: getErrorMessage(error) })
      showErrorToast("Error posting asset...", () => set({ assetsError: null }))
    }
  },
  deleteAsset: async (assetId: string) => {
    const { assets: prevAssets, getJsonBinSettings } = get()
    const apiSettings = getJsonBinSettings()
    if (apiSettings == null) {
      showErrorToast("Invalid API settings...", () => set({ assetsError: null }))
      set({ assetsError: getErrorMessage("Invalid API settings..."), assetsLoading: false })
      return
    }
    set({ assets: prevAssets.filter(({ id }) => id !== assetId) })
    try {
      await deleteAssetById(assetId, apiSettings)
    } catch (error) {
      // Rollback
      console.error(error)
      set({ assets: [...prevAssets], assetsLoading: false, assetsError: getErrorMessage(error) })
      showErrorToast("Error deleting asset...", () => set({ assetsError: null }))
    }
  },
})
