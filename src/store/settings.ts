import { DEFAULT_EXCHANGE_RATES } from "@/constants"
import { fetchAllRates } from "@/services/rates"
import { showErrorToast } from "@/services/utils"
import { CurrencyType } from "@/types"
import { StateCreator } from "zustand"

interface State {
  inSettingsScreen: boolean
  darkMode: boolean
  privateMode: boolean
  mainCurrency: CurrencyType
  exchangeRates: Record<CurrencyType, Record<CurrencyType, number>>
}

interface Actions {
  setInSettingsScreen: (em: boolean) => void
  toggleDarkMode: () => void
  togglePrivateMode: () => void
  setMainCurrency: (mainCurrency: CurrencyType) => void
  fetchExhangeRates: () => Promise<void>
}

export type SettingSlice = State & Actions

export const createSettingsSlice: StateCreator<State, [], [], SettingSlice> = (set, get) => ({
  inSettingsScreen: false,
  privateMode: false,
  mainCurrency: "€",
  exchangeRates: DEFAULT_EXCHANGE_RATES,
  darkMode: document.querySelector("body")?.classList.contains("dark") ?? false,
  setMainCurrency: (mainCurrency) => set({ mainCurrency }),
  setInSettingsScreen: (em: boolean) => set({ inSettingsScreen: em }),
  toggleDarkMode: () => {
    set({ darkMode: !get().darkMode })
  },
  togglePrivateMode: () => {
    set({ privateMode: !get().privateMode })
  },
  fetchExhangeRates: async () => {
    try {
      const exchangeRates = await fetchAllRates()
      set({ exchangeRates })
    } catch (error) {
      console.error(error)
      showErrorToast("Error retriving exchange rates, using default ones...", () => {})
    }
  },
})
