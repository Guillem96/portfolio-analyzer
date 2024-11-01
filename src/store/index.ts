import { create } from "zustand"
import { AssetSlice, createAssetsSlice } from "./assets"
import { BuySlice, createBuySlice } from "./buys"
import { SettingSlice, createSettingsSlice } from "./settings"
import { persist } from "zustand/middleware"
import { createDividendSlice, DividendSlice } from "./dividends"
import { createTickerSlice, TickerSlice } from "./tickers"

export const useBoundStore = create<AssetSlice & BuySlice & SettingSlice & DividendSlice & TickerSlice>()(
  persist(
    (...a) => ({
      ...createSettingsSlice(...a),
      ...createBuySlice(...a),
      ...createAssetsSlice(...a),
      ...createDividendSlice(...a),
      ...createTickerSlice(...a),
    }),
    {
      name: "json-bin-settings",
      partialize: (state) => ({
        darkMode: state.darkMode,
        privateMode: state.privateMode,
      }),
    },
  ),
)
