import { JSONBinSettings } from "@/types"
import { StateCreator } from "zustand"

interface State {
  inSettingsScreen: boolean
  darkMode: boolean
  privateMode: boolean
  jsonBinAccessKey: string | null
  jsonBinId: string | null
}

interface Actions {
  setJsonBin: (accessKey: string, jsonBinId: string) => void
  getJsonBinSettings: () => JSONBinSettings | null
  setInSettingsScreen: (em: boolean) => void
  toggleDarkMode: () => void
  togglePrivateMode: () => void
}

export type SettingSlice = State & Actions

export const createSettingsSlice: StateCreator<State, [], [], SettingSlice> = (set, get) => ({
  jsonBinAccessKey: null,
  jsonBinId: null,
  inSettingsScreen: false,
  privateMode: false,
  darkMode: document.querySelector("body")?.classList.contains("dark") ?? false,
  setJsonBin: (accessKey, jsonBinId) => {
    set({ jsonBinAccessKey: accessKey, jsonBinId })
  },
  getJsonBinSettings: () => {
    const { jsonBinAccessKey, jsonBinId } = get()
    if (jsonBinAccessKey == null || jsonBinId == null) {
      return null
    }
    return { accessKey: jsonBinAccessKey, binId: jsonBinId }
  },
  setInSettingsScreen: (em: boolean) => set({ inSettingsScreen: em }),
  toggleDarkMode: () => {
    set({ darkMode: !get().darkMode })
  },
  togglePrivateMode: () => {
    set({ privateMode: !get().privateMode })
  },
})
