import { create } from "zustand"
import { AssetSlice, createAssetsSlice } from "./assets"
import { BuySlice, createBuySlice } from "./buys"
import { SettingSlice, createSettingsSlice } from "./settings"
import { persist } from "zustand/middleware"
import { createDividendSlice, DividendSlice } from "./dividends"

export const useBoundStore = create<AssetSlice & BuySlice & SettingSlice & DividendSlice>()(
  persist(
    (...a) => ({
      ...createSettingsSlice(...a),
      ...createBuySlice(...a),
      ...createAssetsSlice(...a),
      ...createDividendSlice(...a),
    }),
    {
      name: "json-bin-settings",
      partialize: (state) => ({
        jsonBinAccessKey: state.jsonBinAccessKey,
        jsonBinId: state.jsonBinId,
        darkMode: state.darkMode,
        privateMode: state.privateMode,
      }),
    },
  ),
)
