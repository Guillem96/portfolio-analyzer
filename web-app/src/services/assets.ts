import type { Asset, Event, PortfolioHistoricEntry } from "@/types.d"
import { request } from "./base"
import { parse } from "date-fns"
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
          changeRate: rawAsset.ticker.change_rate,
          monthlyPriceRange: rawAsset.ticker.monthly_price_range,
          yearlyPriceRange: rawAsset.ticker.yearly_price_range,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          historicalData: rawAsset.ticker.historical_data.map((d: any) => ({
            date: parse(d.date, "yyyy-MM-dd", new Date()),
            price: d.price,
          })),
        },
        buyValue: rawAsset.buyValue,
        value: rawAsset.value,
        units: rawAsset.units,
        country: rawAsset.country,
        sector: rawAsset.sector,
        avgPrice: rawAsset.averageStockPrice,
        currency: rawAsset.currency,
        yieldWithRespectBuy: rawAsset.yieldWithRespectBuy,
        yieldWithRespectValue: rawAsset.yieldWithRespectValue,
        lastBuyDate: new Date(rawAsset.lastBuyDate),
      }) as Asset,
  )
}

export const fetchEvents = async (): Promise<Record<string, Event[]>> => {
  return await request("assets/events/", "GET")
}

export const fetchHistoricalData = async (): Promise<PortfolioHistoricEntry[]> => {
  const response = await request("assets/historic/", "GET")
  return response.map((data: Record<string, number>) => {
    const date = new Date(data.date)
    return { ...data, date }
  })
}
