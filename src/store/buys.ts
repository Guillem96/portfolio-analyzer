import { StateCreator } from "zustand"
import type { Buy, BuyWithId } from "@/types.d"
import { deleteBuyById, fetchBuys as externalFetchBuys, postBuy } from "@services/buys"
import { getErrorMessage, showErrorToast } from "@services/utils"
import { SettingSlice } from "./settings"

interface State {
  buys: BuyWithId[]
  buysLoading: boolean
  buysError: string | null
}

interface Actions {
  fetchBuys: () => Promise<void>
  addBuy: (inv: Buy) => Promise<void>
  deleteBuy: (invId: string) => Promise<void>
  forceLoadingBuys: (isLoading: boolean) => void
}

export type BuySlice = State & Actions

export const createBuySlice: StateCreator<State & SettingSlice, [], [], BuySlice> = (set, get) => ({
  buys: [],
  buysLoading: false,
  buysError: null,
  forceLoadingBuys: (isLoading) => set({ buysLoading: isLoading }),
  fetchBuys: async () => {
    const apiSettings = get().getJsonBinSettings()
    if (apiSettings == null) {
      showErrorToast("Invalid API settings...", () => set({ buysError: null }))
      set({ buysError: getErrorMessage("Invalid API settings..."), buysLoading: false })
      return
    }
    set({ buysLoading: true })
    try {
      const buys = await externalFetchBuys(apiSettings)
      set({ buys, buysLoading: false })
    } catch (error) {
      console.error(error)
      showErrorToast("Error fetching the buys...", () => set({ buysError: null }))
      set({ buysError: getErrorMessage(error), buysLoading: false })
    }
  },
  addBuy: async (inv: Buy) => {
    const { buys: prevInv, getJsonBinSettings } = get()
    const apiSettings = getJsonBinSettings()
    if (apiSettings == null) {
      showErrorToast("Invalid API settings...", () => set({ buysError: null }))
      set({ buysError: getErrorMessage("Invalid API settings..."), buysLoading: false })
      return
    }

    // Optimistic update in preview
    set({ buys: [...prevInv, { ...inv, id: "tmp", preview: true }], buysLoading: true })
    try {
      const newInv = await postBuy(inv, apiSettings)
      // Finalize the optimistic update by dropping the preview field
      set({ buys: [...prevInv, newInv], buysLoading: false })
    } catch (error) {
      // Rollback
      console.error(error)
      set({ buys: [...prevInv], buysLoading: false, buysError: getErrorMessage(error) })
      showErrorToast("Error posting investment...", () => set({ buysError: null }))
    }
  },
  deleteBuy: async (invId: string) => {
    const { buys: prevInv, getJsonBinSettings } = get()
    const apiSettings = getJsonBinSettings()
    if (apiSettings == null) {
      showErrorToast("Invalid API settings...", () => set({ buysError: null }))
      set({ buysError: getErrorMessage("Invalid API settings..."), buysLoading: false })
      return
    }
    set({ buys: prevInv.filter(({ id }) => id !== invId) })
    try {
      await deleteBuyById(invId, apiSettings)
    } catch (error) {
      // Rollback
      console.error(error)
      set({ buys: [...prevInv], buysLoading: false, buysError: getErrorMessage(error) })
      showErrorToast("Error deleting investment...", () => set({ buysError: null }))
    }
  },
})
