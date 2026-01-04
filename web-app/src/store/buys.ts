import { StateCreator } from "zustand"
import type { Buy, BuyWithId } from "@/types.d"
import { deleteBuyById, fetchBuys as externalFetchBuys, postBuy } from "@services/buys"
import { getErrorMessage, showErrorToast } from "@services/utils"

interface State {
  buys: BuyWithId[]
  buysLoading: boolean
  addBuyLoading: boolean
  buysError: string | null
}

interface Actions {
  fetchBuys: () => Promise<void>
  addBuy: (inv: Buy) => Promise<void>
  deleteBuy: (invId: string) => Promise<void>
  forceLoadingBuys: (isLoading: boolean) => void
}

export type BuySlice = State & Actions

export const createBuySlice: StateCreator<State, [], [], BuySlice> = (set, get) => ({
  buys: [],
  buysLoading: false,
  addBuyLoading: false,
  buysError: null,
  forceLoadingBuys: (isLoading) => set({ addBuyLoading: isLoading }),
  fetchBuys: async () => {
    set({ buysLoading: true })
    try {
      const buys = await externalFetchBuys()
      set({ buys, buysLoading: false })
    } catch (error) {
      console.error(error)
      showErrorToast("Error fetching the buys...", () => set({ buysError: null }))
      set({ buysError: getErrorMessage(error), buysLoading: false })
    }
  },
  addBuy: async (inv: Buy) => {
    const { buys: prevInv } = get()

    set({
      buys: [
        ...prevInv,
        {
          ...inv,
          id: "tmp",
          preview: true,
          tickerData: {
            ticker: inv.ticker,
            website: "",
            name: "",
          },
        },
      ],
      addBuyLoading: true,
    })

    try {
      const newInv = await postBuy(inv)
      // Finalize the optimistic update by dropping the preview field
      set({ buys: [...prevInv, newInv], addBuyLoading: false })
    } catch (error) {
      // Rollback
      console.error(error)
      set({ buys: [...prevInv], addBuyLoading: false, buysError: getErrorMessage(error) })
      showErrorToast("Error posting investment...", () => set({ buysError: null }))
    }
  },
  deleteBuy: async (invId: string) => {
    const { buys: prevInv } = get()
    set({ buys: prevInv.filter(({ id }) => id !== invId) })
    try {
      await deleteBuyById(invId)
    } catch (error) {
      // Rollback
      console.error(error)
      set({ buys: [...prevInv], buysLoading: false, buysError: getErrorMessage(error) })
      showErrorToast("Error deleting investment...", () => set({ buysError: null }))
    }
  },
})
