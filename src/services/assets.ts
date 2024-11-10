import type { Asset } from "@/types.d"
import { request } from "./base"

export const fetchAssets = async (): Promise<Asset[]> => {
  const assetsResponse = await request("assets/", "GET")
  return assetsResponse.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (rawAsset: any) =>
      ({
        name: rawAsset.name,
        ticker: rawAsset.ticker.ticker,
        buyValue: rawAsset.buyValue,
        value: rawAsset.value,
        units: rawAsset.units,
        country: rawAsset.country,
        sector: rawAsset.sector,
        avgPrice: rawAsset.averageStockPrice,
        currency: rawAsset.currency,
      }) as Asset,
  )
}
