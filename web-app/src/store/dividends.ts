import { StateCreator } from "zustand"
import type { Dividend, DividendWithId } from "@/types.d"
import {
  deleteDividendById,
  fetchDividends as externalFetchDividends,
  fetchDividendsPreferredCurrency,
  postDividend,
  updateDividends,
} from "@services/dividends"
import { getErrorMessage, showErrorToast } from "@services/utils"
import { SettingSlice } from "./settings"
import { PREVIEW_EXANGE_RATES } from "@/constants"

interface State {
  dividends: DividendWithId[]
  dividendsPreferredCurrency: DividendWithId[]
  selectedDividend: Dividend | null
  dividendLoading: boolean
  addDividendLoading: boolean
  dividendsPreferredCurrencyLoading: boolean
  dividendError: string | null
}

interface Actions {
  fetchDividends: () => Promise<void>
  fetchDividendsPreferredCurrency: () => Promise<void>
  addDividend: (inv: Dividend) => Promise<void>
  deleteDividend: (invId: string) => Promise<void>
  selectDividend: (dividend: Dividend) => void
  markDividendAsReinvested: (toUpdate: Record<string, boolean>) => Promise<void>
}

export type DividendSlice = State & Actions

export const createDividendSlice: StateCreator<State & SettingSlice, [], [], DividendSlice> = (set, get) => ({
  dividends: [],
  dividendsPreferredCurrency: [],
  selectedDividend: null,
  dividendLoading: false,
  addDividendLoading: false,
  dividendsPreferredCurrencyLoading: false,
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
    set({ dividendsPreferredCurrencyLoading: true })
    try {
      const dividendsPreferredCurrency = await fetchDividendsPreferredCurrency()
      set({ dividendsPreferredCurrency, dividendsPreferredCurrencyLoading: false })
    } catch (error) {
      console.error(error)
      showErrorToast("Error fetching the dividends...", () => set({ dividendError: null }))
      set({ dividendError: getErrorMessage(error), dividendsPreferredCurrencyLoading: false })
    }
  },
  addDividend: async (inv: Dividend) => {
    const { dividends: prevDividends, dividendsPreferredCurrency: prevDividendsPreferredCurrency, mainCurrency } = get()

    // Optimistic update in preview
    set({
      dividends: [
        ...prevDividends,
        { ...inv, id: "tmp", preview: true, tickerData: { ticker: inv.company, website: "", name: "" } },
      ],
      dividendsPreferredCurrency: [
        ...prevDividendsPreferredCurrency,
        {
          ...inv,
          id: "tmp",
          amount: inv.amount * PREVIEW_EXANGE_RATES[inv.currency][mainCurrency],
          currency: mainCurrency,
          preview: true,
          tickerData: { ticker: inv.company, website: "", name: "" },
        },
      ],
      addDividendLoading: true,
    })
    try {
      const newDividend = await postDividend(inv)
      // Finalize the optimistic update by dropping the preview field
      set({ dividends: [...prevDividends, newDividend], addDividendLoading: false })
    } catch (error) {
      // Rollback
      console.error(error)
      set({
        dividends: [...prevDividends],
        dividendsPreferredCurrency: [...prevDividendsPreferredCurrency],
        addDividendLoading: false,
        dividendError: getErrorMessage(error),
      })
      showErrorToast("Error posting dividend...", () => set({ dividendError: null }))
    }
  },
  deleteDividend: async (invId: string) => {
    const { dividends: prevDividends, dividendsPreferredCurrency: prevDividendsPreferredCurrency } = get()
    set({
      dividends: prevDividends.filter(({ id }) => id !== invId),
      dividendsPreferredCurrency: prevDividendsPreferredCurrency.filter(({ id }) => id !== invId),
    })
    try {
      await deleteDividendById(invId)
    } catch (error) {
      // Rollback
      console.error(error)
      set({
        dividends: [...prevDividends],
        dividendsPreferredCurrency: [...prevDividendsPreferredCurrency],
        dividendLoading: false,
        dividendError: getErrorMessage(error),
      })
      showErrorToast("Error deleting dividend...", () => set({ dividendError: null }))
    }
  },
  selectDividend: (dividend: Dividend) => {
    set({ selectedDividend: dividend })
  },
  markDividendAsReinvested: async (toUpdate: Record<string, boolean>) => {
    const { dividends: prevDividends, dividendsPreferredCurrency: prevDividendsPreferredCurrency } = get()
    const updatedDividends = prevDividends.map((div) => {
      if (div.id in toUpdate) {
        return { ...div, isReinvested: toUpdate[div.id] }
      }
      return div
    })
    const updatedDividendsPreferredCurrency = prevDividendsPreferredCurrency.map((div) => {
      if (div.id in toUpdate) {
        return { ...div, isReinvested: toUpdate[div.id] }
      }
      return div
    })

    set({ dividends: updatedDividends, dividendsPreferredCurrency: updatedDividendsPreferredCurrency })
    try {
      await updateDividends(toUpdate)
    } catch (error) {
      // Rollback
      console.error(error)
      set({
        dividends: [...prevDividends],
        dividendsPreferredCurrency: prevDividendsPreferredCurrency,
        dividendLoading: false,
        dividendError: getErrorMessage(error),
      })
      showErrorToast("Error deleting dividend...", () => set({ dividendError: null }))
    }
  },
})
