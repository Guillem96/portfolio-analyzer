import { StateCreator } from "zustand"
import type { Investment, InvestmentWithId } from "@/types.d"
import {
  deleteInvestmentById,
  fetchInvestments as externalFetchInvestments,
  postInvestment,
} from "@services/investments"
import { getErrorMessage, showErrorToast } from "@services/utils"
import { SettingSlice } from "./settings"

interface State {
  investments: InvestmentWithId[]
  investmentLoading: boolean
  investmentError: string | null
}

interface Actions {
  fetchInvestments: () => Promise<void>
  addInvestment: (inv: Investment) => Promise<void>
  deleteInvestment: (invId: string) => Promise<void>
}

export type InvestmentSlice = State & Actions

export const createInvestmentSlice: StateCreator<State & SettingSlice, [], [], InvestmentSlice> = (set, get) => ({
  investments: [],
  //   {
  //     amount: 1000,
  //     currency: "$",
  //     date: 1711523689429,
  //     id: "8e868b82-e2c7-46e2-b677-644cd2ce0ba2",
  //   },
  //   {
  //     amount: 1000,
  //     currency: "$",
  //     date: 1711523689429,
  //     id: "47eda030-4d27-425a-a79e-8fa6d89bf58f",
  //   },
  //   {
  //     amount: 1000,
  //     currency: "$",
  //     date: 1711523689429,
  //     id: "9d96f2a6-ef3b-4473-bac5-6d42150006e5",
  //   },
  //   {
  //     amount: 400,
  //     currency: "€",
  //     date: 1709593200000,
  //     id: "3a23da9c-137c-42c2-b685-4e03675fefb3",
  //   },
  // ],
  investmentLoading: false,
  investmentError: null,
  fetchInvestments: async () => {
    const apiSettings = get().getJsonBinSettings()
    if (apiSettings == null) {
      showErrorToast("Invalid API settings...", () => set({ investmentError: null }))
      set({ investmentError: getErrorMessage("Invalid API settings..."), investmentLoading: false })
      return
    }
    set({ investmentLoading: true })
    try {
      const investments = await externalFetchInvestments(apiSettings)
      set({ investments, investmentLoading: false })
    } catch (error) {
      console.error(error)
      showErrorToast("Error fetching the investments...", () => set({ investmentError: null }))
      set({ investmentError: getErrorMessage(error), investmentLoading: false })
    }
  },
  addInvestment: async (inv: Investment) => {
    const { investments: prevInv, getJsonBinSettings } = get()
    const apiSettings = getJsonBinSettings()
    if (apiSettings == null) {
      showErrorToast("Invalid API settings...", () => set({ investmentError: null }))
      set({ investmentError: getErrorMessage("Invalid API settings..."), investmentLoading: false })
      return
    }

    // Optimistic update in preview
    set({ investments: [...prevInv, { ...inv, id: "tmp", preview: true }], investmentLoading: true })
    try {
      const newInv = await postInvestment(inv, apiSettings)
      // Finalize the optimistic update by dropping the preview field
      set({ investments: [...prevInv, newInv], investmentLoading: false })
    } catch (error) {
      // Rollback
      console.error(error)
      set({ investments: [...prevInv], investmentLoading: false, investmentError: getErrorMessage(error) })
      showErrorToast("Error posting investment...", () => set({ investmentError: null }))
    }
  },
  deleteInvestment: async (invId: string) => {
    const { investments: prevInv, getJsonBinSettings } = get()
    const apiSettings = getJsonBinSettings()
    if (apiSettings == null) {
      showErrorToast("Invalid API settings...", () => set({ investmentError: null }))
      set({ investmentError: getErrorMessage("Invalid API settings..."), investmentLoading: false })
      return
    }
    set({ investments: prevInv.filter(({ id }) => id !== invId) })
    try {
      await deleteInvestmentById(invId, apiSettings)
    } catch (error) {
      // Rollback
      console.error(error)
      set({ investments: [...prevInv], investmentLoading: false, investmentError: getErrorMessage(error) })
      showErrorToast("Error deleting investment...", () => set({ investmentError: null }))
    }
  },
})
