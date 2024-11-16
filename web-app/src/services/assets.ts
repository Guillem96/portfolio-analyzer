import type { Asset, Event } from "@/types.d"
import { request } from "./base"

export const fetchAssets = async (): Promise<Asset[]> => {
  const assetsResponse = await request("assets/", "GET")
  return assetsResponse.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (rawAsset: any) =>
      ({
        name: rawAsset.name,
        ticker: {
          ticker: rawAsset.ticker.ticker,
          name: rawAsset.ticker.name,
          isEtf: rawAsset.ticker.is_etf,
          price: rawAsset.ticker.price,
          yearlyDividendYield: rawAsset.ticker.yearly_dividend_yield,
          yearlyDividendValue: rawAsset.ticker.yearly_dividend_value,
          nextDividendYield: rawAsset.ticker.next_dividend_yield,
          nextDividendValue: rawAsset.ticker.next_dividend_value,
          currency: rawAsset.ticker.currency,
          exDividendDate: new Date(rawAsset.ticker.ex_dividend_date),
          earningDates: rawAsset.ticker.earning_dates.map((d: number) => new Date(d)),
          sector: rawAsset.ticker.sector,
          website: rawAsset.ticker.website,
          country: rawAsset.ticker.country,
        },
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

export const fetchEvents = async (): Promise<Record<string, Event[]>> => {
  return await request("assets/events/", "GET")
}