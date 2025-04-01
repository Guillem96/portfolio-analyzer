import { create } from "zustand"
import { AssetSlice, createAssetsSlice } from "./assets"
import { BuySlice, createBuySlice } from "./buys"
import { SettingSlice, createSettingsSlice } from "./settings"
import { persist } from "zustand/middleware"
import { createDividendSlice, DividendSlice } from "./dividends"
import { createTickerSlice, TickerSlice } from "./tickers"
import { createUserSlice, UserSlice } from "./user"
import { createSellSlice, SellSlice } from "./sells"

export const useBoundStore = create<
  AssetSlice & BuySlice & SettingSlice & DividendSlice & TickerSlice & UserSlice & SellSlice
>()(
  persist(
    (...a) => ({
      ...createSettingsSlice(...a),
      ...createBuySlice(...a),
      ...createAssetsSlice(...a),
      ...createDividendSlice(...a),
      ...createTickerSlice(...a),
      ...createUserSlice(...a),
      ...createSellSlice(...a),
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
