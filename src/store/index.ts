import { create } from "zustand"
import { AssetSlice, createAssetsSlice } from "./assets"
import { InvestmentSlice, createInvestmentSlice } from "./investments"
import { SettingSlice, createSettingsSlice } from "./settings"
import { persist } from "zustand/middleware"
import { createDividendSlice, DividendSlice } from "./dividends"

export const useBoundStore = create<AssetSlice & InvestmentSlice & SettingSlice & DividendSlice>()(
  persist(
    (...a) => ({
      ...createSettingsSlice(...a),
      ...createInvestmentSlice(...a),
      ...createAssetsSlice(...a),
      ...createDividendSlice(...a),
    }),
    {
      name: "json-bin-settings",
      partialize: (state) => ({
        jsonBinAccessKey: state.jsonBinAccessKey,
        jsonBinId: state.jsonBinId,
        darkMode: state.darkMode,
      }),
      onRehydrateStorage(state) {
        console.log(state.darkMode)
        if (!state.darkMode) {
          document.querySelector("body")?.classList.toggle("dark")
        }
      },
    },
  ),
)
