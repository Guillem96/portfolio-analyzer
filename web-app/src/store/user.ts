import { fetchCurrentUser, logout, updatePreferences } from "@/services/users"
import { showErrorToast } from "@/services/utils"
import { CurrencyType, User } from "@/types"
import { StateCreator } from "zustand"
import { SettingSlice } from "./settings"

interface State {
  user: User | null
}

interface Actions {
  login: () => Promise<User | null>
  logout: () => Promise<void>
  updatePreferences: (preferredCurrency: CurrencyType) => Promise<void>
}

export type UserSlice = State & Actions

export const createUserSlice: StateCreator<State & SettingSlice, [], [], UserSlice> = (set, get) => ({
  user: null,
  isLoggingIn: false,
  login: async () => {
    try {
      const user = await fetchCurrentUser()
      if (!user) {
        set({ user: null })
        return null
      }
      set({ user, mainCurrency: user?.preferredCurrency })
      return user
    } catch (error) {
      console.error(error)
      set({ user: null })
      showErrorToast("Error fetching user...", () => set({ user: null }))
    }
    return null
  },
  updatePreferences: async (preferredCurrency: CurrencyType) => {
    const { user, mainCurrency } = get()
    if (!user) return
    set({ user: { ...user, preferredCurrency }, mainCurrency: preferredCurrency })

    try {
      await updatePreferences(preferredCurrency)
      set((state) => {
        if (!state.user) return state
        return { user: { ...state.user, preferredCurrency }, mainCurrency: preferredCurrency }
      })
    } catch (error) {
      console.error(error)
      set({ user, mainCurrency })
      showErrorToast("Error updating preferences...", () => set({ user }))
    }
  },
  logout: async () => {
    try {
      await logout()
      set({ user: null })
    } catch (error) {
      console.error(error)
      showErrorToast("Error logging out...", () => {})
    }
  },
})
