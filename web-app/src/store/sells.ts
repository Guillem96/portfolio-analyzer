import { StateCreator } from "zustand"
import type { Sell, SellWithId } from "@/types.d"
import { deleteSellById, fetchSells as externalFetchSells, postSell } from "@services/sells"
import { getErrorMessage, showErrorToast } from "@services/utils"
import { AssetSlice } from "./assets"
interface State {
  sells: SellWithId[]
  sellsLoading: boolean
  addSellLoading: boolean
  sellsError: string | null
}

interface Actions {
  fetchSells: () => Promise<void>
  addSell: (inv: Omit<Sell, "accumulatedFees">) => Promise<void>
  deleteSell: (invId: string) => Promise<void>
  forceLoadingSells: (isLoading: boolean) => void
}

export type SellSlice = State & Actions

export const createSellSlice: StateCreator<State & AssetSlice, [], [], SellSlice> = (set, get) => ({
  sells: [],
  sellsLoading: false,
  addSellLoading: false,
  sellsError: null,
  forceLoadingSells: (isLoading) => set({ addSellLoading: isLoading }),
  fetchSells: async () => {
    set({ sellsLoading: true })
    try {
      const sells = await externalFetchSells()
      set({ sells, sellsLoading: false })
    } catch (error) {
      console.error(error)
      showErrorToast("Error fetching the sells...", () => set({ sellsError: null }))
      set({ sellsError: getErrorMessage(error), sellsLoading: false })
    }
  },
  addSell: async (inv: Omit<Sell, "accumulatedFees">) => {
    const { sells: prevInv, assets: prevAssets } = get()

    // Optimistic update in preview
    set({
      sells: [
        ...prevInv,
        {
          ...inv,
          id: "tmp",
          tickerData: { ticker: inv.ticker, website: "", name: "" },
          accumulatedFees: 0,
          preview: true,
          acquisitionValue: 0,
        },
      ],
      addSellLoading: true,
    })
    try {
      const newInv = await postSell(inv)
      // Finalize the optimistic update by dropping the preview field
      set({
        sells: [...prevInv, newInv],
        addSellLoading: false,
        assets: prevAssets.map((asset) => {
          if (asset.ticker.ticker === inv.ticker) {
            return { ...asset, units: asset.units - inv.units }
          }
          return asset
        }),
      })
    } catch (error) {
      // Rollback
      console.error(error)
      set({ sells: [...prevInv], addSellLoading: false, sellsError: getErrorMessage(error) })
      showErrorToast("Error posting investment...", () => set({ sellsError: null }))
    }
  },
  deleteSell: async (invId: string) => {
    const { sells: prevInv } = get()
    set({ sells: prevInv.filter(({ id }) => id !== invId) })
    try {
      await deleteSellById(invId)
    } catch (error) {
      // Rollback
      console.error(error)
      set({ sells: [...prevInv], sellsLoading: false, sellsError: getErrorMessage(error) })
      showErrorToast("Error deleting investment...", () => set({ sellsError: null }))
    }
  },
})
