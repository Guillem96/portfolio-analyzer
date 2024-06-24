import { StateCreator } from "zustand"
import type { Dividend, DividendWithId } from "@/types.d"
import { deleteDividendById, fetchDividends as externalFetchDividends, postDividend } from "@services/dividends"
import { getErrorMessage, showErrorToast } from "@services/utils"
import { SettingSlice } from "./settings"

interface State {
  dividends: DividendWithId[]
  dividendLoading: boolean
  dividendError: string | null
}

interface Actions {
  fetchDividends: () => Promise<void>
  addDividend: (inv: Dividend) => Promise<void>
  deleteDividend: (invId: string) => Promise<void>
}

export type DividendSlice = State & Actions

export const createDividendSlice: StateCreator<State & SettingSlice, [], [], DividendSlice> = (set, get) => ({
  dividends: [],
  dividendLoading: false,
  dividendError: null,
  fetchDividends: async () => {
    const apiSettings = get().getJsonBinSettings()
    if (apiSettings == null) {
      showErrorToast("Invalid API settings...", () => set({ dividendError: null }))
      set({ dividendError: getErrorMessage("Invalid API settings..."), dividendLoading: false })
      return
    }
    set({ dividendLoading: true })
    try {
      const dividends = await externalFetchDividends(apiSettings)
      set({ dividends, dividendLoading: false })
    } catch (error) {
      console.error(error)
      showErrorToast("Error fetching the dividends...", () => set({ dividendError: null }))
      set({ dividendError: getErrorMessage(error), dividendLoading: false })
    }
  },
  addDividend: async (inv: Dividend) => {
    const { dividends: prevDividends, getJsonBinSettings } = get()
    const apiSettings = getJsonBinSettings()
    if (apiSettings == null) {
      showErrorToast("Invalid API settings...", () => set({ dividendError: null }))
      set({ dividendError: getErrorMessage("Invalid API settings..."), dividendLoading: false })
      return
    }

    // Optimistic update in preview
    set({ dividends: [...prevDividends, { ...inv, id: "tmp", preview: true }], dividendLoading: true })
    try {
      const newDividend = await postDividend(inv, apiSettings)
      // Finalize the optimistic update by dropping the preview field
      set({ dividends: [...prevDividends, newDividend], dividendLoading: false })
    } catch (error) {
      // Rollback
      console.error(error)
      set({ dividends: [...prevDividends], dividendLoading: false, dividendError: getErrorMessage(error) })
      showErrorToast("Error posting dividend...", () => set({ dividendError: null }))
    }
  },
  deleteDividend: async (invId: string) => {
    const { dividends: prevDividends, getJsonBinSettings } = get()
    const apiSettings = getJsonBinSettings()
    if (apiSettings == null) {
      showErrorToast("Invalid API settings...", () => set({ dividendError: null }))
      set({ dividendError: getErrorMessage("Invalid API settings..."), dividendLoading: false })
      return
    }
    set({ dividends: prevDividends.filter(({ id }) => id !== invId) })
    try {
      await deleteDividendById(invId, apiSettings)
    } catch (error) {
      // Rollback
      console.error(error)
      set({ dividends: [...prevDividends], dividendLoading: false, dividendError: getErrorMessage(error) })
      showErrorToast("Error deleting dividend...", () => set({ dividendError: null }))
    }
  },
})
