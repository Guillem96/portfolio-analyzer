import { StateCreator } from "zustand"
import type { Dividend, DividendWithId } from "@/types.d"
import {
  deleteDividendById,
  fetchDividends as externalFetchDividends,
  fetchDividendsPreferredCurrency,
  postDividend,
} from "@services/dividends"
import { getErrorMessage, showErrorToast } from "@services/utils"
import { SettingSlice } from "./settings"

interface State {
  dividends: DividendWithId[]
  dividendsPreferredCurrency: DividendWithId[]
  selectedDividend: Dividend | null
  dividendLoading: boolean
  dividendError: string | null
}

interface Actions {
  fetchDividends: () => Promise<void>
  fetchDividendsPreferredCurrency: () => Promise<void>
  addDividend: (inv: Dividend) => Promise<void>
  deleteDividend: (invId: string) => Promise<void>
  selectDividend: (dividend: Dividend) => void
}

export type DividendSlice = State & Actions

export const createDividendSlice: StateCreator<State & SettingSlice, [], [], DividendSlice> = (set, get) => ({
  dividends: [],
  dividendsPreferredCurrency: [],
  selectedDividend: null,
  dividendLoading: false,
  dividendError: null,
  fetchDividends: async () => {
    set({ dividendLoading: true })
    try {
      const dividends = await externalFetchDividends()
      set({ dividends, dividendLoading: false })
    } catch (error) {
      console.error(error)
      showErrorToast("Error fetching the dividends...", () => set({ dividendError: null }))
      set({ dividendError: getErrorMessage(error), dividendLoading: false })
    }
  },
  fetchDividendsPreferredCurrency: async () => {
    set({ dividendLoading: true })
    try {
      const dividendsPreferredCurrency = await fetchDividendsPreferredCurrency()
      set({ dividendsPreferredCurrency, dividendLoading: false })
    } catch (error) {
      console.error(error)
      showErrorToast("Error fetching the dividends...", () => set({ dividendError: null }))
      set({ dividendError: getErrorMessage(error), dividendLoading: false })
    }
  },
  addDividend: async (inv: Dividend) => {
    const { dividends: prevDividends } = get()

    // Optimistic update in preview
    set({ dividends: [...prevDividends, { ...inv, id: "tmp", preview: true }], dividendLoading: true })
    try {
      const newDividend = await postDividend(inv)
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
    const { dividends: prevDividends } = get()
    set({ dividends: prevDividends.filter(({ id }) => id !== invId) })
    try {
      await deleteDividendById(invId)
    } catch (error) {
      // Rollback
      console.error(error)
      set({ dividends: [...prevDividends], dividendLoading: false, dividendError: getErrorMessage(error) })
      showErrorToast("Error deleting dividend...", () => set({ dividendError: null }))
    }
  },
  selectDividend: (dividend: Dividend) => {
    set({ selectedDividend: dividend })
  },
})
