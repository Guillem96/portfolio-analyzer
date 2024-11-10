import { CurrencyType } from "@/types"
import { StateCreator } from "zustand"

interface State {
  inSettingsScreen: boolean
  darkMode: boolean
  privateMode: boolean
  mainCurrency: CurrencyType
}

interface Actions {
  setInSettingsScreen: (em: boolean) => void
  toggleDarkMode: () => void
  togglePrivateMode: () => void
  setMainCurrency: (mainCurrency: CurrencyType) => void
}

export type SettingSlice = State & Actions

export const createSettingsSlice: StateCreator<State, [], [], SettingSlice> = (set, get) => ({
  inSettingsScreen: false,
  privateMode: false,
  mainCurrency: "€",
  darkMode: document.querySelector("body")?.classList.contains("dark") ?? false,
  setMainCurrency: (mainCurrency) => set({ mainCurrency }),
  setInSettingsScreen: (em: boolean) => set({ inSettingsScreen: em }),
  toggleDarkMode: () => {
    set({ darkMode: !get().darkMode })
  },
  togglePrivateMode: () => {
    set({ privateMode: !get().privateMode })
  },
})
